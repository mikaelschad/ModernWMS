using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface IFacilityRepository
{
    Task<IEnumerable<Facility>> GetAllAsync();
    Task<Facility?> GetByIdAsync(string id);
    Task<string> CreateAsync(Facility facility);
    Task<bool> UpdateAsync(Facility facility);
    Task<bool> DeleteAsync(string id);
}
