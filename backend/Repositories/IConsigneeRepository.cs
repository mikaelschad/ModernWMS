using ModernWMS.Backend.Models;
namespace ModernWMS.Backend.Repositories;
public interface IConsigneeRepository{Task<IEnumerable<Consignee>> GetAllAsync();Task<Consignee?> GetByIdAsync(string id);Task<string> CreateAsync(Consignee consignee);Task<bool> UpdateAsync(Consignee consignee);Task<bool> DeleteAsync(string id);}
