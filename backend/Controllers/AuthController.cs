using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.DTOs;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Services;
using Microsoft.Extensions.Options;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IUserRepository _repository;
    private readonly IPasswordService _passwordService;
    private readonly PasswordPolicy _passwordPolicy;
    private readonly IAuditRepository _auditRepository;

    public AuthController(
        IConfiguration config, 
        IUserRepository repository,
        IPasswordService passwordService,
        IOptions<PasswordPolicy> passwordPolicy,
        IAuditRepository auditRepository)
    {
        _config = config;
        _repository = repository;
        _passwordService = passwordService;
        _passwordPolicy = passwordPolicy.Value;
        _auditRepository = auditRepository;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _repository.GetByIdAsync(request.Username);
        
        if (user == null)
        {
            await _auditRepository.CreateAsync(new AuditLog {
                TableName = "USER",
                RecordId = request.Username,
                Action = "LOGIN_FAIL",
                NewValues = "User not found",
                ChangedBy = request.Username
            });
            return Unauthorized(new { message = "Invalid username or password" });
        }

        // Check if account is locked
        if (user.LockedUntil.HasValue && user.LockedUntil.Value > DateTime.UtcNow)
        {
            var remainingMinutes = Math.Ceiling((user.LockedUntil.Value - DateTime.UtcNow).TotalMinutes);
            return Unauthorized(new { message = $"Account is locked. Try again in {remainingMinutes} minutes." });
        }

        // Verify password using BCrypt
        bool isPasswordValid = false;
        
        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            isPasswordValid = _passwordService.VerifyPassword(request.Password, user.PasswordHash);
        }

        if (!isPasswordValid)
        {
            // Increment failed login attempts
            user.FailedLoginAttempts++;
            
            // Lock account if max attempts exceeded
            if (user.FailedLoginAttempts >= _passwordPolicy.MaxFailedAttempts)
            {
                user.LockedUntil = DateTime.UtcNow.AddMinutes(_passwordPolicy.LockoutMinutes);
                await _repository.UpdateAsync(user);
                return Unauthorized(new { message = $"Account locked due to too many failed attempts. Try again in {_passwordPolicy.LockoutMinutes} minutes." });
            }
            
            await _repository.UpdateAsync(user);
            await _auditRepository.CreateAsync(new AuditLog {
                TableName = "USER",
                RecordId = request.Username,
                Action = "LOGIN_FAIL",
                NewValues = "Invalid password",
                ChangedBy = request.Username
            });
            return Unauthorized(new { message = "Invalid username or password" });
        }

        // Successful login - reset failed attempts and update last login
        user.FailedLoginAttempts = 0;
        user.LockedUntil = null;
        user.LastLoginDate = DateTime.UtcNow;
        await _repository.UpdateAsync(user);

        // Check password expiration
        bool passwordExpired = _passwordService.IsPasswordExpired(user);

        var token = GenerateToken(user, passwordExpired);

        await _auditRepository.CreateAsync(new AuditLog {
            TableName = "USER",
            RecordId = user.Id,
            Action = "LOGIN_SUCCESS",
            ChangedBy = user.Id
        });
        
        return Ok(new { 
            token, 
            name = user.Name, 
            roles = user.Roles,
            permissions = user.Permissions,
            mustChangePassword = user.MustChangePassword,
            passwordExpired = passwordExpired
        });
    }

    [HttpPost("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _repository.GetByIdAsync(userId);
        if (user == null) return Unauthorized();

        // 1. Verify current password
        if (string.IsNullOrEmpty(user.PasswordHash) || !_passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect" });
        }

        // 2. Validate new password policy
        var (isValid, errorMessage) = _passwordService.ValidatePasswordPolicy(request.NewPassword);
        if (!isValid)
        {
            return BadRequest(new { message = errorMessage });
        }

        // 3. Check history
        if (!await _passwordService.CheckPasswordHistoryAsync(userId, request.NewPassword))
        {
            return BadRequest(new { message = "You cannot use a recently used password" });
        }

        // 4. Archive current password
        await _passwordService.AddPasswordHistoryAsync(userId, user.PasswordHash);

        // 5. Update User
        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        user.PasswordChangedDate = DateTime.UtcNow;
        user.MustChangePassword = false;
        user.LockedUntil = null;
        user.FailedLoginAttempts = 0;
        
        // Expiry logic (if policy dictates)
        if (_passwordPolicy.ExpirationDays > 0)
        {
            user.PasswordExpiryDate = DateTime.UtcNow.AddDays(_passwordPolicy.ExpirationDays);
        }
        else
        {
            user.PasswordExpiryDate = null;
        }

        await _repository.UpdateAsync(user);

        await _auditRepository.CreateAsync(new AuditLog {
            TableName = "USER",
            RecordId = user.Id,
            Action = "CHANGE_PASSWORD",
            ChangedBy = user.Id
        });

        return Ok(new { message = "Password changed successfully" });
    }

    private string GenerateToken(User user, bool passwordExpired = false)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha512);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("must_change_password", user.MustChangePassword.ToString()),
            new Claim("password_expired", passwordExpired.ToString())
        };

        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        foreach (var permission in user.Permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        // Get expiration from config or use default
        var expirationMinutes = _config.GetValue<int>("Jwt:ExpirationMinutes", 60);

        var token = new JwtSecurityToken(_config["Jwt:Issuer"],
            _config["Jwt:Audience"],
            claims,
            expires: DateTime.Now.AddMinutes(expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}


