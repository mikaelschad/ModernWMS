using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ZoneController : ControllerBase
{
    private readonly IZoneRepository _repo;
    private readonly ILogger<ZoneController> _log;

    public ZoneController(IZoneRepository repo, ILogger<ZoneController> log)
    {
        _repo = repo;
        _log = log;
    }

    [HttpGet]
    [HasPermission("ZONE_READ")]
    public async Task<ActionResult<IEnumerable<Zone>>> GetAll()
    {
        try
        {
            return Ok(await _repo.GetAllAsync());
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error fetching zones");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id}")]
    [HasPermission("ZONE_READ")]
    public async Task<ActionResult<Zone>> GetById(string id, [FromQuery] string facilityId)
    {
        try
        {
            if (string.IsNullOrEmpty(facilityId)) return BadRequest("FacilityId required");
            var z = await _repo.GetByIdAsync(id, facilityId);
            if (z == null) return NotFound();
            return Ok(z);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error fetching zone {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [HasPermission("ZONE_CREATE")]
    public async Task<ActionResult<Zone>> Create([FromBody] Zone z)
    {
        try
        {
            if (string.IsNullOrEmpty(z.Id)) return BadRequest("Zone ID required");
            if (string.IsNullOrEmpty(z.FacilityId)) return BadRequest("Facility ID required");
            
            z.Id = z.Id.ToUpper();
            z.LastUser = User.Identity?.Name ?? "SYSTEM";
            
            await _repo.CreateAsync(z);
            return CreatedAtAction(nameof(GetById), new { id = z.Id, facilityId = z.FacilityId }, z);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error creating zone {Id}", z.Id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    [HasPermission("ZONE_UPDATE")]
    public async Task<IActionResult> Update(string id, [FromBody] Zone z)
    {
        try
        {
            if (id != z.Id) return BadRequest("ID mismatch");
            if (string.IsNullOrEmpty(z.FacilityId)) return BadRequest("Facility ID required");
            
            z.LastUser = User.Identity?.Name ?? "SYSTEM";
            if (!await _repo.UpdateAsync(z)) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error updating zone {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [HasPermission("ZONE_UPDATE")]
    public async Task<IActionResult> Delete(string id, [FromQuery] string facilityId)
    {
        try
        {
            if (string.IsNullOrEmpty(facilityId)) return BadRequest("FacilityId required");
            if (!await _repo.DeleteAsync(id, facilityId)) return NotFound();
            return NoContent();
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number == 547)
        {
            _log.LogWarning(ex, "Attempted to delete zone {Id} which is in use.", id);
            return Conflict($"Zone '{id}' is currently in use and cannot be deleted.");
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error deleting zone {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
