using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface ILicensePlateRepository
{
    Task<LicensePlate?> GetByIdAsync(string id);
    Task<IEnumerable<LicensePlate>> GetByLocationAsync(string facilityId, string location);
    Task<IEnumerable<LicensePlate>> GetBySKUAsync(string facilityId, string sku);
    Task<bool> UpdateAsync(LicensePlate plate);
    Task<string> CreateAsync(LicensePlate plate);
    Task<bool> MovePlateAsync(string plateId, string targetLocation, string lastUser);
    Task<IEnumerable<LicensePlate>> SearchAsync(PlateSearchCriteria criteria);
    Task<IEnumerable<string>> GetCustomersAsync(bool onlyActive = false);
    Task<IEnumerable<string>> GetFacilitiesAsync(bool onlyActive = false);
    Task<bool> DeleteAsync(string id, string lastUser);
}
