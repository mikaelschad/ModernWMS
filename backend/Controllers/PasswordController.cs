using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Services;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using ModernWMS.Backend.DTOs;

using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PasswordController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordService _passwordService;
    private readonly PasswordPolicy _passwordPolicy;
    private readonly IConfiguration _configuration;

    public PasswordController(
        IUserRepository userRepository,
        IPasswordService passwordService,
        IOptions<PasswordPolicy> passwordPolicy,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _passwordService = passwordService;
        _passwordPolicy = passwordPolicy.Value;
        _configuration = configuration;
    }

    [HttpGet("policy")]
    public IActionResult GetPasswordPolicy()
    {
        return Ok(_passwordPolicy);
    }

    [HttpPost("change")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return NotFound();

        // Verify current password
        bool isCurrentPasswordValid = !string.IsNullOrEmpty(user.PasswordHash) 
            && _passwordService.VerifyPassword(request.CurrentPassword, user.PasswordHash);

        if (!isCurrentPasswordValid)
            return BadRequest(new { message = "Current password is incorrect" });

        // Validate new password against policy
        var (isValid, errorMessage) = _passwordService.ValidatePasswordPolicy(request.NewPassword);
        if (!isValid)
            return BadRequest(new { message = errorMessage });

        // Check password history
        var isPasswordReused = await _passwordService.CheckPasswordHistoryAsync(userId, request.NewPassword);
        if (!isPasswordReused)
            return BadRequest(new { message = $"Password cannot be one of your last {_passwordPolicy.HistoryCount} passwords" });

        // Update password
        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        user.PasswordChangedDate = DateTime.UtcNow;
        user.PasswordExpiryDate = DateTime.UtcNow.AddDays(_passwordPolicy.ExpirationDays);
        user.MustChangePassword = false;

        await _userRepository.UpdateAsync(user);

        // Add to password history
        await AddToPasswordHistoryAsync(userId, user.PasswordHash);

        return Ok(new { message = "Password changed successfully"});
    }

    [HasPermission("USER_UPDATE")]
    [HttpPost("reset/{userId}")]
    public async Task<IActionResult> ResetPassword(string userId, [FromBody] ResetPasswordRequest request)
    {
        Console.WriteLine($"[ResetPassword] Starting password reset for user: {userId}");
        
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            Console.WriteLine($"[ResetPassword] User not found: {userId}");
            return NotFound();
        }

        Console.WriteLine($"[ResetPassword] User found. Current PasswordHash: {(string.IsNullOrEmpty(user.PasswordHash) ? "EMPTY" : "EXISTS")}");

        // Validate new password against policy
        var (isValid, errorMessage) = _passwordService.ValidatePasswordPolicy(request.NewPassword);
        if (!isValid)
        {
            Console.WriteLine($"[ResetPassword] Password validation failed: {errorMessage}");
            return BadRequest(new { message = errorMessage });
        }

        Console.WriteLine($"[ResetPassword] Password validation passed. Hashing password...");

        // Set new password and force change on next login
        user.PasswordHash = _passwordService.HashPassword(request.NewPassword);
        
        Console.WriteLine($"[ResetPassword] Password hashed. Hash length: {(user.PasswordHash?.Length ?? 0)}");
        Console.WriteLine($"[ResetPassword] Hash starts with: {(user.PasswordHash != null && user.PasswordHash.Length > 0 ? user.PasswordHash.Substring(0, Math.Min(10, user.PasswordHash.Length)) : "NULL")}");
        
        user.PasswordChangedDate = DateTime.UtcNow;
        user.PasswordExpiryDate = DateTime.UtcNow.AddDays(_passwordPolicy.ExpirationDays);
        user.MustChangePassword = true;

        Console.WriteLine($"[ResetPassword] Updating user in database...");
        await _userRepository.UpdateAsync(user);
        
        Console.WriteLine($"[ResetPassword] User updated. Adding to password history...");

        // Add to password history
        await AddToPasswordHistoryAsync(userId, user.PasswordHash);

        Console.WriteLine($"[ResetPassword] Password reset completed successfully for user: {userId}");
        return Ok(new { message = $"Password reset for user {userId}. User must change password on next login." });
    }

    private async Task AddToPasswordHistoryAsync(string userId, string? passwordHash)
    {
        if (string.IsNullOrEmpty(passwordHash))
        {
            Console.WriteLine($"[AddToPasswordHistory] WARNING: passwordHash is null or empty for user {userId}");
            return;
        }
        
        var connectionString = _configuration.GetConnectionString("LegacySqlDB");
        
        using var conn = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
        await conn.OpenAsync();

        var query = @"
            INSERT INTO PASSWORD_HISTORY (UserId, PasswordHash, ChangedDate)
            VALUES (@userId, @passwordHash, GETUTCDATE())";

        using var cmd = new Microsoft.Data.SqlClient.SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@userId", userId);
        cmd.Parameters.AddWithValue("@passwordHash", passwordHash);

        await cmd.ExecuteNonQueryAsync();
    }
}


