-- Drop table if exists to reset schema
DROP TABLE IF EXISTS ROLE_PERMISSIONS;
GO

-- Create new ROLE_PERMISSIONS table
CREATE TABLE ROLE_PERMISSIONS (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RoleId NVARCHAR(50) NOT NULL,
    EntityType NVARCHAR(50) NOT NULL,
    CanRead BIT NOT NULL DEFAULT 0,
    CanCreate BIT NOT NULL DEFAULT 0,
    CanUpdate BIT NOT NULL DEFAULT 0,
    CanDisable BIT NOT NULL DEFAULT 0,
    CanPrint BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (RoleId) REFERENCES ROLES(ROLEID),
    UNIQUE(RoleId, EntityType)
);

-- Seed default permissions for ADMIN role
INSERT INTO ROLE_PERMISSIONS (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint)
VALUES 
    ('ADMIN', 'User', 1, 1, 1, 1, 0),
    ('ADMIN', 'Role', 1, 1, 1, 1, 0), -- Added Role management
    ('ADMIN', 'Customer', 1, 1, 1, 1, 0),
    ('ADMIN', 'Facility', 1, 1, 1, 1, 0),
    ('ADMIN', 'Plate', 1, 1, 1, 1, 1),
    ('ADMIN', 'Item', 1, 1, 1, 1, 0),
    ('ADMIN', 'Order', 1, 1, 1, 1, 0);

-- Seed default permissions for OPERATOR role
INSERT INTO ROLE_PERMISSIONS (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint)
VALUES 
    ('OPERATOR', 'Plate', 1, 1, 1, 0, 1),
    ('OPERATOR', 'Item', 1, 0, 0, 0, 0),
    ('OPERATOR', 'Order', 1, 1, 1, 0, 1),
    ('OPERATOR', 'Customer', 1, 0, 0, 0, 0);

-- Seed default permissions for VIEWER role
INSERT INTO ROLE_PERMISSIONS (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint)
VALUES 
    ('VIEWER', 'Plate', 1, 0, 0, 0, 0),
    ('VIEWER', 'Item', 1, 0, 0, 0, 0),
    ('VIEWER', 'Order', 1, 0, 0, 0, 0),
    ('VIEWER', 'Customer', 1, 0, 0, 0, 0);
