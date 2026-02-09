using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemController : ControllerBase
{
    private readonly IItemRepository _repository;
    private readonly ILogger<ItemController> _logger;

    public ItemController(IItemRepository repository, ILogger<ItemController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetAll()
    {
        try
        {
            var items = await _repository.GetAllAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching items");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{sku}")]
    public async Task<ActionResult<Item>> GetById(string sku)
    {
        try
        {
            var item = await _repository.GetByIdAsync(sku);
            if (item == null) return NotFound();
            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching item {SKU}", sku);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<Item>> Create([FromBody] Item item)
    {
        try
        {
            if (string.IsNullOrEmpty(item.SKU)) return BadRequest("SKU is required");
            await _repository.CreateAsync(item);
            return CreatedAtAction(nameof(GetById), new { sku = item.SKU }, item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating item {SKU}", item.SKU);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{sku}")]
    public async Task<IActionResult> Update(string sku, [FromBody] Item item)
    {
        try
        {
            if (sku != item.SKU) return BadRequest("SKU mismatch");
            var success = await _repository.UpdateAsync(item);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item {SKU}", sku);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{sku}")]
    public async Task<IActionResult> Delete(string sku)
    {
        try
        {
            var success = await _repository.DeleteAsync(sku);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item {SKU}", sku);
            return StatusCode(500, ex.Message);
        }
    }
}
