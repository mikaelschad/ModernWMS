-- 1. Alter USERS table to support advanced password security
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[USERS]') AND name = 'PasswordHash')
BEGIN
    ALTER TABLE USERS ADD PasswordHash NVARCHAR(255);
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[USERS]') AND name = 'PasswordChangedDate')
BEGIN
    ALTER TABLE USERS ADD PasswordChangedDate DATETIME2;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[USERS]') AND name = 'PasswordExpiryDate')
BEGIN
    ALTER TABLE USERS ADD PasswordExpiryDate DATETIME2;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[USERS]') AND name = 'MustChangePassword')
BEGIN
    ALTER TABLE USERS ADD MustChangePassword BIT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[USERS]') AND name = 'FailedLoginAttempts')
BEGIN
    ALTER TABLE USERS ADD FailedLoginAttempts INT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[USERS]') AND name = 'LockedUntil')
BEGIN
    ALTER TABLE USERS ADD LockedUntil DATETIME2;
END

-- 2. Create PASSWORD_HISTORY table to prevent reuse
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PASSWORD_HISTORY]') AND type in (N'U'))
BEGIN
    CREATE TABLE PASSWORD_HISTORY (
        HistoryId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserId NVARCHAR(50) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (UserId) REFERENCES USERS(USERID)
    );

    CREATE INDEX IX_PASSWORD_HISTORY_USER ON PASSWORD_HISTORY(UserId);
    CREATE INDEX IX_PASSWORD_HISTORY_DATE ON PASSWORD_HISTORY(CreatedDate DESC);
END
GO
