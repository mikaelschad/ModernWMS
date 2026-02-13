using Microsoft.Data.SqlClient;
using ModernWMS.Backend.Models;
using System.Data;

namespace ModernWMS.Backend.Repositories;

public class SqlAuditRepository : IAuditRepository
{
    private readonly string _connectionString;

    public SqlAuditRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("LegacySqlDB") ?? throw new InvalidOperationException("Connection string not found");
    }

    public async Task<IEnumerable<AuditLog>> GetAllAsync()
    {
        var logs = new List<AuditLog>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "SELECT TOP 1000 * FROM AUDIT_LOG ORDER BY ChangedDate DESC";
        using var cmd = new SqlCommand(query, conn);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync()) logs.Add(MapAuditLog(reader));
        return logs;
    }

    public async Task<IEnumerable<AuditLog>> GetByTableAsync(string tableName)
    {
        var logs = new List<AuditLog>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "SELECT * FROM AUDIT_LOG WHERE TableName = @table ORDER BY ChangedDate DESC";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@table", tableName);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync()) logs.Add(MapAuditLog(reader));
        return logs;
    }

    public async Task<IEnumerable<AuditLog>> GetByRecordAsync(string tableName, string recordId)
    {
        var logs = new List<AuditLog>();
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = "SELECT * FROM AUDIT_LOG WHERE TableName = @table AND RecordId = @id ORDER BY ChangedDate DESC";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@table", tableName);
        cmd.Parameters.AddWithValue("@id", recordId);
        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync()) logs.Add(MapAuditLog(reader));
        return logs;
    }

    public async Task<int> CreateAsync(AuditLog log)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        var query = @"INSERT INTO AUDIT_LOG (TableName, RecordId, Action, OldValues, NewValues, ChangedBy, ChangedDate) 
                      VALUES (@table, @id, @action, @old, @new, @user, GETDATE());
                      SELECT SCOPE_IDENTITY();";
        using var cmd = new SqlCommand(query, conn);
        cmd.Parameters.AddWithValue("@table", log.TableName);
        cmd.Parameters.AddWithValue("@id", log.RecordId);
        cmd.Parameters.AddWithValue("@action", log.Action);
        cmd.Parameters.AddWithValue("@old", (object?)log.OldValues ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@new", (object?)log.NewValues ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@user", (object?)log.ChangedBy ?? "SYSTEM");
        
        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    private AuditLog MapAuditLog(IDataRecord r) => new AuditLog
    {
        Id = (int)r["Id"],
        TableName = r["TableName"].ToString() ?? "",
        RecordId = r["RecordId"].ToString() ?? "",
        Action = r["Action"].ToString() ?? "",
        OldValues = r["OldValues"]?.ToString(),
        NewValues = r["NewValues"]?.ToString(),
        ChangedBy = r["ChangedBy"]?.ToString() ?? "SYSTEM",
        ChangedDate = (DateTime)r["ChangedDate"]
    };
}
