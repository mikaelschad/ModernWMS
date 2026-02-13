using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemController : ControllerBase
{
    private readonly IItemRepository _repository;
    private readonly IItemGroupRepository _groupRepository;
    private readonly ILogger<ItemController> _logger;

    public ItemController(IItemRepository repository, IItemGroupRepository groupRepository, ILogger<ItemController> logger)
    {
        _repository = repository;
        _groupRepository = groupRepository;
        _logger = logger;
    }

    [HttpGet]
    [RequirePermission("ITEM", "READ")]
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

    [HttpGet("{id}")]
    [RequirePermission("ITEM", "READ")]
    public async Task<ActionResult<Item>> GetById(string id, [FromQuery] string customerId)
    {
        try
        {
            if (string.IsNullOrEmpty(customerId)) return BadRequest("CustomerId is required");

            var item = await _repository.GetByIdAsync(id, customerId);
            if (item == null) return NotFound();
            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching item {Id} for customer {CustId}", id, customerId);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [RequirePermission("ITEM", "CREATE")]
    public async Task<ActionResult<Item>> Create([FromBody] Item item)
    {
        try
        {
            Console.WriteLine($"[ItemController] Creating item: {item.Id} / {item.SKU}");
            
            if (string.IsNullOrEmpty(item.Id)) return BadRequest("ITEM (Id) is required");
            if (string.IsNullOrEmpty(item.CustomerId)) return BadRequest("ITEM (CustomerId) is required");
            
            // Uppercase ID and SKU to satisfy DB constraints
            item.Id = item.Id.ToUpper();
            if (!string.IsNullOrEmpty(item.SKU)) item.SKU = item.SKU.ToUpper();
            
            item.LastUser = User.Identity?.Name ?? "SYSTEM";
            
            // Template Inheritance Logic
            if (!string.IsNullOrEmpty(item.ItemGroupId))
            {
                var group = await _groupRepository.GetByIdAsync(item.ItemGroupId, item.CustomerId);
                if (group != null)
                {
                    if (string.IsNullOrEmpty(item.BaseUOM) || item.BaseUOM == "EA") item.BaseUOM = group.BaseUOM;
                    
                    if (group.TrackLotNumber) item.RequireLotNumber = true;
                    if (group.TrackSerialNumber) item.RequireSerialNumber = true;
                    if (group.TrackExpirationDate) item.RequireExpirationDate = true;
                    if (group.TrackManufactureDate) item.RequireManufactureDate = true;
                    
                    if (group.IsHazardous)
                    {
                        item.IsHazardous = true;
                        if (string.IsNullOrEmpty(item.HazardClass)) item.HazardClass = group.HazardClass;
                        if (string.IsNullOrEmpty(item.UNNumber)) item.UNNumber = group.UNNumber;
                        if (string.IsNullOrEmpty(item.PackingGroup)) item.PackingGroup = group.PackingGroup;
                    }
                    
                    if (string.IsNullOrEmpty(item.CommodityCode)) item.CommodityCode = group.CommodityCode;
                    if (string.IsNullOrEmpty(item.CountryOfOrigin)) item.CountryOfOrigin = group.CountryOfOrigin;
                    if (string.IsNullOrEmpty(item.VelocityClass)) item.VelocityClass = group.VelocityClass;
                }
            }
            
            await _repository.CreateAsync(item);
            
            Console.WriteLine($"[ItemController] Item created successfully: {item.Id}");
            return CreatedAtAction(nameof(GetById), new { id = item.Id, customerId = item.CustomerId }, item);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ItemController] Error creating item: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            _logger.LogError(ex, "Error creating item {Id}", item.Id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    [RequirePermission("ITEM", "UPDATE")]
    public async Task<IActionResult> Update(string id, [FromBody] Item item)
    {
        try
        {
            if (id != item.Id) return BadRequest("ID mismatch");
            if (string.IsNullOrEmpty(item.CustomerId)) return BadRequest("CustomerId is required");

            item.LastUser = User.Identity?.Name ?? "SYSTEM";
            var success = await _repository.UpdateAsync(item);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating item {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [RequirePermission("ITEM", "DISABLE")]
    public async Task<IActionResult> Delete(string id, [FromQuery] string customerId)
    {
        try
        {
            if (string.IsNullOrEmpty(customerId)) return BadRequest("CustomerId is required");

            var user = User.Identity?.Name ?? "SYSTEM";
            var success = await _repository.DeleteAsync(id, customerId, user);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting item {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
