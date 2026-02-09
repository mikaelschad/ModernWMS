using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface IItemGroupRepository
{
    Task<IEnumerable<ItemGroup>> GetAllAsync();
    Task<ItemGroup?> GetByIdAsync(string id);
    Task<string> CreateAsync(ItemGroup itemGroup);
    Task<bool> UpdateAsync(ItemGroup itemGroup);
    Task<bool> DeleteAsync(string id);
}
