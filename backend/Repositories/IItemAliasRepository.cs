using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface IItemAliasRepository
{
    Task<IEnumerable<ItemAlias>> GetByItemIdAsync(string itemId, string customerId);
    Task<string> CreateAsync(ItemAlias alias);
    Task<bool> DeleteAsync(Guid id, string customerId);
}
