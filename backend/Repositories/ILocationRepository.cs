using ModernWMS.Backend.Models;
namespace ModernWMS.Backend.Repositories;
public interface ILocationRepository{Task<IEnumerable<Location>> GetAllAsync();Task<Location?> GetByIdAsync(string id);Task<string> CreateAsync(Location location);Task<bool> UpdateAsync(Location location);Task<bool> DeleteAsync(string id);}
