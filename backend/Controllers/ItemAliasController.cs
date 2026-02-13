using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using System.Security.Claims;

namespace ModernWMS.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ItemAliasController : ControllerBase
{
    private readonly IItemAliasRepository _repository;
    private readonly IAuditRepository _audit;
    private readonly ILogger<ItemAliasController> _logger;

    public ItemAliasController(IItemAliasRepository repository, IAuditRepository audit, ILogger<ItemAliasController> logger)
    {
        _repository = repository;
        _audit = audit;
        _logger = logger;
    }

    [HttpGet("{itemId}")]
    public async Task<ActionResult<IEnumerable<ItemAlias>>> GetByItemId(string itemId, [FromQuery] string customerId)
    {
        if (string.IsNullOrEmpty(customerId)) return BadRequest("Customer Context Required");

        var aliases = await _repository.GetByItemIdAsync(itemId, customerId);
        return Ok(aliases);
    }

    [HttpPost]
    public async Task<ActionResult<string>> Create(ItemAlias alias)
    {
        if (string.IsNullOrEmpty(alias.CustomerId)) return BadRequest("Customer Context Required");
        
        alias.LastUser = User.Identity?.Name ?? "SYSTEM";
        
        try 
        {
            var id = await _repository.CreateAsync(alias);
            
            try {
                await _audit.CreateAsync(new AuditLog {
                    TableName = "ITEMALIAS",
                    RecordId = id,
                    Action = "INSERT",
                    NewValues = System.Text.Json.JsonSerializer.Serialize(alias),
                    ChangedBy = alias.LastUser
                });
            } catch (Exception auditEx) {
                _logger.LogError(auditEx, "Failed to create audit log");
            }

            return CreatedAtAction(nameof(GetByItemId), new { itemId = alias.ItemId, customerId = alias.CustomerId }, id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating alias");
            return BadRequest("Failed to create alias");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string customerId)
    {
        if (string.IsNullOrEmpty(customerId)) return BadRequest("Customer Context Required");

        var result = await _repository.DeleteAsync(id, customerId);
        if (!result) return NotFound();

        await _audit.CreateAsync(new AuditLog {
            TableName = "ITEMALIAS",
            RecordId = id.ToString(),
            Action = "DELETE",
            OldValues = $"Deleted alias ID {id} for Customer {customerId}",
            ChangedBy = User.Identity?.Name ?? "SYSTEM"
        });

        return NoContent();
    }
}
