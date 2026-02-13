
-- Supplemental Permissions for technical master data
CREATE PROCEDURE #AddPermission 
    @entity NVARCHAR(50), 
    @operation NVARCHAR(50), 
    @desc NVARCHAR(255)
AS
BEGIN
    DECLARE @pid NVARCHAR(100) = @entity + '_' + @operation;
    IF NOT EXISTS (SELECT 1 FROM PERMISSIONS WHERE PERMISSIONID = @pid)
        INSERT INTO PERMISSIONS (PERMISSIONID, ENTITY, OPERATION, DESCRIPTION) 
        VALUES (@pid, @entity, @operation, @desc);
END
GO

-- ITEMGROUP
EXEC #AddPermission 'ITEMGROUP', 'READ', 'Read access to item groups';
EXEC #AddPermission 'ITEMGROUP', 'CREATE', 'Create item groups';
EXEC #AddPermission 'ITEMGROUP', 'UPDATE', 'Update item groups';

-- ZONE
EXEC #AddPermission 'ZONE', 'READ', 'Read access to zones';
EXEC #AddPermission 'ZONE', 'CREATE', 'Create zones';
EXEC #AddPermission 'ZONE', 'UPDATE', 'Update zones';

-- SECTION
EXEC #AddPermission 'SECTION', 'READ', 'Read access to sections';
EXEC #AddPermission 'SECTION', 'CREATE', 'Create sections';
EXEC #AddPermission 'SECTION', 'UPDATE', 'Update sections';

-- LOCATION
EXEC #AddPermission 'LOCATION', 'READ', 'Read access to locations';
EXEC #AddPermission 'LOCATION', 'CREATE', 'Create locations';
EXEC #AddPermission 'LOCATION', 'UPDATE', 'Update locations';

-- CONSIGNEE
EXEC #AddPermission 'CONSIGNEE', 'READ', 'Read access to consignees';
EXEC #AddPermission 'CONSIGNEE', 'CREATE', 'Create consignees';
EXEC #AddPermission 'CONSIGNEE', 'UPDATE', 'Update consignees';

-- ORDER
EXEC #AddPermission 'ORDER', 'READ', 'Read access to orders';
EXEC #AddPermission 'ORDER', 'CREATE', 'Create orders';
EXEC #AddPermission 'ORDER', 'UPDATE', 'Update/Cancel orders';

DROP PROCEDURE #AddPermission;
GO

-- Assign new permissions to ADMIN
INSERT INTO ROLE_PERMISSIONS (ROLEID, PERMISSIONID)
SELECT 'ADMIN', PERMISSIONID FROM PERMISSIONS
WHERE NOT EXISTS (SELECT 1 FROM ROLE_PERMISSIONS WHERE ROLEID = 'ADMIN' AND PERMISSIONID = PERMISSIONS.PERMISSIONID);
GO

-- Assign standard read permissions to VIEWER
INSERT INTO ROLE_PERMISSIONS (ROLEID, PERMISSIONID)
SELECT 'VIEWER', PERMISSIONID FROM PERMISSIONS
WHERE OPERATION = 'READ'
AND NOT EXISTS (SELECT 1 FROM ROLE_PERMISSIONS WHERE ROLEID = 'VIEWER' AND PERMISSIONID = PERMISSIONS.PERMISSIONID);
GO
