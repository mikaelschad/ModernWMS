IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LOCATIONTYPE' AND xtype='U')
BEGIN
    CREATE TABLE LOCATIONTYPE (
        LOCATIONTYPE NVARCHAR(20) NOT NULL PRIMARY KEY,
        DESCRIPTION NVARCHAR(100) NOT NULL,
        STATUS CHAR(1) NOT NULL DEFAULT 'A',
        LASTUPDATE DATETIME NOT NULL DEFAULT GETDATE(),
        LASTUSER NVARCHAR(50) NOT NULL DEFAULT 'SYSTEM'
    );
END

-- Seed Data
MERGE INTO LOCATIONTYPE AS Target
USING (VALUES 
    ('Storage', 'Storage Location'),
    ('Pick Front', 'Pick Front Location'),
    ('Door', 'Door Location'),
    ('Staging', 'Staging Area'),
    ('Returns', 'Returns Area'),
    ('Damage', 'Damage/Quarantine Area'),
    ('Quality Control', 'Quality Control Area'),
    ('Pick and Drop', 'Pick and Drop Point')
) AS Source (LOCATIONTYPE, DESCRIPTION)
ON Target.LOCATIONTYPE = Source.LOCATIONTYPE
WHEN NOT MATCHED BY TARGET THEN
    INSERT (LOCATIONTYPE, DESCRIPTION, STATUS, LASTUPDATE, LASTUSER)
    VALUES (Source.LOCATIONTYPE, Source.DESCRIPTION, 'A', GETDATE(), 'SYSTEM');
