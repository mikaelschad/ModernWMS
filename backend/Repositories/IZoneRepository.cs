using ModernWMS.Backend.Models;
namespace ModernWMS.Backend.Repositories;
public interface IZoneRepository
{
    Task<IEnumerable<Zone>> GetAllAsync();
    Task<Zone?> GetByIdAsync(string id, string facilityId);
    Task<string> CreateAsync(Zone zone);
    Task<bool> UpdateAsync(Zone zone);
    Task<bool> DeleteAsync(string id, string facilityId);
}
