-- =============================================
-- Script: 003b_RenameUnitOfMeasure.sql
-- Description: Rename UNITOFMEASURE column to BASEUOM
-- Author: Antigravity
-- Date: 2026-02-10
-- =============================================

PRINT 'Renaming UNITOFMEASURE to BASEUOM in ITEM table...'
GO

-- Check if UNITOFMEASURE column exists and BASEUOM doesn't
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ITEM' AND COLUMN_NAME = 'UNITOFMEASURE')
   AND NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ITEM' AND COLUMN_NAME = 'BASEUOM')
BEGIN
    EXEC sp_rename 'ITEM.UNITOFMEASURE', 'BASEUOM', 'COLUMN';
    PRINT '  - Renamed UNITOFMEASURE to BASEUOM'
END
ELSE IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ITEM' AND COLUMN_NAME = 'BASEUOM')
BEGIN
    PRINT '  - BASEUOM column already exists, skipping rename'
END
ELSE
BEGIN
    PRINT '  - WARNING: UNITOFMEASURE column not found'
END

GO

PRINT 'Column rename completed!'
GO
