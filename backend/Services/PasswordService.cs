using ModernWMS.Backend.Models;
using Microsoft.Extensions.Options;

namespace ModernWMS.Backend.Services;

public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    (bool isValid, string errorMessage) ValidatePasswordPolicy(string password);
    bool IsPasswordExpired(User user);
    Task<bool> CheckPasswordHistoryAsync(string userId, string newPassword);
    Task AddPasswordHistoryAsync(string userId, string passwordHash);
}

public class PasswordService : IPasswordService
{
    private readonly PasswordPolicy _policy;
    private readonly IConfiguration _configuration;

    public PasswordService(IOptions<PasswordPolicy> policy, IConfiguration configuration)
    {
        _policy = policy.Value;
        _configuration = configuration;
    }

    public string HashPassword(string password)
    {
        // Use work factor of 12 (good balance of security and performance)
        return BCrypt.Net.BCrypt.HashPassword(password, 12);
    }

    public bool VerifyPassword(string password, string hash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch
        {
            return false;
        }
    }

    public (bool isValid, string errorMessage) ValidatePasswordPolicy(string password)
    {
        if (string.IsNullOrEmpty(password))
            return (false, "Password is required");

        if (password.Length < _policy.MinimumLength)
            return (false, $"Password must be at least {_policy.MinimumLength} characters long");

        if (_policy.RequireUppercase && !password.Any(char.IsUpper))
            return (false, "Password must contain at least one uppercase letter");

        if (_policy.RequireLowercase && !password.Any(char.IsLower))
            return (false, "Password must contain at least one lowercase letter");

        if (_policy.RequireDigit && !password.Any(char.IsDigit))
            return (false, "Password must contain at least one number");

        if (_policy.RequireSpecialChar && !password.Any(ch => !char.IsLetterOrDigit(ch)))
            return (false, "Password must contain at least one special character");

        return (true, string.Empty);
    }

    public bool IsPasswordExpired(User user)
    {
        if (user.PasswordExpiryDate == null)
            return false;

        return DateTime.UtcNow > user.PasswordExpiryDate.Value;
    }

    public async Task<bool> CheckPasswordHistoryAsync(string userId, string newPassword)
    {
        var connectionString = _configuration.GetConnectionString("LegacySqlDB");
        
        using var conn = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
        await conn.OpenAsync();

        // Get last N password hashes from history
        var query = $@"
            SELECT TOP {_policy.HistoryCount} PasswordHash 
            FROM PASSWORD_HISTORY 
            WHERE UserId = @userId 
            ORDER BY ChangedDate DESC";

        using var cmd = new Microsoft.Data.SqlClient.SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@userId", userId);

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var historicalHash = reader.GetString(0);
            if (VerifyPassword(newPassword, historicalHash))
            {
                return false; // Password was used before
            }
        }

        return true; // Password not in history
    }

    public async Task AddPasswordHistoryAsync(string userId, string passwordHash)
    {
        var connectionString = _configuration.GetConnectionString("LegacySqlDB");
        
        using var conn = new Microsoft.Data.SqlClient.SqlConnection(connectionString);
        await conn.OpenAsync();

        var query = @"INSERT INTO PASSWORD_HISTORY (UserId, PasswordHash) 
                      VALUES (@userId, @hash)";

        using var cmd = new Microsoft.Data.SqlClient.SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@userId", userId);
        cmd.Parameters.AddWithValue("@hash", passwordHash);

        await cmd.ExecuteNonQueryAsync();
    }
}
