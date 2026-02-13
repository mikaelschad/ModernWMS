-- =============================================
-- Script: 005_RemoveLegacyPasswordColumn.sql
-- Description: Remove legacy PASSWORD column after migration to PasswordHash
-- Author: Antigravity
-- Date: 2026-02-10
-- =============================================

PRINT 'Removing legacy PASSWORD column from USERS table...'
GO

-- Verify all users have been migrated (have PasswordHash)
DECLARE @unmigrated INT
SELECT @unmigrated = COUNT(*) 
FROM USERS 
WHERE (PasswordHash IS NULL OR PasswordHash = '') 
  AND STATUS = 'A'

IF @unmigrated > 0
BEGIN
    PRINT '  - WARNING: ' + CAST(@unmigrated AS VARCHAR) + ' active users still need password migration!'
    PRINT '  - Please run password migration before dropping PASSWORD column'
    RAISERROR('Cannot drop PASSWORD column - users not migrated', 16, 1)
END
ELSE
BEGIN
    -- Drop the PASSWORD column
    IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'USERS' AND COLUMN_NAME = 'PASSWORD')
    BEGIN
        ALTER TABLE USERS DROP COLUMN PASSWORD;
        PRINT '  - Dropped PASSWORD column successfully'
    END
    ELSE
    BEGIN
        PRINT '  - PASSWORD column already removed'
    END
END

GO

PRINT 'Legacy password column removal completed!'
GO
