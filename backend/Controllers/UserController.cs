using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Services;
using Microsoft.Extensions.Options;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _repository;
    private readonly IPasswordService _passwordService;
    private readonly PasswordPolicy _passwordPolicy;

    public UserController(
        IUserRepository repository,
        IPasswordService passwordService,
        IOptions<PasswordPolicy> passwordPolicy)
    {
        _repository = repository;
        _passwordService = passwordService;
        _passwordPolicy = passwordPolicy.Value;
    }

    [HttpGet]
    [HasPermission("USER_READ")]
    public async Task<IEnumerable<User>> GetAll()
    {
        return await _repository.GetAllAsync();
    }

    [HttpGet("{id}")]
    [HasPermission("USER_READ")]
    public async Task<ActionResult<User>> GetById(string id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null) return NotFound();
        return user;
    }

    [HttpPost]
    [HasPermission("USER_CREATE")]
    public async Task<IActionResult> Create([FromBody] UserCreateRequest request)
    {
        try
        {
            Console.WriteLine($"[UserController.Create] Creating user: {request.Id}");
            
            // Validate password
            var (isValid, errorMessage) = _passwordService.ValidatePasswordPolicy(request.Password);
            if (!isValid)
            {
                Console.WriteLine($"[UserController.Create] Password validation failed: {errorMessage}");
                return BadRequest(new { message = errorMessage });
            }

            // Create user entity
            var user = new User
            {
                Id = request.Id,
                Name = request.Name,
                PasswordHash = _passwordService.HashPassword(request.Password),
                PasswordChangedDate = DateTime.UtcNow,
                PasswordExpiryDate = DateTime.UtcNow.AddDays(_passwordPolicy.ExpirationDays),
                MustChangePassword = true, // Force password change on first login
                FacilityId = request.FacilityId,
                Status = request.Status,
                Language = request.Language,
                Roles = request.Roles,
                AccessibleFacilities = request.AccessibleFacilities,
                AccessibleCustomers = request.AccessibleCustomers,
                LastUser = "ADMIN"
            };

            Console.WriteLine($"[UserController.Create] Password hashed. Hash length: {user.PasswordHash?.Length ?? 0}");

            await _repository.CreateAsync(user);
            
            Console.WriteLine($"[UserController.Create] User created successfully: {user.Id}");
            return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UserController.Create] Error: {ex.Message}");
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [HasPermission("USER_UPDATE")]
    public async Task<IActionResult> Update(string id, [FromBody] UserUpdateRequest request)
    {
        if (id != request.Id) return BadRequest("ID mismatch");
        
        try 
        {
            Console.WriteLine($"[UserController.Update] Updating user: {id}");
            
            // Get existing user
            var user = await _repository.GetByIdAsync(id);
            if (user == null) return NotFound();

            // Update basic fields
            user.Name = request.Name;
            user.FacilityId = request.FacilityId;
            user.Status = request.Status;
            user.Language = request.Language;
            user.Roles = request.Roles;
            user.AccessibleFacilities = request.AccessibleFacilities;
            user.AccessibleCustomers = request.AccessibleCustomers;
            user.LastUser = "ADMIN";

            // Update password if provided
            if (!string.IsNullOrEmpty(request.Password))
            {
                Console.WriteLine($"[UserController.Update] Password provided, validating and hashing...");
                
                // Validate password
                var (isValid, errorMessage) = _passwordService.ValidatePasswordPolicy(request.Password);
                if (!isValid)
                {
                    Console.WriteLine($"[UserController.Update] Password validation failed: {errorMessage}");
                    return BadRequest(new { message = errorMessage });
                }

                user.PasswordHash = _passwordService.HashPassword(request.Password);
                user.PasswordChangedDate = DateTime.UtcNow;
                user.PasswordExpiryDate = DateTime.UtcNow.AddDays(_passwordPolicy.ExpirationDays);
                
                Console.WriteLine($"[UserController.Update] Password hashed. Hash length: {user.PasswordHash?.Length ?? 0}");
            }

            var updated = await _repository.UpdateAsync(user);
            if (!updated) return NotFound();
            
            Console.WriteLine($"[UserController.Update] User updated successfully: {id}");
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[UserController.Update] Error: {ex.Message}");
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [HasPermission("USER_DISABLE")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _repository.DeleteAsync(id);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
