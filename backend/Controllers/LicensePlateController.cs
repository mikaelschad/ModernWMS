using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LicensePlateController : ControllerBase
{
    private readonly ILicensePlateRepository _repository;
    private readonly ICustomerRepository _customerRepository;

    public LicensePlateController(ILicensePlateRepository repository, ICustomerRepository customerRepository)
    {
        _repository = repository;
        _customerRepository = customerRepository;
    }

    [HttpGet("{id}")]
    [HasPermission("PLATE_READ")]
    public async Task<ActionResult<LicensePlate>> GetById(string id)
    {
        var plate = await _repository.GetByIdAsync(id);
        if (plate == null) return NotFound();
        return plate;
    }

    [HttpGet("search")]
    [HasPermission("PLATE_READ")]
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
    [HasPermission("PLATE_CREATE")]
    public async Task<ActionResult<string>> Create([FromBody] LicensePlate plate)
    {
        if (string.IsNullOrEmpty(plate.Id)) return BadRequest("License Plate ID is required");

        // Validate Receiving Rules if Customer is specified
        if (!string.IsNullOrEmpty(plate.CustomerId))
        {
            var customer = await _customerRepository.GetByIdAsync(plate.CustomerId);
            if (customer != null)
            {
                if (customer.ReceiveRule_RequireExpDate && !plate.ExpirationDate.HasValue)
                    return BadRequest($"Expiration Date is required for customer {customer.Name}");

                if (customer.ReceiveRule_RequireMfgDate && !plate.ManufactureDate.HasValue)
                    return BadRequest($"Manufacture Date is required for customer {customer.Name}");

                if (!string.IsNullOrEmpty(customer.ReceiveRule_LotValidationRegex))
                {
                    if (string.IsNullOrEmpty(plate.LotNumber))
                         return BadRequest($"Lot Number is required by customer validation rules.");
                    
                    try {
                        if (!System.Text.RegularExpressions.Regex.IsMatch(plate.LotNumber, customer.ReceiveRule_LotValidationRegex))
                            return BadRequest($"Lot Number '{plate.LotNumber}' does not match required pattern.");
                    } catch (Exception) {
                        return BadRequest($"Invalid Lot Number regex configuration for customer {customer.Name}");
                    }
                }

                if (!string.IsNullOrEmpty(customer.ReceiveRule_SerialValidationRegex))
                {
                    if (string.IsNullOrEmpty(plate.SerialNumber))
                         return BadRequest($"Serial Number is required by customer validation rules.");

                    try {
                        if (!System.Text.RegularExpressions.Regex.IsMatch(plate.SerialNumber, customer.ReceiveRule_SerialValidationRegex))
                            return BadRequest($"Serial Number '{plate.SerialNumber}' does not match required pattern.");
                    } catch (Exception) {
                         return BadRequest($"Invalid Serial Number regex configuration for customer {customer.Name}");
                    }
                }

                 if (customer.ReceiveRule_MinShelfLifeDays > 0 && plate.ExpirationDate.HasValue)
                 {
                     var daysRemaining = (plate.ExpirationDate.Value - DateTime.Now).TotalDays;
                     if (daysRemaining < customer.ReceiveRule_MinShelfLifeDays)
                        return BadRequest($"Item has {Math.Floor(daysRemaining)} days of shelf life. Minimum required is {customer.ReceiveRule_MinShelfLifeDays} days.");
                 }
            }
        }
        var existing = await _repository.GetByIdAsync(plate.Id);
        if (existing != null) return Conflict($"License Plate {plate.Id} already exists");
        plate.LastUser = User.Identity?.Name ?? "SYSTEM";
        var id = await _repository.CreateAsync(plate);
        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    [HttpPut("{id}")]
    [HasPermission("PLATE_UPDATE")]
    public async Task<IActionResult> Update(string id, [FromBody] LicensePlate plate)
    {
        if (id != plate.Id) return BadRequest("ID mismatch");
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound($"License Plate {id} not found");
        plate.LastUser = User.Identity?.Name ?? "SYSTEM";
        var success = await _repository.UpdateAsync(plate);
        if (!success) return BadRequest("Could not update plate");
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound();
 
        var lastUser = User.Identity?.Name ?? "SYSTEM";
        var success = await _repository.DeleteAsync(id, lastUser);
        if (!success) return BadRequest("Could not delete plate");
        return NoContent();
    }

    [HttpPost("move")]
    [HasPermission("INVENTORY_MOVE")]
    public async Task<IActionResult> MovePlate([FromBody] MovePlateRequest request)
    {
        var lastUser = User.Identity?.Name ?? request.User;
        var success = await _repository.MovePlateAsync(request.PlateId, request.TargetLocation, lastUser);
        if (!success) return BadRequest("Could not move plate");
        return Ok();
    }
}

public record MovePlateRequest(string PlateId, string TargetLocation, string User);
