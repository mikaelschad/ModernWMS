using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface ILocationTypeRepository
{
    Task<IEnumerable<LocationType>> GetAllAsync();
    Task<LocationType?> GetByIdAsync(string id);
    Task<string> CreateAsync(LocationType type);
    Task<bool> UpdateAsync(LocationType type);
    Task<bool> DeleteAsync(string id);
}
