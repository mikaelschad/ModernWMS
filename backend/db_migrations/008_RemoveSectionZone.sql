-- Remove ZONE column from SECTION table to fully decouple
-- Check if any constraints exist on this column first (like default constraints or remaining FKs)
-- We already dropped FK_SECTION_ZONE in 007, but let's be safe.

IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_SECTION_ZONE')
BEGIN
    ALTER TABLE SECTION DROP CONSTRAINT FK_SECTION_ZONE;
END

-- Drop the column
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SECTION' AND COLUMN_NAME = 'ZONE')
BEGIN
    ALTER TABLE SECTION DROP COLUMN ZONE;
END
