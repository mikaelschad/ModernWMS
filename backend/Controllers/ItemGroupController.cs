using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<ItemGroup>> GetById(string id)
    {
        try
        {
            var itemGroup = await _repository.GetByIdAsync(id);
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
    public async Task<ActionResult<ItemGroup>> Create([FromBody] ItemGroup itemGroup)
    {
        try
        {
            _logger.LogInformation("Received POST request to create item group");
            _logger.LogInformation("ItemGroup data: Id={Id}, Description={Description}, CustomerId={CustomerId}, Category={Category}", 
                itemGroup.Id, itemGroup.Description, itemGroup.CustomerId, itemGroup.Category);
            
            if (string.IsNullOrEmpty(itemGroup.Id))
            {
                _logger.LogWarning("Item Group ID is empty");
                return BadRequest("Item Group ID is required");
            }
            
            _logger.LogInformation("Calling repository CreateAsync for item group {Id}", itemGroup.Id);
            await _repository.CreateAsync(itemGroup);
            _logger.LogInformation("Successfully created item group {Id}", itemGroup.Id);
            
            return CreatedAtAction(nameof(GetById), new { id = itemGroup.Id }, itemGroup);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating item group {Id}. Exception type: {ExceptionType}, Message: {Message}, StackTrace: {StackTrace}", 
                itemGroup?.Id ?? "NULL", ex.GetType().Name, ex.Message, ex.StackTrace);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] ItemGroup itemGroup)
    {
        try
        {
            if (id != itemGroup.Id) return BadRequest("ID mismatch");
            
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
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var success = await _repository.DeleteAsync(id);
            if (!success) return NotFound();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item group {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
