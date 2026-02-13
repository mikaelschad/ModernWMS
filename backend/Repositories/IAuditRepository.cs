using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface IAuditRepository
{
    Task<IEnumerable<AuditLog>> GetAllAsync();
    Task<IEnumerable<AuditLog>> GetByTableAsync(string tableName);
    Task<IEnumerable<AuditLog>> GetByRecordAsync(string tableName, string recordId);
    Task<int> CreateAsync(AuditLog log);
}
