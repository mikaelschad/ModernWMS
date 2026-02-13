-- =============================================
-- Script: 003_UppercasePKConstraints.sql (FIXED - Correct Column Names)
-- Description: Enforce uppercase alphanumeric PKs and convert existing data
-- Author: Antigravity
-- Date: 2026-02-10 (Fixed column names)
-- =============================================

PRINT 'Starting uppercase PK constraint migration...'
GO

-- =============================================
-- USERS Table
-- =============================================
PRINT 'Updating USERS table...'

UPDATE USERS SET USERID = UPPER(USERID) WHERE USERID <> UPPER(USERID);
PRINT '  - Updated USERID values to uppercase'

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

UPDATE USER_ROLES SET USERID = UPPER(USERID) WHERE USERID <> UPPER(USERID);
UPDATE USER_FACILITIES SET USERID = UPPER(USERID) WHERE USERID <> UPPER(USERID);
UPDATE USER_CUSTOMERS SET USERID = UPPER(USERID) WHERE USERID <> UPPER(USERID);

GO

-- =============================================
-- FACILITY Table
-- =============================================
PRINT 'Updating FACILITY table...'

-- First, drop the constraint if it exists (to allow update)
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_FACILITY_FACILITY_UPPERCASE')
BEGIN
    ALTER TABLE FACILITY DROP CONSTRAINT CK_FACILITY_FACILITY_UPPERCASE;
    PRINT '  - Dropped existing CHECK constraint to allow updates'
END

-- Update all values to uppercase
UPDATE FACILITY SET FACILITY = UPPER(FACILITY) WHERE FACILITY <> UPPER(FACILITY);
PRINT '  - Updated FACILITY values to uppercase'

-- Re-add the constraint
ALTER TABLE FACILITY 
ADD CONSTRAINT CK_FACILITY_FACILITY_UPPERCASE 
CHECK (FACILITY = UPPER(FACILITY) COLLATE Latin1_General_BIN2);
PRINT '  - Added CHECK constraint to FACILITY.FACILITY'

-- Update foreign key references
UPDATE USER_FACILITIES SET FACILITYID = UPPER(FACILITYID) WHERE FACILITYID <> UPPER(FACILITYID);

GO

-- =============================================
-- CUSTOMER Table (Column: CUSTID)
-- =============================================
PRINT 'Updating CUSTOMER table...'

-- First, drop the constraint if it exists
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_CUSTOMER_CUSTID_UPPERCASE')
BEGIN
    ALTER TABLE CUSTOMER DROP CONSTRAINT CK_CUSTOMER_CUSTID_UPPERCASE;
    PRINT '  - Dropped existing CHECK constraint to allow updates'
END

-- Update all values to uppercase (Column is CUSTID, not CUSTOMER)
UPDATE CUSTOMER SET CUSTID = UPPER(CUSTID) WHERE CUSTID <> UPPER(CUSTID);
PRINT '  - Updated CUSTID values to uppercase'

-- Add the constraint
ALTER TABLE CUSTOMER 
ADD CONSTRAINT CK_CUSTOMER_CUSTID_UPPERCASE 
CHECK (CUSTID = UPPER(CUSTID) COLLATE Latin1_General_BIN2);
PRINT '  - Added CHECK constraint to CUSTOMER.CUSTID'

-- Update foreign key references
UPDATE USER_CUSTOMERS SET CUSTOMERID = UPPER(CUSTOMERID) WHERE CUSTOMERID <> UPPER(CUSTOMERID);

GO

-- =============================================
-- ZONE Table
-- =============================================
PRINT 'Updating ZONE table...'

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_ZONE_ZONE_UPPERCASE')
BEGIN
    ALTER TABLE ZONE DROP CONSTRAINT CK_ZONE_ZONE_UPPERCASE;
END

UPDATE ZONE SET ZONE = UPPER(ZONE) WHERE ZONE <> UPPER(ZONE);
PRINT '  - Updated ZONE values to uppercase'

ALTER TABLE ZONE 
ADD CONSTRAINT CK_ZONE_ZONE_UPPERCASE 
CHECK (ZONE = UPPER(ZONE) COLLATE Latin1_General_BIN2);
PRINT '  - Added CHECK constraint to ZONE.ZONE'

GO

