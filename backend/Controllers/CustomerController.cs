using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomerController : ControllerBase
{
    private readonly ICustomerRepository _repository;
    private readonly ILogger<CustomerController> _logger;

    public CustomerController(ICustomerRepository repository, ILogger<CustomerController> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetAll()
    {
        try
        {
            var customers = await _repository.GetAllAsync();
            return Ok(customers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching customers");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Customer>> GetById(string id)
    {
        try
        {
            var customer = await _repository.GetByIdAsync(id);
            if (customer == null) return NotFound();
            return Ok(customer);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching customer {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost]
    public async Task<ActionResult<Customer>> Create([FromBody] Customer customer)
    {
        try
        {
            _logger.LogInformation("Received POST request to create customer");
            _logger.LogInformation("Customer data: Id={Id}, Name={Name}, Address1={Address1}, City={City}, State={State}, Phone={Phone}, Email={Email}, Status={Status}", 
                customer.Id, customer.Name, customer.Address1, customer.City, customer.State, customer.Phone, customer.Email, customer.Status);
            
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Model state is invalid");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    _logger.LogWarning("Model error: {Error}", error.ErrorMessage);
                }
                return BadRequest(ModelState);
            }
            
            if (string.IsNullOrEmpty(customer.Id))
            {
                _logger.LogWarning("Customer ID is empty");
                return BadRequest("Customer ID is required");
            }
            
            _logger.LogInformation("Calling repository CreateAsync for customer {Id}", customer.Id);
            await _repository.CreateAsync(customer);
            _logger.LogInformation("Successfully created customer {Id}", customer.Id);
            
            return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating customer {Id}. Exception type: {ExceptionType}, Message: {Message}, StackTrace: {StackTrace}", 
                customer?.Id ?? "NULL", ex.GetType().Name, ex.Message, ex.StackTrace);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Customer customer)
    {
        try
        {
            if (id != customer.Id) return BadRequest("ID mismatch");
            
            var success = await _repository.UpdateAsync(customer);
            if (!success) return NotFound();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating customer {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        try
        {
            var success = await _repository.DeleteAsync(id);
            if (!success) return NotFound();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting customer {Id}", id);
            return StatusCode(500, ex.Message);
        }
    }
}
