-- =============================================
-- Script: 003a_FixItemTableSchema.sql
-- Description: Restructure ITEM table - ITEM as PK, SKU as attribute
-- Author: Antigravity
-- Date: 2026-02-10
-- =============================================

PRINT 'Restructuring ITEM table schema...'
GO

-- Check if ITEM column already exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ITEM' AND COLUMN_NAME = 'ITEM')
BEGIN
    PRINT 'Adding ITEM column as new primary key...'
    
    -- Step 1: Add new ITEM column (will become PK)
    ALTER TABLE ITEM ADD ITEM NVARCHAR(30) NULL;
    
    -- Step 2: Populate ITEM column with SKU values (temporary, user should update)
    -- For now, make ITEM = SKU to maintain data integrity
    UPDATE ITEM SET ITEM = SKU WHERE ITEM IS NULL;
    
    -- Step 3: Make ITEM column NOT NULL
    ALTER TABLE ITEM ALTER COLUMN ITEM NVARCHAR(30) NOT NULL;
    
    -- Step 4: Drop existing primary key constraint on SKU
    DECLARE @constraintName NVARCHAR(200);
    SELECT @constraintName = name 
    FROM sys.key_constraints 
    WHERE type = 'PK' 
    AND parent_object_id = OBJECT_ID('ITEM');
    
    IF @constraintName IS NOT NULL
    BEGIN
        EXEC('ALTER TABLE ITEM DROP CONSTRAINT ' + @constraintName);
        PRINT '  - Dropped old primary key constraint on SKU'
    END
    
    -- Step 5: Add new primary key on ITEM column
    ALTER TABLE ITEM 
    ADD CONSTRAINT PK_ITEM PRIMARY KEY (ITEM);
    PRINT '  - Added primary key constraint on ITEM column'
    
    -- Step 6: Add CHECK constraint for uppercase ITEM
    ALTER TABLE ITEM 
    ADD CONSTRAINT CK_ITEM_ITEM_UPPERCASE 
    CHECK (ITEM = UPPER(ITEM) COLLATE Latin1_General_BIN2);
    PRINT '  - Added uppercase CHECK constraint on ITEM column'
    
    -- Step 7: Make SKU a unique index (still needs to be unique but not PK)
    CREATE UNIQUE INDEX IX_ITEM_SKU ON ITEM(SKU);
    PRINT '  - Created unique index on SKU column'
    
    PRINT 'ITEM table restructure completed!'
    PRINT 'NOTE: ITEM column currently contains SKU values. Please update as needed.'
END
ELSE
BEGIN
    PRINT 'ITEM column already exists. Skipping restructure.'
END

GO
