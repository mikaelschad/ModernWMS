using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SectionController : ControllerBase
{
    private readonly ISectionRepository _repo;
    private readonly ILogger<SectionController> _log;

    public SectionController(ISectionRepository repo, ILogger<SectionController> log)
    {
        _repo = repo;
        _log = log;
    }

    [HttpGet]
    [HasPermission("SECTION_READ")]
    public async Task<ActionResult<IEnumerable<Section>>> GetAll()
    {
        try
        {
            return Ok(await _repo.GetAllAsync());
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error fetching sections");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id}")]
    [HasPermission("SECTION_READ")]
    public async Task<ActionResult<Section>> GetById(string id, [FromQuery] string facilityId)
    {
        try
        {
            if (string.IsNullOrEmpty(facilityId)) return BadRequest("FacilityId required");
            var s = await _repo.GetByIdAsync(id, facilityId);
            if (s == null) return NotFound();
            return Ok(s);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error fetching section {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    [HasPermission("SECTION_CREATE")]
    public async Task<ActionResult<Section>> Create([FromBody] Section s)
    {
        try
        {
            if (string.IsNullOrEmpty(s.Id)) return BadRequest("Section ID required");
            if (string.IsNullOrEmpty(s.FacilityId)) return BadRequest("Facility ID required");
            
            s.Id = s.Id.ToUpper();
            s.LastUser = User.Identity?.Name ?? "SYSTEM";
            
            await _repo.CreateAsync(s);
            return CreatedAtAction(nameof(GetById), new { id = s.Id, facilityId = s.FacilityId }, s);
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error creating section {Id}", s.Id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    [HasPermission("SECTION_UPDATE")]
    public async Task<IActionResult> Update(string id, [FromBody] Section s)
    {
        try
        {
            if (id != s.Id) return BadRequest("ID mismatch");
            if (string.IsNullOrEmpty(s.FacilityId)) return BadRequest("Facility ID required");
            
            s.LastUser = User.Identity?.Name ?? "SYSTEM";
            if (!await _repo.UpdateAsync(s)) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error updating section {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [HasPermission("SECTION_UPDATE")]
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
            _log.LogWarning(ex, "Attempted to delete section {Id} which is in use.", id);
            return Conflict($"Section '{id}' is currently in use and cannot be deleted.");
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "Error deleting section {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
