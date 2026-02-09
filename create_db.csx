using Microsoft.Data.SqlClient;

var connectionString = "Server=(localdb)\\mssqllocaldb;Integrated Security=true;TrustServerCertificate=True;";

try
{
    using var conn = new SqlConnection(connectionString);
    conn.Open();
    
    using var cmd = new SqlCommand("CREATE DATABASE ModernWMS", conn);
    cmd.ExecuteNonQuery();
    
    Console.WriteLine("Database 'ModernWMS' created successfully!");
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
    Environment.Exit(1);
}
