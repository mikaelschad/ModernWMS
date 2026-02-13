using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ModernWMS.Backend.Attributes;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;

namespace ModernWMS.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IAuditRepository _repository;

    public AuditController(IAuditRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    [HasPermission("AUDIT_READ")]
    public async Task<ActionResult<IEnumerable<AuditLog>>> GetAll()
    {
        return Ok(await _repository.GetAllAsync());
    }

    [HttpGet("table/{tableName}")]
    [HasPermission("AUDIT_READ")]
    public async Task<ActionResult<IEnumerable<AuditLog>>> GetByTable(string tableName)
    {
        return Ok(await _repository.GetByTableAsync(tableName));
    }

    [HttpGet("record/{tableName}/{recordId}")]
    [HasPermission("AUDIT_READ")]
    public async Task<ActionResult<IEnumerable<AuditLog>>> GetByRecord(string tableName, string recordId)
    {
        return Ok(await _repository.GetByRecordAsync(tableName, recordId));
    }
}
