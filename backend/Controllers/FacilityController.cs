using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FacilityController : ControllerBase
{
    private readonly IFacilityRepository _repository;
    private readonly ILogger<FacilityController> _logger;

    public FacilityController(IFacilityRepository repository, ILogger<FacilityController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    [HasPermission("FACILITY_READ")]
    public async Task<ActionResult<IEnumerable<Facility>>> GetAll()
    {
        try 
        {
            var facilities = await _repository.GetAllAsync();
            
            // Filter by user's accessible facilities (from middleware)
            var accessibleFacilities = HttpContext.Items["AccessibleFacilities"] as List<string>;
            if (accessibleFacilities != null && accessibleFacilities.Count > 0 && !accessibleFacilities.Contains("ALL"))
            {
                facilities = facilities.Where(f => accessibleFacilities.Contains(f.Id)).ToList();
            }
            
            return Ok(facilities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching all facilities");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id}")]
    [HasPermission("FACILITY_READ")]
    public async Task<ActionResult<Facility>> GetById(string id)
    {
        try
        {
            var facility = await _repository.GetByIdAsync(id);
            if (facility == null) return NotFound();
            return Ok(facility);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching facility {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [HasPermission("FACILITY_CREATE")]
    public async Task<ActionResult<Facility>> Create([FromBody] Facility facility)
    {
        try
        {
            if (string.IsNullOrEmpty(facility.Id)) return BadRequest("Facility ID is required");
            
            await _repository.CreateAsync(facility);
            return CreatedAtAction(nameof(GetById), new { id = facility.Id }, facility);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating facility {Id}", facility.Id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    [HasPermission("FACILITY_UPDATE")]
    public async Task<IActionResult> Update(string id, [FromBody] Facility facility)
    {
        try
        {
            if (id != facility.Id) return BadRequest("ID mismatch");
            
            var success = await _repository.UpdateAsync(facility);
            if (!success) return NotFound();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating facility {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [HasPermission("FACILITY_UPDATE")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var success = await _repository.DeleteAsync(id);
            if (!success) return NotFound();
            
            return NoContent();
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Number == 547)
        {
            _logger.LogWarning(ex, "Attempted to delete facility {Id} which is in use.", id);
            return Conflict($"Facility '{id}' is currently in use and cannot be deleted.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting facility {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