-- =============================================
-- SECTION Table
-- =============================================
PRINT 'Updating SECTION table...'

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_SECTION_SECTION_UPPERCASE')
BEGIN
    ALTER TABLE SECTION DROP CONSTRAINT CK_SECTION_SECTION_UPPERCASE;
END

UPDATE SECTION SET SECTION = UPPER(SECTION) WHERE SECTION <> UPPER(SECTION);
PRINT '  - Updated SECTION values to uppercase'

ALTER TABLE SECTION 
ADD CONSTRAINT CK_SECTION_SECTION_UPPERCASE 
CHECK (SECTION = UPPER(SECTION) COLLATE Latin1_General_BIN2);
PRINT '  - Added CHECK constraint to SECTION.SECTION'

GO

-- =============================================
-- LOCATION Table
-- =============================================
PRINT 'Updating LOCATION table...'

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_LOCATION_LOCATION_UPPERCASE')
BEGIN
    ALTER TABLE LOCATION DROP CONSTRAINT CK_LOCATION_LOCATION_UPPERCASE;
END

UPDATE LOCATION SET LOCATION = UPPER(LOCATION) WHERE LOCATION <> UPPER(LOCATION);
PRINT '  - Updated LOCATION values to uppercase'

ALTER TABLE LOCATION 
ADD CONSTRAINT CK_LOCATION_LOCATION_UPPERCASE 
CHECK (LOCATION = UPPER(LOCATION) COLLATE Latin1_General_BIN2);
PRINT '  - Added CHECK constraint to LOCATION.LOCATION'

GO

-- =============================================
-- ITEM Table (Column: SKU)
-- =============================================
PRINT 'Updating ITEM table...'

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_ITEM_SKU_UPPERCASE')
BEGIN
    ALTER TABLE ITEM DROP CONSTRAINT CK_ITEM_SKU_UPPERCASE;
END

UPDATE ITEM SET SKU = UPPER(SKU) WHERE SKU <> UPPER(SKU);
PRINT '  - Updated SKU values to uppercase'

ALTER TABLE ITEM 
ADD CONSTRAINT CK_ITEM_SKU_UPPERCASE 
CHECK (SKU = UPPER(SKU) COLLATE Latin1_General_BIN2);
PRINT '  - Added CHECK constraint to ITEM.SKU'

GO

-- =============================================
-- CONSIGNEE Table
-- =============================================
PRINT 'Updating CONSIGNEE table...'

IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_CONSIGNEE_CONSIGNEE_UPPERCASE')
BEGIN
    ALTER TABLE CONSIGNEE DROP CONSTRAINT CK_CONSIGNEE_CONSIGNEE_UPPERCASE;
END

UPDATE CONSIGNEE SET CONSIGNEE = UPPER(CONSIGNEE) WHERE CONSIGNEE <> UPPER(CONSIGNEE);
PRINT '  - Updated CONSIGNEE values to uppercase'

ALTER TABLE CONSIGNEE 
ADD CONSTRAINT CK_CONSIGNEE_CONSIGNEE_UPPERCASE 
CHECK (CONSIGNEE = UPPER(CONSIGNEE) COLLATE Latin1_General_BIN2);
PRINT '  - Added CHECK constraint to CONSIGNEE.CONSIGNEE'

GO

-- =============================================
-- LICENSE_PLATE Table (if exists)
-- =============================================
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'LICENSE_PLATE')
BEGIN
    PRINT 'Updating LICENSE_PLATE table...'
    
    IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_LICENSE_PLATE_LP_UPPERCASE')
    BEGIN
        ALTER TABLE LICENSE_PLATE DROP CONSTRAINT CK_LICENSE_PLATE_LP_UPPERCASE;
    END
    
    UPDATE LICENSE_PLATE SET LICENSE_PLATE = UPPER(LICENSE_PLATE) WHERE LICENSE_PLATE <> UPPER(LICENSE_PLATE);
    PRINT '  - Updated LICENSE_PLATE values to uppercase'
    
    ALTER TABLE LICENSE_PLATE 
    ADD CONSTRAINT CK_LICENSE_PLATE_LP_UPPERCASE 
    CHECK (LICENSE_PLATE = UPPER(LICENSE_PLATE) COLLATE Latin1_General_BIN2);
    PRINT '  - Added CHECK constraint to LICENSE_PLATE.LICENSE_PLATE'
END

GO

PRINT 'Uppercase PK constraint migration completed successfully!'
GO
