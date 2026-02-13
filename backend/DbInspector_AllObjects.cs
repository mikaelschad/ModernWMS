using System;
using Microsoft.Data.SqlClient;

namespace DbInspector
{
    class AllObjectDumper
    {
        static void Main(string[] args)
        {
            var connectionString = "Server=(localdb)\\mssqllocaldb;Database=ModernWMS;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                Console.WriteLine("--- ALL OBJECTS ---");
                using (var cmd = new SqlCommand("SELECT name, type_desc, OBJECT_NAME(parent_object_id) as Parent FROM sys.objects ORDER BY name", connection))
                {
                    using (var r = cmd.ExecuteReader())
                    {
                        while (r.Read())
                        {
                            Console.WriteLine($"{r["name"]} | {r["type_desc"]} | {r["Parent"]}");
                        }
                    }
                }
            }
        }
    }
}
