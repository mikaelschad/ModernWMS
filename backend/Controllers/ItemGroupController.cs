using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemGroupController : ControllerBase
{
    private readonly IItemGroupRepository _repository;
    private readonly ILogger<ItemGroupController> _logger;

    public ItemGroupController(IItemGroupRepository repository, ILogger<ItemGroupController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    [HasPermission("ITEMGROUP_READ")]
    public async Task<ActionResult<IEnumerable<ItemGroup>>> GetAll()
    {
        try
        {
            var items = await _repository.GetAllAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching item groups");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id}")]
    [HasPermission("ITEMGROUP_READ")]
    public async Task<ActionResult<ItemGroup>> GetById(string id, [FromQuery] string customerId)
    {
        try
        {
            if (string.IsNullOrEmpty(customerId)) return BadRequest("CustomerId is required");
            
            var itemGroup = await _repository.GetByIdAsync(id, customerId);
            if (itemGroup == null) return NotFound();
            return Ok(itemGroup);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching item group {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [HasPermission("ITEMGROUP_CREATE")]
    public async Task<ActionResult<ItemGroup>> Create([FromBody] ItemGroup itemGroup)
    {
        try
        {
            _logger.LogInformation("Received POST request to create item group");
            
            if (string.IsNullOrEmpty(itemGroup.Id)) return BadRequest("Item Group ID is required");
            if (string.IsNullOrEmpty(itemGroup.CustomerId)) return BadRequest("CustomerId is required");
            
            // Auto-uppercase ID
            itemGroup.Id = itemGroup.Id.ToUpper();
            itemGroup.LastUser = User.Identity?.Name ?? "SYSTEM";
            
            await _repository.CreateAsync(itemGroup);
            
            return CreatedAtAction(nameof(GetById), new { id = itemGroup.Id, customerId = itemGroup.CustomerId }, itemGroup);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating item group {Id}", itemGroup?.Id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    [HasPermission("ITEMGROUP_UPDATE")]
    public async Task<IActionResult> Update(string id, [FromBody] ItemGroup itemGroup)
    {
        try
        {
            if (id != itemGroup.Id) return BadRequest("ID mismatch");
            if (string.IsNullOrEmpty(itemGroup.CustomerId)) return BadRequest("CustomerId is required");
            
            itemGroup.LastUser = User.Identity?.Name ?? "SYSTEM";
            
            var success = await _repository.UpdateAsync(itemGroup);
            if (!success) return NotFound();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item group {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [HasPermission("ITEMGROUP_UPDATE")]
    public async Task<IActionResult> Delete(string id, [FromQuery] string customerId)
    {
        try
        {
            if (string.IsNullOrEmpty(customerId)) return BadRequest("CustomerId is required");
            
            var success = await _repository.DeleteAsync(id, customerId);
            if (!success) return NotFound();
            
            return NoContent();
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number == 547)
        {
            _logger.LogWarning(ex, "Attempted to delete item group {Id} which is in use.", id);
            return Conflict($"Item Group '{id}' is currently in use and cannot be deleted.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item group {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
