-- Add Receiving & Compliance Rules to CUSTOMER table
ALTER TABLE CUSTOMER ADD ReceiveRule_RequireExpDate BIT DEFAULT 0;
ALTER TABLE CUSTOMER ADD ReceiveRule_RequireMfgDate BIT DEFAULT 0;
ALTER TABLE CUSTOMER ADD ReceiveRule_LotValidationRegex NVARCHAR(255) NULL;
ALTER TABLE CUSTOMER ADD ReceiveRule_SerialValidationRegex NVARCHAR(255) NULL;
ALTER TABLE CUSTOMER ADD ReceiveRule_MinShelfLifeDays INT DEFAULT 0;
