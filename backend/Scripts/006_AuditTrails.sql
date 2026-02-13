-- Create AUDIT_LOG table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[AUDIT_LOG]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[AUDIT_LOG] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [TableName] NVARCHAR(100) NOT NULL,
        [RecordId] NVARCHAR(100) NOT NULL,
        [Action] NVARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN, SECURITY
        [OldValues] NVARCHAR(MAX),
        [NewValues] NVARCHAR(MAX),
        [ChangedBy] NVARCHAR(100),
        [ChangedDate] DATETIME2 DEFAULT GETDATE()
    );
END
GO

-- Create Audit Trigger for ITEM table
CREATE OR ALTER TRIGGER [dbo].[TR_ITEM_AUDIT]
ON [dbo].[ITEM]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- INSERT
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, NewValues, ChangedBy)
        SELECT 'ITEM', ITEM, 'INSERT', (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), LASTUSER
        FROM inserted i;
    END
    -- UPDATE
    ELSE IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, OldValues, NewValues, ChangedBy)
        SELECT 'ITEM', i.ITEM, 'UPDATE', 
               (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               i.LASTUSER
        FROM inserted i
        JOIN deleted d ON i.ITEM = d.ITEM;
    END
    -- DELETE
    ELSE IF NOT EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, OldValues, ChangedBy)
        SELECT 'ITEM', ITEM, 'DELETE', (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), LASTUSER
        FROM deleted d;
    END
END
GO

-- Create Audit Trigger for PLATE table
CREATE OR ALTER TRIGGER [dbo].[TR_PLATE_AUDIT]
ON [dbo].[PLATE]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- INSERT
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, NewValues, ChangedBy)
        SELECT 'PLATE', LPID, 'INSERT', (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), LASTUSER
        FROM inserted i;
    END
    -- UPDATE
    ELSE IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, OldValues, NewValues, ChangedBy)
        SELECT 'PLATE', i.LPID, 'UPDATE', 
               (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               i.LASTUSER
        FROM inserted i
        JOIN deleted d ON i.LPID = d.LPID;
    END
    -- DELETE
    ELSE IF NOT EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, OldValues, ChangedBy)
        SELECT 'PLATE', LPID, 'DELETE', (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER), LASTUSER
        FROM deleted d;
    END
END
GO
