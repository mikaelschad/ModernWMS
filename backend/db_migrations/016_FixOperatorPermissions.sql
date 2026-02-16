-- Grant Facility, Zone, Section, Location, LocationType read access to OPERATOR
-- This is necessary because the frontend fetches this data to initialize the app (Navigation, Facilities Page)

IF NOT EXISTS (SELECT * FROM ROLE_PERMISSIONS WHERE RoleId = 'OPERATOR' AND EntityType = 'Facility')
BEGIN
    INSERT INTO ROLE_PERMISSIONS (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint)
    VALUES ('OPERATOR', 'Facility', 1, 0, 0, 0, 0);
END

IF NOT EXISTS (SELECT * FROM ROLE_PERMISSIONS WHERE RoleId = 'OPERATOR' AND EntityType = 'Zone')
BEGIN
    INSERT INTO ROLE_PERMISSIONS (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint)
    VALUES ('OPERATOR', 'Zone', 1, 0, 0, 0, 0);
END

IF NOT EXISTS (SELECT * FROM ROLE_PERMISSIONS WHERE RoleId = 'OPERATOR' AND EntityType = 'Section')
BEGIN
    INSERT INTO ROLE_PERMISSIONS (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint)
    VALUES ('OPERATOR', 'Section', 1, 0, 0, 0, 0);
END

IF NOT EXISTS (SELECT * FROM ROLE_PERMISSIONS WHERE RoleId = 'OPERATOR' AND EntityType = 'Location')
BEGIN
    INSERT INTO ROLE_PERMISSIONS (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint)
    VALUES ('OPERATOR', 'Location', 1, 0, 0, 0, 0);
END

-- Also LocationType which might be used in lookups
IF NOT EXISTS (SELECT * FROM ROLE_PERMISSIONS WHERE RoleId = 'OPERATOR' AND EntityType = 'LocationType')
BEGIN
    INSERT INTO ROLE_PERMISSIONS (RoleId, EntityType, CanRead, CanCreate, CanUpdate, CanDisable, CanPrint)
    VALUES ('OPERATOR', 'LocationType', 1, 0, 0, 0, 0);
END
GO
