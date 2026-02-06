using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Services;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AIController : ControllerBase
{
    private readonly IAIOptimizationService _aiService;

    public AIController(IAIOptimizationService aiService)
    {
        _aiService = aiService;
    }

    [HttpGet("forecast/{sku}")]
    public async Task<ActionResult<double>> GetForecast(string sku, [FromQuery] DateTime targetDate)
    {
        var forecast = await _aiService.ForecastDemandAsync(sku, targetDate);
        return Ok(forecast);
    }

    [HttpPost("optimize-path")]
    public async Task<ActionResult<List<string>>> OptimizePath([FromBody] List<string> orderIds, [FromQuery] string facilityId = "FAC01")
    {
        var path = await _aiService.OptimizePickPathAsync(facilityId, orderIds);
        return Ok(path);
    }
}
