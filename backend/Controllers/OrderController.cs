using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ModernWMS.Backend.DTOs;
using ModernWMS.Backend.Attributes;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/v1/orders")]
[Authorize]
public class OrderController : ControllerBase
{
    [HttpPost("inbound")]
    [HasPermission("ORDER_CREATE")]
    public IActionResult CreateInboundOrder([FromBody] InboundOrderDto order)
    {
        // Mock implementation for skeleton
        if (string.IsNullOrEmpty(order.OrderNumber))
            return BadRequest("Order number is required.");

        return CreatedAtAction(nameof(CreateInboundOrder), new { id = Guid.NewGuid() }, order);
    }
}
