using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace ModernWMS.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebugController : ControllerBase
{
    private readonly string _conn;

    public DebugController(IConfiguration cfg)
    {
        _conn = cfg.GetConnectionString("LegacySqlDB") ?? "";
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = new List<object>();
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("SELECT USERID, NAME, PASSWORDHASH FROM USERS", c);
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            users.Add(new { UserId = r["USERID"], Name = r["NAME"], HasHash = r["PASSWORDHASH"] != DBNull.Value });
        }
        return Ok(users);
    }

    [HttpGet("reset/{userid}")]
    public async Task<IActionResult> ResetPassword(string userid)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("password");
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand("UPDATE USERS SET PASSWORDHASH = @h, FailedLoginAttempts = 0, LockedUntil = NULL WHERE USERID = @u", c);
        cmd.Parameters.AddWithValue("@h", hash);
        cmd.Parameters.AddWithValue("@u", userid);
        await cmd.ExecuteNonQueryAsync();
        return Ok($"Password for {userid} reset to 'password'");
    }

    [HttpGet("metadata/{table}")]
    public async Task<IActionResult> GetMetadata(string table)
    {
        var constraints = new List<object>();
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand(@"
            SELECT name, type_desc 
            FROM sys.objects 
            WHERE parent_object_id = OBJECT_ID(@t)", c);
        cmd.Parameters.AddWithValue("@t", table);
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            constraints.Add(new { Name = r["name"], Type = r["type_desc"] });
        }
        return Ok(constraints);
    }

    [HttpGet("search/{pattern}")]
    public async Task<IActionResult> SearchObjects(string pattern)
    {
        var results = new List<object>();
        using var c = new SqlConnection(_conn);
        await c.OpenAsync();
        using var cmd = new SqlCommand(@"
            SELECT name, type_desc, OBJECT_NAME(parent_object_id) as ParentTable
            FROM sys.objects 
            WHERE name LIKE @p", c);
        cmd.Parameters.AddWithValue("@p", "%" + pattern + "%");
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            results.Add(new { Name = r["name"], Type = r["type_desc"], Table = r["ParentTable"] });
        }
        return Ok(results);
    }

    [HttpPost("query")]
    public async Task<IActionResult> ExecuteQuery([FromBody] string query)
    {
        try
        {
            var results = new List<Dictionary<string, object>>();
            using var c = new SqlConnection(_conn);
            await c.OpenAsync();
            using var cmd = new SqlCommand(query, c);
            using var r = await cmd.ExecuteReaderAsync();
            
            var columns = new List<string>();
            for (int i = 0; i < r.FieldCount; i++) columns.Add(r.GetName(i));

            while (await r.ReadAsync())
            {
                var row = new Dictionary<string, object>();
                for (int i = 0; i < r.FieldCount; i++)
                {
                    row[columns[i]] = r.GetValue(i) == DBNull.Value ? null : r.GetValue(i);
                }
                results.Add(row);
            }
            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                Message = ex.Message, 
                Inner = ex.InnerException?.Message, 
                Stack = ex.StackTrace,
                Sql = query 
            });
        }
    }
}
