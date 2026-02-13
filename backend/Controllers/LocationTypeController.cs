using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocationTypeController : ControllerBase
{
    private readonly ILocationTypeRepository _repo;
    private readonly ILogger<LocationTypeController> _logger;

    public LocationTypeController(ILocationTypeRepository repo, ILogger<LocationTypeController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    [HasPermission("LOCATION_READ")]
    public async Task<ActionResult<IEnumerable<LocationType>>> GetAll()
    {
        try
        {
            var types = await _repo.GetAllAsync();
            return Ok(types);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching location types");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    [HasPermission("LOCATION_READ")]
    public async Task<ActionResult<LocationType>> GetById(string id)
    {
        try
        {
            var type = await _repo.GetByIdAsync(id);
            if (type == null) return NotFound();
            return Ok(type);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching location type {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    [HasPermission("LOCATION_CREATE")]
    public async Task<ActionResult<LocationType>> Create(LocationType type)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(type.Id)) return BadRequest("ID is required");

            var existing = await _repo.GetByIdAsync(type.Id);
            if (existing != null)
            {
                // Optionally reactivate if inactive, or return conflict
                if (existing.Status == "I")
                {
                    existing.Status = "A";
                    existing.Description = type.Description;
                    await _repo.UpdateAsync(existing);
                    return Ok(existing);
                }
                return Conflict("Location type already exists");
            }

            await _repo.CreateAsync(type);
            return CreatedAtAction(nameof(GetById), new { id = type.Id }, type);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating location type");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    [HasPermission("LOCATION_UPDATE")]
    public async Task<ActionResult> Update(string id, LocationType type)
    {
        try
        {
            if (id != type.Id) return BadRequest("ID mismatch");
            
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _repo.UpdateAsync(type);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating location type {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [HasPermission("LOCATION_UPDATE")]
    public async Task<ActionResult> Delete(string id)
    {
        // Core system types that cannot be deleted
        var coreTypes = new HashSet<string> { "DMG", "DOR", "PND", "PF", "QC", "RET", "STG", "STO" };
        if (coreTypes.Contains(id))
        {
            return BadRequest($"'{id}' is a core system location type and cannot be deleted.");
        }

        try
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _repo.DeleteAsync(id);
            return NoContent();
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number == 547) // FK Violation
        {
            _logger.LogWarning(ex, "Attempted to delete location type {Id} which is in use.", id);
            return Conflict($"Location Type '{id}' is currently in use and cannot be deleted.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting location type {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
