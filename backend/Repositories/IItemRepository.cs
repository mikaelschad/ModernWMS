using ModernWMS.Backend.Models;
namespace ModernWMS.Backend.Repositories;
public interface IItemRepository{Task<IEnumerable<Item>> GetAllAsync();Task<Item?> GetByIdAsync(string sku);Task<string> CreateAsync(Item item);Task<bool> UpdateAsync(Item item);Task<bool> DeleteAsync(string sku);}
