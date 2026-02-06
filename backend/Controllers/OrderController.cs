using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.DTOs;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/v1/orders")]
public class OrderController : ControllerBase
{
    [HttpPost("inbound")]
    public IActionResult CreateInboundOrder([FromBody] InboundOrderDto order)
    {
        // Mock implementation for skeleton
        if (string.IsNullOrEmpty(order.OrderNumber))
            return BadRequest("Order number is required.");

        return CreatedAtAction(nameof(CreateInboundOrder), new { id = Guid.NewGuid() }, order);
    }
}
