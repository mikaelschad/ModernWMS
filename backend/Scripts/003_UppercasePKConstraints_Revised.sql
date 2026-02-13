-- =============================================
-- Script: 003_UppercasePKConstraints.sql (REVISED)
-- Description: Enforce uppercase alphanumeric PKs - EXISTING TABLES ONLY
-- Author: Antigravity
-- Date: 2026-02-10 (Revised)
-- =============================================

PRINT 'Starting uppercase PK constraint migration (existing tables only)...'
GO

-- =============================================
-- USERS Table (Already completed - skip if constraint exists)
-- =============================================
PRINT 'Checking USERS table...'

-- Convert existing data to uppercase (idempotent)
UPDATE USERS SET USERID = UPPER(USERID) WHERE USERID <> UPPER(USERID);

-- Add CHECK constraint if not exists
IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_USERS_USERID_UPPERCASE')
BEGIN
    ALTER TABLE USERS 
    ADD CONSTRAINT CK_USERS_USERID_UPPERCASE 
    CHECK (USERID = UPPER(USERID) COLLATE Latin1_General_BIN2);
    PRINT '  - Added CHECK constraint to USERS.USERID'
END
ELSE
BEGIN
    PRINT '  - CHECK constraint already exists on USERS.USERID'
END

-- Update foreign keys in USER_ROLES
UPDATE USER_ROLES SET USERID = UPPER(USERID) WHERE USERID <> UPPER(USERID);

-- Update foreign keys in USER_FACILITIES  
UPDATE USER_FACILITIES SET USERID = UPPER(USERID) WHERE USERID <> UPPER(USERID);

-- Update foreign keys in USER_CUSTOMERS
UPDATE USER_CUSTOMERS SET USERID = UPPER(USERID) WHERE USERID <> UPPER(USERID);

GO

-- =============================================
-- FACILITIES Table (if exists)
-- =============================================
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'FACILITIES')
BEGIN
    PRINT 'Updating FACILITIES table...'
    
    UPDATE FACILITIES SET FACILITY = UPPER(FACILITY) WHERE FACILITY <> UPPER(FACILITY);
    
    IF NOT EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_FACILITIES_FACILITY_UPPERCASE')
    BEGIN
        ALTER TABLE FACILITIES 
        ADD CONSTRAINT CK_FACILITIES_FACILITY_UPPERCASE 
        CHECK (FACILITY = UPPER(FACILITY) COLLATE Latin1_General_BIN2);
        PRINT '  - Added CHECK constraint to FACILITIES.FACILITY'
    END
    ELSE
    BEGIN
        PRINT '  - CHECK constraint already exists on FACILITIES.FACILITY'
    END
    
    -- Update foreign key references in USER_FACILITIES
    UPDATE USER_FACILITIES SET FACILITYID = UPPER(FACILITYID) WHERE FACILITYID <> UPPER(FACILITYID);
END
ELSE
BEGIN
    PRINT '  - FACILITIES table does not exist, skipping'
END

GO

-- =============================================
-- Note: Other tables (CUSTOMERS, ZONES, SECTIONS, LOCATIONS, ITEMS, CONSIGNEES)
-- will be created with uppercase constraints from the start in future migrations
-- =============================================

PRINT 'Uppercase PK constraint migration completed!'
PRINT 'Note: Only existing tables (USERS, FACILITIES) were updated.'
PRINT 'Future table creation scripts should include uppercase constraints from the start.'
GO
