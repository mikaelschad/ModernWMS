using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Attributes;
using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class RoleController : ControllerBase
{
    private readonly IRoleRepository _repository;
    private readonly IAuditRepository _auditRepository;

    public RoleController(IRoleRepository repository, IAuditRepository auditRepository)
    {
        _repository = repository;
        _auditRepository = auditRepository;
    }

    [HttpGet]
    [HasPermission("ROLE_READ")]
    public async Task<ActionResult<IEnumerable<Role>>> GetAll()
    {
        return Ok(await _repository.GetAllAsync());
    }

    [HttpGet("permissions")]
    [HasPermission("ROLE_READ")]
    public async Task<ActionResult<IEnumerable<Permission>>> GetAllPermissions()
    {
        return Ok(await _repository.GetAllPermissionsAsync());
    }

    [HttpGet("{roleId}/permissions")]
    [HasPermission("ROLE_READ")]
    public async Task<ActionResult<IEnumerable<string>>> GetRolePermissions(string roleId)
    {
        return Ok(await _repository.GetPermissionsForRoleAsync(roleId));
    }

    [HttpPost("{roleId}/permissions")]
    [HasPermission("ROLE_UPDATE")]
    public async Task<IActionResult> UpdateRolePermissions(string roleId, [FromBody] List<string> permissionIds)
    {
        var oldPermissions = await _repository.GetPermissionsForRoleAsync(roleId);
        var success = await _repository.UpdateRolePermissionsAsync(roleId, permissionIds);
        if (!success) return BadRequest("Failed to update permissions");

        await _auditRepository.CreateAsync(new AuditLog {
            TableName = "ROLE_PERMISSIONS",
            RecordId = roleId,
            Action = "UPDATE",
            OldValues = string.Join(",", oldPermissions),
            NewValues = string.Join(",", permissionIds),
            ChangedBy = User.Identity?.Name ?? "SYSTEM"
        });

        return NoContent();
    }
}
