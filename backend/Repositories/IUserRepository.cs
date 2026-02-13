using ModernWMS.Backend.Models;

namespace ModernWMS.Backend.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> AuthenticateAsync(string username, string password);
    Task<IEnumerable<User>> GetAllAsync();
    Task<string> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<bool> DeleteAsync(string id);
}
