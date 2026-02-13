# Implementation Plan - Audit Trails

Implement a comprehensive audit trail system for ModernWMS to track data changes in critical tables (ITEM, PLATE) and capture security-related events.

## Phase 1: Database Schema

1.  **Create `AUDIT_LOG` table**:
    *   `Id` (INT PRIMARY KEY IDENTITY)
    *   `TableName` (NVARCHAR(100))
    *   `RecordId` (NVARCHAR(100))
    *   `Action` (NVARCHAR(20)) -- INSERT, UPDATE, DELETE, LOGIN, SECURITY
    *   `OldValues` (NVARCHAR(MAX)) -- JSON serialized state before change
    *   `NewValues` (NVARCHAR(MAX)) -- JSON serialized state after change
    *   `ChangedBy` (NVARCHAR(100))
    *   `ChangedDate` (DATETIME2 DEFAULT GETDATE())

2.  **Create Triggers for Automated Auditing**:
    *   `TR_ITEM_AUDIT`: After Insert, Update, Delete on `ITEM`.
    *   `TR_PLATE_AUDIT`: After Insert, Update, Delete on `PLATE`.

## Phase 2: Backend Infrastructure

1.  **Create `AuditLog` Model**:
    *   `backend/Models/AuditLog.cs`
2.  **Create Audit Repository**:
    *   `backend/Repositories/IAuditRepository.cs`
    *   `backend/Repositories/SqlAuditRepository.cs`
3.  **Register Services**:
    *   Add `IAuditRepository` to `Program.cs`.

## Phase 3: Application Auditing

1.  **Security Events**:
    *   Audit Logins in `AuthController.cs`.
    *   Audit Permission changes in `RoleController.cs` or `PermissionController.cs`.
2.  **Manual Auditing Service**:
    *   Create a simple `AuditService` to encapsulate manual entries.

## Phase 4: Frontend Visualization (Optional but Recommended)

1.  **Audit Log Page**:
    *   Create a new page to view audit logs (requires specific `AUDIT_READ` permission).

---

### Phase 1 Detail - SQL Script (`006_AuditTrails.sql`)

```sql
CREATE TABLE AUDIT_LOG (
    Id INT PRIMARY KEY IDENTITY(1,1),
    TableName NVARCHAR(100),
    RecordId NVARCHAR(100),
    Action NVARCHAR(20),
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    ChangedBy NVARCHAR(100),
    ChangedDate DATETIME2 DEFAULT GETDATE()
);

-- Note: Trigger implementation for Item and Plate will be added next.
```
