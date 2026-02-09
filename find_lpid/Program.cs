using System;
using Oracle.ManagedDataAccess.Client;

class Program {
    static void Main() {
        string connString = "User Id=ALPS;Password=ALPS;Data Source=192.168.0.51:1521/TEST;";
        using (var conn = new OracleConnection(connString)) {
            try {
                conn.Open();
                Console.WriteLine("Connection successful.");
                using (var cmd = new OracleCommand("SELECT LPID FROM PLATE FETCH FIRST 5 ROWS ONLY", conn)) {
                    using (var reader = cmd.ExecuteReader()) {
                        while (reader.Read()) {
                            Console.WriteLine("LPID: " + reader["LPID"]);
                        }
                    }
                }
            } catch (Exception ex) {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
