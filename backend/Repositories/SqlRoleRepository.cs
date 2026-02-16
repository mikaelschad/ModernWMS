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
        // Define system entities and operations
        var entities = new[] { "User", "Role", "Customer", "Facility", "Plate", "Item", "Order" };
        var operations = new[] { "Read", "Create", "Update", "Disable", "Print" };

        var list = new List<Permission>();
        
        foreach (var entity in entities)
        {
            foreach (var op in operations)
            {
                list.Add(new Permission
                {
                    Id = $"{entity}_{op}",
                    Entity = entity,
                    Operation = op,
                    Description = $"Can {op} {entity}"
                });
            }
        }
        
        return await Task.FromResult(list);
    }

    public async Task<IEnumerable<string>> GetPermissionsForRoleAsync(string roleId)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        // Read granular permissions and flatten to string list
        var query = "SELECT EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint FROM ROLE_PERMISSIONS WHERE ROLEID = @rid";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@rid", roleId);
        
        using var reader = await cmd.ExecuteReaderAsync();
        var list = new List<string>();
        while (await reader.ReadAsync())
        {
            var entity = reader.GetString(0);
            if (reader.GetBoolean(1)) list.Add($"{entity}_Read");
            if (reader.GetBoolean(2)) list.Add($"{entity}_Create");
            if (reader.GetBoolean(3)) list.Add($"{entity}_Update");
            if (reader.GetBoolean(4)) list.Add($"{entity}_Disable");
            if (reader.GetBoolean(5)) list.Add($"{entity}_Print");
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
            // 1. Delete existing
            var deleteQuery = "DELETE FROM ROLE_PERMISSIONS WHERE ROLEID = @rid";
            using (var deleteCmd = new SqlCommand(deleteQuery, conn, transaction))
            {
                deleteCmd.Parameters.AddWithValue("@rid", roleId);
                await deleteCmd.ExecuteNonQueryAsync();
            }

            // 2. Parse permissions and group by Entity
            var granularPermissions = new Dictionary<string, (bool Read, bool Create, bool Update, bool Disable, bool Print)>();
            
            foreach (var perm in permissionIds)
            {
                var parts = perm.Split('_');
                if (parts.Length != 2) continue;
                
                var entity = parts[0];
                var op = parts[1];
                
                if (!granularPermissions.ContainsKey(entity))
                {
                    granularPermissions[entity] = (false, false, false, false, false);
                }
                
                var current = granularPermissions[entity];
                switch (op)
                {
                    case "Read": current.Read = true; break;
                    case "Create": current.Create = true; break;
                    case "Update": current.Update = true; break;
                    case "Disable": current.Disable = true; break;
                    case "Print": current.Print = true; break;
                }
                granularPermissions[entity] = current;
            }

            // 3. Insert new rows
            foreach (var kvp in granularPermissions)
            {
                var entity = kvp.Key;
                var flags = kvp.Value;
                
                var insertQuery = @"INSERT INTO ROLE_PERMISSIONS 
                                   (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint) 
                                   VALUES (@rid, @ent, @read, @create, @upd, @dis, @print)";
                                   
                using (var insertCmd = new SqlCommand(insertQuery, conn, transaction))
                {
                    insertCmd.Parameters.AddWithValue("@rid", roleId);
                    insertCmd.Parameters.AddWithValue("@ent", entity);
                    insertCmd.Parameters.AddWithValue("@read", flags.Read);
                    insertCmd.Parameters.AddWithValue("@create", flags.Create);
                    insertCmd.Parameters.AddWithValue("@upd", flags.Update);
                    insertCmd.Parameters.AddWithValue("@dis", flags.Disable);
                    insertCmd.Parameters.AddWithValue("@print", flags.Print);
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
