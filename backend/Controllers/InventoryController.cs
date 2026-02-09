using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.DTOs;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly ModernWMS.Backend.Repositories.ILegacyInventoryRepository _legacyRepo;

    public InventoryController(ModernWMS.Backend.Repositories.ILegacyInventoryRepository legacyRepo)
    {
        _legacyRepo = legacyRepo;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetSummary()
    {
        var legacyItems = await _legacyRepo.GetLegacyInventoryAsync();
        
        var modernItems = legacyItems.Select(i => new InventoryItemDto
        {
            Sku = i.SKU,
            Quantity = i.Quantity,
            Location = i.LocationCode,
            FacilityId = i.FacilityId
        }).ToList();

        // Add some local "modern" items for demonstration
        modernItems.Add(new InventoryItemDto { Sku = "MOD-001", Quantity = 10, Location = "M-01-A", FacilityId = "FAC-MOD" });

        return Ok(modernItems);
    }
}
