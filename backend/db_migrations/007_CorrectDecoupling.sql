-- 1. Restore FK_LOCATION_ZONE (Location depends on Zone)
-- This was dropped effectively in previous step, we bring it back as Restrict
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_LOCATION_ZONE')
BEGIN
    ALTER TABLE LOCATION
    ADD CONSTRAINT FK_LOCATION_ZONE FOREIGN KEY (FACILITY, ZONE)
    REFERENCES ZONE (FACILITY, ZONE);
END

-- 2. Drop FK_SECTION_ZONE (Section NOT dependent on Zone)
-- Decoupling Zones and Sections as requested
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SECTION_ZONE')
BEGIN
    ALTER TABLE SECTION DROP CONSTRAINT FK_SECTION_ZONE;
END
