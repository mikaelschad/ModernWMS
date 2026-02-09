using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LicensePlateController : ControllerBase
{
    private readonly ILicensePlateRepository _repository;

    public LicensePlateController(ILicensePlateRepository repository)
    {
        _repository = repository;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LicensePlate>> GetById(string id)
    {
        var plate = await _repository.GetByIdAsync(id);
        if (plate == null) return NotFound();
        return plate;
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<LicensePlate>>> Search([FromQuery] PlateSearchCriteria criteria)
    {
        var results = await _repository.SearchAsync(criteria);
        return Ok(results);
    }

    [HttpGet("customers")]
    public async Task<ActionResult<IEnumerable<string>>> GetCustomers([FromQuery] bool onlyActive = false)
    {
        return Ok(await _repository.GetCustomersAsync(onlyActive));
    }

    [HttpGet("facilities")]
    public async Task<ActionResult<IEnumerable<string>>> GetFacilities([FromQuery] bool onlyActive = false)
    {
        return Ok(await _repository.GetFacilitiesAsync(onlyActive));
    }

    [HttpGet("location/{facilityId}/{location}")]
    public async Task<ActionResult<IEnumerable<LicensePlate>>> GetByLocation(string facilityId, string location)
    {
        var plates = await _repository.GetByLocationAsync(facilityId, location);
        return Ok(plates);
    }

    [HttpPost]
    public async Task<ActionResult<string>> Create([FromBody] LicensePlate plate)
    {
        if (string.IsNullOrEmpty(plate.Id)) return BadRequest("License Plate ID is required");
        var existing = await _repository.GetByIdAsync(plate.Id);
        if (existing != null) return Conflict($"License Plate {plate.Id} already exists");

        var id = await _repository.CreateAsync(plate);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] LicensePlate plate)
    {
        if (id != plate.Id) return BadRequest("ID mismatch");
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound($"License Plate {id} not found");

        var success = await _repository.UpdateAsync(plate);
        if (!success) return BadRequest("Could not update plate");
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        var success = await _repository.DeleteAsync(id);
        if (!success) return BadRequest("Could not delete plate");
        return NoContent();
    }

    [HttpPost("move")]
    public async Task<IActionResult> MovePlate([FromBody] MovePlateRequest request)
    {
        var success = await _repository.MovePlateAsync(request.PlateId, request.TargetLocation, request.User);
        if (!success) return BadRequest("Could not move plate");
        return Ok();
    }
}

public record MovePlateRequest(string PlateId, string TargetLocation, string User);
