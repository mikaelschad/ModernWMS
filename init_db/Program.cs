using Microsoft.Data.SqlClient;

var masterConnectionString = "Server=(localdb)\\mssqllocaldb;Integrated Security=true;TrustServerCertificate=True;";

Console.WriteLine("Creating ModernWMS database...");

try
{
    // Create database
    using (var conn = new SqlConnection(masterConnectionString))
    {
        conn.Open();
        Console.WriteLine("Connected to LocalDB");
        
        var dbExists = false;
        using (var checkCmd = new SqlCommand("SELECT database_id FROM sys.databases WHERE Name = 'ModernWMS'", conn))
        {
            var result = checkCmd.ExecuteScalar();
            dbExists = result != null;
        }
        
        if (!dbExists)
        {
            using var cmd = new SqlCommand("CREATE DATABASE ModernWMS", conn);
            cmd.ExecuteNonQuery();
            Console.WriteLine("✓ Database 'ModernWMS' created successfully!");
        }
        else
        {
            Console.WriteLine("✓ Database 'ModernWMS' already exists");
        }
    }
    
    // Create tables
    var dbConnectionString = "Server=(localdb)\\mssqllocaldb;Database=ModernWMS;Integrated Security=true;TrustServerCertificate=True;";
    using (var conn = new SqlConnection(dbConnectionString))
    {
        conn.Open();
        Console.WriteLine("Connected to ModernWMS database");
        
        // Create FACILITY table
        var createFacility = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FACILITY')
BEGIN
    CREATE TABLE FACILITY (
        FACILITY VARCHAR(3) PRIMARY KEY,
        NAME VARCHAR(40),
        ADDR1 VARCHAR(40),
        ADDR2 VARCHAR(40),
        CITY VARCHAR(30),
        STATE VARCHAR(2),
        POSTALCODE VARCHAR(10),
        COUNTRYCODE VARCHAR(2),
        PHONE VARCHAR(20),
        FAX VARCHAR(20),
        EMAIL VARCHAR(100),
        MANAGER VARCHAR(40),
        FACILITYSTATUS CHAR(1) DEFAULT 'A',
        REMITNAME VARCHAR(40),
        REMITADDR1 VARCHAR(40),
        REMITCITY VARCHAR(30),
        REMITSTATE VARCHAR(2),
        REMITPOSTALCODE VARCHAR(10),
        TASKLIMIT INT,
        XDOCKLOC VARCHAR(15),
        FACILITYGROUP VARCHAR(15),
        USE_LOCATION_CHECKDIGIT CHAR(1) DEFAULT 'N',
        RESTRICT_PUTAWAY CHAR(1) DEFAULT 'N',
        WORKSUNDAY_IN CHAR(1) DEFAULT 'N',
        WORKMONDAY_IN CHAR(1) DEFAULT 'Y',
        WORKTUESDAY_IN CHAR(1) DEFAULT 'Y',
        WORKWEDNESDAY_IN CHAR(1) DEFAULT 'Y',
        WORKTHURSDAY_IN CHAR(1) DEFAULT 'Y',
        WORKFRIDAY_IN CHAR(1) DEFAULT 'Y',
        WORKSATURDAY_IN CHAR(1) DEFAULT 'N',
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createFacility, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ FACILITY table created");
        
        // Create PLATE table
        var createPlate = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PLATE')
BEGIN
    CREATE TABLE PLATE (
        LPID VARCHAR(20) PRIMARY KEY,
        ITEM VARCHAR(20) NOT NULL,
        CUSTID VARCHAR(15),
        FACILITY VARCHAR(3),
        LOCATION VARCHAR(15),
        STATUS VARCHAR(1) DEFAULT 'A',
        QUANTITY DECIMAL(18, 4) DEFAULT 0,
        UNITOFMEASURE VARCHAR(10),
        LOTNUMBER VARCHAR(20),
        SERIALNUMBER VARCHAR(40),
        TYPE VARCHAR(10),
        HOLDREASON VARCHAR(50),
        INVENTORYCLASS VARCHAR(10),
        WEIGHT DECIMAL(10, 2),
        PO VARCHAR(20),
        PARENTLPID VARCHAR(20),
        CREATIONDATE DATETIME DEFAULT GETDATE(),
        MANUFACTUREDATE DATETIME,
        EXPIRATIONDATE DATETIME,
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createPlate, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ PLATE table created");
        
        // Create INVENTORY table
        var createInventory = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'INVENTORY')
BEGIN
    CREATE TABLE INVENTORY (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        SKU VARCHAR(20) NOT NULL,
        QUANTITY INT DEFAULT 0,
        LOCATIONCODE VARCHAR(20),
        FACILITYID VARCHAR(3)
    )
END";
        
        using (var cmd = new SqlCommand(createInventory, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ INVENTORY table created");
        
        // Create CUSTOMER table
        var createCustomer = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CUSTOMER')
BEGIN
    CREATE TABLE CUSTOMER (
        CUSTID VARCHAR(15) PRIMARY KEY,
        NAME VARCHAR(100) NOT NULL,
        ADDR1 VARCHAR(100),
        ADDR2 VARCHAR(100),
        CITY VARCHAR(50),
        STATE VARCHAR(2),
        POSTALCODE VARCHAR(10),
        COUNTRY VARCHAR(2),
        PHONE VARCHAR(20),
        EMAIL VARCHAR(100),
        CONTACT VARCHAR(100),
        STATUS CHAR(1) DEFAULT 'A',
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createCustomer, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ CUSTOMER table created");
        
        // Create ZONE table
        var createZone = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ZONE')
BEGIN
    CREATE TABLE ZONE (
        ZONE VARCHAR(10) PRIMARY KEY,
        FACILITY VARCHAR(3) NOT NULL,
        DESCRIPTION VARCHAR(100),
        STATUS CHAR(1) DEFAULT 'A',
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createZone, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ ZONE table created");
        
        // Create SECTION table
        var createSection = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SECTION')
BEGIN
    CREATE TABLE SECTION (
        SECTION VARCHAR(10) PRIMARY KEY,
        ZONE VARCHAR(10) NOT NULL,
        DESCRIPTION VARCHAR(100),
        STATUS CHAR(1) DEFAULT 'A',
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createSection, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ SECTION table created");
        
        // Create LOCATION table
        var createLocation = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LOCATION')
BEGIN
    CREATE TABLE LOCATION (
        LOCATION VARCHAR(15) PRIMARY KEY,
        FACILITY VARCHAR(3) NOT NULL,
        ZONE VARCHAR(10),
        SECTION VARCHAR(10),
        LOCATIONTYPE VARCHAR(10),
        STATUS CHAR(1) DEFAULT 'A',
        MAXWEIGHT DECIMAL(10, 2),
        MAXVOLUME DECIMAL(10, 2),
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createLocation, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ LOCATION table created");
        
        // Create CONSIGNEE table
        var createConsignee = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CONSIGNEE')
BEGIN
    CREATE TABLE CONSIGNEE (
        CONSIGNEEID VARCHAR(15) PRIMARY KEY,
        NAME VARCHAR(100) NOT NULL,
        ADDR1 VARCHAR(100),
        ADDR2 VARCHAR(100),
        CITY VARCHAR(50),
        STATE VARCHAR(2),
        POSTALCODE VARCHAR(10),
        COUNTRY VARCHAR(2),
        PHONE VARCHAR(20),
        EMAIL VARCHAR(100),
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createConsignee, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ CONSIGNEE table created");
        
        // Create ITEMGROUP table
        var createItemGroup = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ITEMGROUP')
BEGIN
    CREATE TABLE ITEMGROUP (
        ITEMGROUP VARCHAR(10) PRIMARY KEY,
        DESCRIPTION VARCHAR(100),
        CATEGORY VARCHAR(50),
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createItemGroup, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ ITEMGROUP table created");
        
        // Create ITEM table
        var createItem = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ITEM')
BEGIN
    CREATE TABLE ITEM (
        SKU VARCHAR(20) PRIMARY KEY,
        DESCRIPTION VARCHAR(200) NOT NULL,
        UNITOFMEASURE VARCHAR(10) DEFAULT 'EA',
        ITEMGROUP VARCHAR(10),
        WEIGHT DECIMAL(10, 2),
        LENGTH DECIMAL(10, 2),
        WIDTH DECIMAL(10, 2),
        HEIGHT DECIMAL(10, 2),
        STATUS CHAR(1) DEFAULT 'A',
        LASTUPDATE DATETIME DEFAULT GETDATE(),
        LASTUSER VARCHAR(20) DEFAULT 'SYSTEM'
    )
END";
        
        using (var cmd = new SqlCommand(createItem, conn))
        {
            cmd.ExecuteNonQuery();
        }
        Console.WriteLine("✓ ITEM table created");

        // MIGRATION: ADD ADVANCED COLUMNS TO ITEM IF MISSING
        var advancedColumns = new Dictionary<string, string>
        {
            { "CUSTID", "VARCHAR(15)" },
            { "ABBREVIATION", "VARCHAR(50)" },
            { "RATEGROUP", "VARCHAR(20)" },
            { "PRODUCTGROUP", "VARCHAR(20)" },
            { "KITTYPE", "VARCHAR(20)" },
            { "REQUIRECYCLECOUNT", "BIT DEFAULT 0" },
            { "REQUIRELOTNUMBER", "BIT DEFAULT 0" },
            { "REQUIRESERIALNUMBER", "BIT DEFAULT 0" },
            { "REQUIREMANUFACTUREDATE", "BIT DEFAULT 0" },
            { "REQUIREEXPIRATIONDATE", "BIT DEFAULT 0" },
            { "ISHAZARDOUS", "BIT DEFAULT 0" },
            { "UNNUMBER", "VARCHAR(20)" },
            { "HAZARDCLASS", "VARCHAR(20)" },
            { "PACKINGGROUP", "VARCHAR(10)" },
            { "VOLUME", "DECIMAL(18, 4)" }
        };

        foreach (var col in advancedColumns)
        {
            var checkCol = $"SELECT COL_LENGTH('ITEM', '{col.Key}')";
            using (var cmd = new SqlCommand(checkCol, conn))
            {
                var result = cmd.ExecuteScalar();
                if (result == DBNull.Value)
                {
                    Console.WriteLine($"Migrating ITEM table: Adding {col.Key}...");
                    using (var alterCmd = new SqlCommand($"ALTER TABLE ITEM ADD {col.Key} {col.Value}", conn))
                    {
                        alterCmd.ExecuteNonQuery();
                    }
                }
            }
        }
        Console.WriteLine("✓ ITEM table migration check complete");

        // MIGRATION: ADD CUSTID TO ITEMGROUP IF MISSING
        var checkGroupCustId = "SELECT COL_LENGTH('ITEMGROUP', 'CUSTID')";
        using (var cmd = new SqlCommand(checkGroupCustId, conn))
        {
            var result = cmd.ExecuteScalar();
            if (result == DBNull.Value)
            {
                Console.WriteLine("Migrating ITEMGROUP table: Adding CUSTID...");
                using (var alterCmd = new SqlCommand("ALTER TABLE ITEMGROUP ADD CUSTID VARCHAR(15)", conn))
                {
                    alterCmd.ExecuteNonQuery();
                }
                Console.WriteLine("✓ ITEMGROUP table migrated");
            }
        }
    }
    
    Console.WriteLine("\n✅ Database setup complete!");
    Console.WriteLine("You can now restart your backend and use the application.");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    Environment.Exit(1);
}
