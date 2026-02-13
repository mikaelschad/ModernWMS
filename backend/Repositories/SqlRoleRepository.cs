using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlRoleRepository : IRoleRepository
{
    private readonly string _connectionString;

    public SqlRoleRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("LegacySqlDB")!;
    }

    public async Task<IEnumerable<Role>> GetAllAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "SELECT ROLEID as Id, DESCRIPTION as Description FROM ROLES";
        using var cmd = new SqlCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        var list = new List<Role>();
        while (await reader.ReadAsync())
        {
            list.Add(new Role 
            { 
                Id = reader["Id"].ToString()!, 
                Description = reader["Description"].ToString()! 
            });
        }
        return list;
    }

    public async Task<IEnumerable<Permission>> GetAllPermissionsAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "SELECT PERMISSIONID as Id, ENTITY as Entity, OPERATION as Operation, DESCRIPTION as Description FROM PERMISSIONS ORDER BY ENTITY, OPERATION";
        using var cmd = new SqlCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        var list = new List<Permission>();
        while (await reader.ReadAsync())
        {
            list.Add(new Permission 
            { 
                Id = reader["Id"].ToString()!, 
                Entity = reader["Entity"].ToString()!,
                Operation = reader["Operation"].ToString()!,
                Description = reader["Description"].ToString()! 
            });
        }
        return list;
    }

    public async Task<IEnumerable<string>> GetPermissionsForRoleAsync(string roleId)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "SELECT PERMISSIONID FROM ROLE_PERMISSIONS WHERE ROLEID = @rid";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@rid", roleId);
        using var reader = await cmd.ExecuteReaderAsync();
        var list = new List<string>();
        while (await reader.ReadAsync())
        {
            list.Add(reader.GetString(0));
        }
        return list;
    }

    public async Task<bool> UpdateRolePermissionsAsync(string roleId, IEnumerable<string> permissionIds)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        using var transaction = conn.BeginTransaction();
        try
        {
            // Delete existing
            var deleteQuery = "DELETE FROM ROLE_PERMISSIONS WHERE ROLEID = @rid";
            using (var deleteCmd = new SqlCommand(deleteQuery, conn, transaction))
            {
                deleteCmd.Parameters.AddWithValue("@rid", roleId);
                await deleteCmd.ExecuteNonQueryAsync();
            }

            // Insert new
            foreach (var pid in permissionIds)
            {
                var insertQuery = "INSERT INTO ROLE_PERMISSIONS (ROLEID, PERMISSIONID) VALUES (@rid, @pid)";
                using (var insertCmd = new SqlCommand(insertQuery, conn, transaction))
                {
                    insertCmd.Parameters.AddWithValue("@rid", roleId);
                    insertCmd.Parameters.AddWithValue("@pid", pid);
                    await insertCmd.ExecuteNonQueryAsync();
                }
            }

            await transaction.CommitAsync();
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }
}
