CREATE OR ALTER TRIGGER [dbo].[TR_CUSTOMER_AUDIT]
ON [dbo].[CUSTOMER]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- INSERT
    IF EXISTS (SELECT * FROM inserted) AND NOT EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, NewValues, ChangedBy)
        SELECT 'CUSTOMER', i.CUSTID, 'INSERT', 
               (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               ISNULL(i.LASTUSER, 'SYSTEM')
        FROM inserted i;
    END

    -- UPDATE
    ELSE IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, OldValues, NewValues, ChangedBy)
        SELECT 'CUSTOMER', i.CUSTID, 'UPDATE',
               (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               (SELECT i.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               ISNULL(i.LASTUSER, 'SYSTEM')
        FROM inserted i
        JOIN deleted d ON i.CUSTID = d.CUSTID;
    END

    -- DELETE
    ELSE IF NOT EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AUDIT_LOG (TableName, RecordId, Action, OldValues, ChangedBy)
        SELECT 'CUSTOMER', d.CUSTID, 'DELETE', 
               (SELECT d.* FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
               ISNULL(d.LASTUSER, 'SYSTEM')
        FROM deleted d;
    END
END
GO
