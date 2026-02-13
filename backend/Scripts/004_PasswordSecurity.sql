-- =============================================
-- Script: 004_PasswordSecurity.sql
-- Description: Add password security features
-- Author: Antigravity
-- Date: 2026-02-10
-- =============================================

PRINT 'Adding password security features...'
GO

-- =============================================
-- Add password security columns to USERS
-- =============================================
PRINT 'Adding password security columns to USERS table...'

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'USERS' AND COLUMN_NAME = 'PasswordHash')
BEGIN
    ALTER TABLE USERS ADD 
        PasswordHash NVARCHAR(100) NULL,
        PasswordChangedDate DATETIME2 NULL,
        PasswordExpiryDate DATETIME2 NULL,
        MustChangePassword BIT NOT NULL DEFAULT 0,
        FailedLoginAttempts INT NOT NULL DEFAULT 0,
        LockedUntil DATETIME2 NULL,
        LastLoginDate DATETIME2 NULL;
    
    PRINT '  - Added password security columns'
END
ELSE
BEGIN
    PRINT '  - Password security columns already exist'
END

GO

-- ======================================================================================================
-- Create PASSWORD_HISTORY table
-- =============================================
PRINT 'Creating PASSWORD_HISTORY table...'

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PASSWORD_HISTORY')
BEGIN
    CREATE TABLE PASSWORD_HISTORY (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId VARCHAR(20) NOT NULL,
        PasswordHash NVARCHAR(100) NOT NULL,
        ChangedDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        FOREIGN KEY (UserId) REFERENCES USERS(USERID)
    );
    
    CREATE INDEX IX_PASSWORD_HISTORY_UserId ON PASSWORD_HISTORY(UserId, ChangedDate DESC);
    
    PRINT '  - Created PASSWORD_HISTORY table'
END
ELSE
BEGIN
    PRINT '  - PASSWORD_HISTORY table already exists'
END

GO

PRINT 'Password security migration completed!'
PRINT 'NOTE: Run password migration utility to hash existing passwords'
GO
