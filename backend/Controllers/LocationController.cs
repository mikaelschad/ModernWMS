using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LocationController : ControllerBase
{
    private readonly ILocationRepository _repo;
    private readonly ILogger<LocationController> _log;

    public LocationController(ILocationRepository repo, ILogger<LocationController> log)
    {
        _repo = repo;
        _log = log;
    }

    [HttpGet]
    [HasPermission("LOCATION_READ")]
    public async Task<ActionResult<object>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string facilityId = "")
    {
        try
        {
            var (locations, total) = await _repo.GetAllAsync(page, pageSize, facilityId);
            return Ok(new { data = locations, total, page, pageSize });
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error fetching locations");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id}")]
    [HasPermission("LOCATION_READ")]
    public async Task<ActionResult<Location>> GetById(string id)
    {
        try
        {
            var l = await _repo.GetByIdAsync(id);
            if (l == null) return NotFound();
            return Ok(l);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error fetching location {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [HasPermission("LOCATION_CREATE")]
    public async Task<ActionResult<Location>> Create([FromBody] Location l)
    {
        try
        {
            if (string.IsNullOrEmpty(l.Id)) return BadRequest("Location ID required");
            await _repo.CreateAsync(l);
            return CreatedAtAction(nameof(GetById), new { id = l.Id }, l);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error creating location {Id}", l.Id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    [HasPermission("LOCATION_UPDATE")]
    public async Task<IActionResult> Update(string id, [FromBody] Location l)
    {
        try
        {
            if (id != l.Id) return BadRequest("ID mismatch");
            if (!await _repo.UpdateAsync(l)) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error updating location {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [HasPermission("LOCATION_UPDATE")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            if (!await _repo.DeleteAsync(id)) return NotFound();
            return NoContent();
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number == 547)
        {
            _log.LogWarning(ex, "Attempted to delete location {Id} which is in use.", id);
            return Conflict($"Location '{id}' is currently in use and cannot be deleted.");
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error deleting location {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
