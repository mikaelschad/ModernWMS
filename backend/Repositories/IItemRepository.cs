using ModernWMS.Backend.Models;
namespace ModernWMS.Backend.Repositories;
public interface IItemRepository
{
    Task<IEnumerable<Item>> GetAllAsync();
    Task<Item?> GetByIdAsync(string id, string customerId);
    Task<string> CreateAsync(Item item);
    Task<bool> UpdateAsync(Item item);
    Task<bool> DeleteAsync(string id, string customerId, string user);
}
