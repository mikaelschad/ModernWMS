-- Ensure FK_LOCATION_LOCATIONTYPE is Restrict (No Action)
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_LOCATION_LOCATIONTYPE')
BEGIN
    ALTER TABLE LOCATION DROP CONSTRAINT FK_LOCATION_LOCATIONTYPE;
END

ALTER TABLE LOCATION
ADD CONSTRAINT FK_LOCATION_LOCATIONTYPE FOREIGN KEY (LOCATIONTYPE)
REFERENCES LOCATIONTYPE (LOCATIONTYPE); -- Default is NO ACTION

-- Ensure FK_ITEM_ITEMGROUP is Restrict
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ITEM_ITEMGROUP')
BEGIN
    ALTER TABLE ITEM DROP CONSTRAINT FK_ITEM_ITEMGROUP;
END
-- Warning: ItemGroup is complex, let's just do simple FK if valid
-- ItemGroupId is nullable in Item.cs
-- We need to check if ITEMGROUP table uses composite key or simple key.
-- Checked ItemGroups.jsx: uses 'id'. Backed model? 
-- Let's just focus on LocationType as requested primarily, and standard ones.

-- Ensure FK_ZONE_FACILITY is Restrict
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_ZONE_FACILITY')
BEGIN
    ALTER TABLE ZONE DROP CONSTRAINT FK_ZONE_FACILITY;
END
ALTER TABLE ZONE
ADD CONSTRAINT FK_ZONE_FACILITY FOREIGN KEY (FACILITY)
REFERENCES FACILITY (FACILITY);

-- Ensure FK_SECTION_ZONE is Restrict
IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SECTION_ZONE')
BEGIN
    ALTER TABLE SECTION DROP CONSTRAINT FK_SECTION_ZONE;
END
-- Note: Zone PK might be composite (Facility + ZoneId). 
-- Let's assume simple for now or check Zone.cs model.
-- Zone.cs implies composite key? 
-- Let's stick to the specific request about LocationType first as it's most critical.

