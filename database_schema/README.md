# Database Setup Instructions

## Quick Setup

Run this command in PowerShell from the project root:

```powershell
sqlcmd -S "(localdb)\mssqllocaldb" -i "database_schema\init_database.sql"
```

Or if using SQL Server Management Studio (SSMS):
1. Open `database_schema\init_database.sql`
2. Click Execute (F5)

## What This Creates
- Database: `ModernWMS`
- Tables: `FACILITY`, `PLATE`, `INVENTORY`

## Verify Setup
After running the script, restart your backend:
```powershell
# Stop current backend (Ctrl+C in the terminal)
# Then restart:
dotnet run
```

Then try creating a facility again from the web UI.
