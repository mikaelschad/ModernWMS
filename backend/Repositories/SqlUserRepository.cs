using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlUserRepository : IUserRepository
{
    private readonly string _connectionString;

    public SqlUserRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("LegacySqlDB") ?? throw new InvalidOperationException("Connection string not found");
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "SELECT * FROM USERS WHERE USERID = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        
        User? user = null;
        using (var reader = await cmd.ExecuteReaderAsync())
        {
            if (await reader.ReadAsync())
            {
                user = Map(reader);
            }
        }

        if (user != null)
        {
            await LoadRelatedDataAsync(user, conn);
        }

        return user;
    }

    public async Task<User?> AuthenticateAsync(string username, string password)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        // NOTE: In production, password should be hashed. This is for local dev/demo.
        var query = "SELECT * FROM USERS WHERE USERID = @id AND PASSWORD = @pw AND STATUS = 'A'";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", username);
        cmd.Parameters.AddWithValue("@pw", password);
        
        User? user = null;
        using (var reader = await cmd.ExecuteReaderAsync())
        {
            if (await reader.ReadAsync())
            {
                user = Map(reader);
            }
        }

        if (user != null)
        {
            await LoadRelatedDataAsync(user, conn);
        }

        return user;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        var list = new List<User>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        
        var query = "SELECT * FROM USERS WHERE STATUS != 'I' ORDER BY USERID";
        using var cmd = new SqlCommand(query, conn);
        
        using (var reader = await cmd.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                list.Add(Map(reader));
            }
        }

        // For list view, maybe we don't need full details? 
        // Or we do N+1 query here? ADO.NET makes it verbose to do JOIN and map.
        // Let's populate minimal roles for list if needed, or just leave empty for now 
        // unless requested. The Plan implies "List all users" might need roles.
        // Let's do it properly.
        foreach (var user in list)
        {
            await LoadRelatedDataAsync(user, conn);
        }

        return list;
    }

    private async Task LoadRelatedDataAsync(User user, SqlConnection conn)
    {
        // Load Roles
        var roleQuery = "SELECT ROLEID FROM USER_ROLES WHERE USERID = @uid";
        using (var cmdRole = new SqlCommand(roleQuery, conn))
        {
            cmdRole.Parameters.AddWithValue("@uid", user.Id);
            using var rdr = await cmdRole.ExecuteReaderAsync();
            while (await rdr.ReadAsync()) user.Roles.Add(rdr.GetString(0));
        }

        // Load Facilities
        var facQuery = "SELECT FACILITYID FROM USER_FACILITIES WHERE USERID = @uid";
        using (var cmdFac = new SqlCommand(facQuery, conn))
        {
            cmdFac.Parameters.AddWithValue("@uid", user.Id);
            using var rdr = await cmdFac.ExecuteReaderAsync();
            while (await rdr.ReadAsync()) user.AccessibleFacilities.Add(rdr.GetString(0));
        }

        // Load Customers
        var custQuery = "SELECT CUSTOMERID FROM USER_CUSTOMERS WHERE USERID = @uid";
        using (var cmdCust = new SqlCommand(custQuery, conn))
        {
            cmdCust.Parameters.AddWithValue("@uid", user.Id);
            using var rdr = await cmdCust.ExecuteReaderAsync();
            while (await rdr.ReadAsync()) user.AccessibleCustomers.Add(rdr.GetString(0));
        }

        // Load Permissions based on roles
        if (user.Roles.Any())
        {
            var roleList = string.Join(",", user.Roles.Select((r, i) => $"@r{i}"));
            var permQuery = $"SELECT DISTINCT PERMISSIONID FROM ROLE_PERMISSIONS WHERE ROLEID IN ({roleList})";
            using (var cmdPerm = new SqlCommand(permQuery, conn))
            {
                for (int i = 0; i < user.Roles.Count; i++)
                {
                    cmdPerm.Parameters.AddWithValue($"@r{i}", user.Roles[i]);
                }
                using var rdr = await cmdPerm.ExecuteReaderAsync();
                while (await rdr.ReadAsync()) user.Permissions.Add(rdr.GetString(0));
            }
        }
    }

    public async Task<string> CreateAsync(User u)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        using var transaction = conn.BeginTransaction();

        try
        {
            var query = @"INSERT INTO USERS (USERID, NAME, PasswordHash, PasswordChangedDate, PasswordExpiryDate, MustChangePassword, FACILITY, STATUS, LANGUAGE, LASTUPDATE, LASTUSER) 
                          VALUES (@id, @name, @pwHash, @pwChanged, @pwExpiry, @mustChange, @fac, @st, @lang, GETDATE(), @usr)";
            using (var cmd = new SqlCommand(query, conn, transaction))
            {
                cmd.Parameters.AddWithValue("@id", u.Id);
                cmd.Parameters.AddWithValue("@name", u.Name);
                cmd.Parameters.AddWithValue("@pwHash", (object?)u.PasswordHash ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@pwChanged", (object?)u.PasswordChangedDate ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@pwExpiry", (object?)u.PasswordExpiryDate ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@mustChange", u.MustChangePassword);
                cmd.Parameters.AddWithValue("@fac", (object?)u.FacilityId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@st", u.Status);
                cmd.Parameters.AddWithValue("@lang", u.Language);
                cmd.Parameters.AddWithValue("@usr", u.LastUser);
                await cmd.ExecuteNonQueryAsync();
            }

            // Insert Roles
            foreach (var role in u.Roles)
            {
                var qRole = "INSERT INTO USER_ROLES (USERID, ROLEID) VALUES (@uid, @rid)";
                using var cmdRole = new SqlCommand(qRole, conn, transaction);
                cmdRole.Parameters.AddWithValue("@uid", u.Id);
                cmdRole.Parameters.AddWithValue("@rid", role);
                await cmdRole.ExecuteNonQueryAsync();
            }

            // Insert Facilities
            foreach (var fac in u.AccessibleFacilities)
            {
                var qFac = "INSERT INTO USER_FACILITIES (USERID, FACILITYID) VALUES (@uid, @fid)";
                using var cmdFac = new SqlCommand(qFac, conn, transaction);
                cmdFac.Parameters.AddWithValue("@uid", u.Id);
                cmdFac.Parameters.AddWithValue("@fid", fac);
                await cmdFac.ExecuteNonQueryAsync();
            }

            // Insert Customers
            foreach (var cust in u.AccessibleCustomers)
            {
                var qCust = "INSERT INTO USER_CUSTOMERS (USERID, CUSTOMERID) VALUES (@uid, @cid)";
                using var cmdCust = new SqlCommand(qCust, conn, transaction);
                cmdCust.Parameters.AddWithValue("@uid", u.Id);
                cmdCust.Parameters.AddWithValue("@cid", cust);
                await cmdCust.ExecuteNonQueryAsync();
            }

            transaction.Commit();
            return u.Id;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> UpdateAsync(User u)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        using var transaction = conn.BeginTransaction();

        try
        {
            var query = @"UPDATE USERS SET 
                          NAME=@name, 
                          PasswordHash=@pwHash,
                          PasswordChangedDate=@pwChanged,
                          PasswordExpiryDate=@pwExpiry,
                          MustChangePassword=@mustChange,
                          FailedLoginAttempts=@failedAttempts,
                          LockedUntil=@lockedUntil,
                          LastLoginDate=@lastLogin,
                          FACILITY=@fac, 
                          STATUS=@st, 
                          LANGUAGE=@lang, 
                          LASTUPDATE=GETDATE(), 
                          LASTUSER=@usr 
                          WHERE USERID=@id";
            using (var cmd = new SqlCommand(query, conn, transaction))
            {
                cmd.Parameters.AddWithValue("@id", u.Id);
                cmd.Parameters.AddWithValue("@name", u.Name);
                cmd.Parameters.AddWithValue("@pwHash", (object?)u.PasswordHash ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@pwChanged", (object?)u.PasswordChangedDate ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@pwExpiry", (object?)u.PasswordExpiryDate ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@mustChange", u.MustChangePassword);
                cmd.Parameters.AddWithValue("@failedAttempts", u.FailedLoginAttempts);
                cmd.Parameters.AddWithValue("@lockedUntil", (object?)u.LockedUntil ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@lastLogin", (object?)u.LastLoginDate ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@fac", (object?)u.FacilityId ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@st", u.Status);
                cmd.Parameters.AddWithValue("@lang", u.Language);
                cmd.Parameters.AddWithValue("@usr", u.LastUser);
                await cmd.ExecuteNonQueryAsync();
            }

            // Re-create relations (Delete all and insert new)
            // Roles
            using (var cmdDel = new SqlCommand("DELETE FROM USER_ROLES WHERE USERID=@uid", conn, transaction))
            {
                cmdDel.Parameters.AddWithValue("@uid", u.Id);
                await cmdDel.ExecuteNonQueryAsync();
            }
            foreach (var role in u.Roles)
            {
                using var cmdRole = new SqlCommand("INSERT INTO USER_ROLES (USERID, ROLEID) VALUES (@uid, @rid)", conn, transaction);
                cmdRole.Parameters.AddWithValue("@uid", u.Id);
                cmdRole.Parameters.AddWithValue("@rid", role);
                await cmdRole.ExecuteNonQueryAsync();
            }

            // Facilities
            using (var cmdDel = new SqlCommand("DELETE FROM USER_FACILITIES WHERE USERID=@uid", conn, transaction))
            {
                cmdDel.Parameters.AddWithValue("@uid", u.Id);
                await cmdDel.ExecuteNonQueryAsync();
            }
            foreach (var fac in u.AccessibleFacilities)
            {
                using var cmdFac = new SqlCommand("INSERT INTO USER_FACILITIES (USERID, FACILITYID) VALUES (@uid, @fid)", conn, transaction);
                cmdFac.Parameters.AddWithValue("@uid", u.Id);
                cmdFac.Parameters.AddWithValue("@fid", fac);
                await cmdFac.ExecuteNonQueryAsync();
            }

            // Customers
            using (var cmdDel = new SqlCommand("DELETE FROM USER_CUSTOMERS WHERE USERID=@uid", conn, transaction))
            {
                cmdDel.Parameters.AddWithValue("@uid", u.Id);
                await cmdDel.ExecuteNonQueryAsync();
            }
            foreach (var cust in u.AccessibleCustomers)
            {
                using var cmdCust = new SqlCommand("INSERT INTO USER_CUSTOMERS (USERID, CUSTOMERID) VALUES (@uid, @cid)", conn, transaction);
                cmdCust.Parameters.AddWithValue("@uid", u.Id);
                cmdCust.Parameters.AddWithValue("@cid", cust);
                await cmdCust.ExecuteNonQueryAsync();
            }

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> DeleteAsync(string id)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "UPDATE USERS SET STATUS = 'I', LASTUPDATE = GETDATE() WHERE USERID = @id";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@id", id);
        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    private User Map(IDataRecord r) => new User
    {
        Id = r["USERID"]?.ToString() ?? "",
        Name = r["NAME"]?.ToString() ?? "",
        PasswordHash = r["PasswordHash"]?.ToString(),
        PasswordChangedDate = r["PasswordChangedDate"] != DBNull.Value ? Convert.ToDateTime(r["PasswordChangedDate"]) : null,
        PasswordExpiryDate = r["PasswordExpiryDate"] != DBNull.Value ? Convert.ToDateTime(r["PasswordExpiryDate"]) : null,
        MustChangePassword = r["MustChangePassword"] != DBNull.Value && Convert.ToBoolean(r["MustChangePassword"]),
        FailedLoginAttempts = r["FailedLoginAttempts"] != DBNull.Value ? Convert.ToInt32(r["FailedLoginAttempts"]) : 0,
        LockedUntil = r["LockedUntil"] != DBNull.Value ? Convert.ToDateTime(r["LockedUntil"]) : null,
        LastLoginDate = r["LastLoginDate"] != DBNull.Value ? Convert.ToDateTime(r["LastLoginDate"]) : null,
        FacilityId = r["FACILITY"]?.ToString(),
        Status = r["STATUS"]?.ToString() ?? "A",
        Language = r["LANGUAGE"]?.ToString() ?? "en",
        LastUpdate = r["LASTUPDATE"] != DBNull.Value ? Convert.ToDateTime(r["LASTUPDATE"]) : DateTime.Now,
        LastUser = r["LASTUSER"]?.ToString() ?? "SYSTEM"
    };
}
