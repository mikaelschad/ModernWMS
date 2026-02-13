using ModernWMS.Backend.Models;
namespace ModernWMS.Backend.Repositories;
public interface ISectionRepository
{
    Task<IEnumerable<Section>> GetAllAsync();
    Task<Section?> GetByIdAsync(string id, string facilityId);
    Task<string> CreateAsync(Section section);
    Task<bool> UpdateAsync(Section section);
    Task<bool> DeleteAsync(string id, string facilityId);
}
