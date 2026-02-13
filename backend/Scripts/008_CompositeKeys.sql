-- Drop the implementation of singular primary key
ALTER TABLE ITEM
DROP CONSTRAINT IF EXISTS PK_ITEM;

-- Update existing NULL CUSTIDs to a default value to allow NOT NULL constraint
UPDATE ITEM SET CUSTID = 'UNKNOWN' WHERE CUSTID IS NULL;

-- Ensure CUSTID is NOT NULL (required for PK)
ALTER TABLE ITEM
ALTER COLUMN CUSTID nvarchar(30) NOT NULL;

-- Re-add the primary key as a composite key (ITEM + CUSTID)
ALTER TABLE ITEM
ADD CONSTRAINT PK_ITEM_CUST PRIMARY KEY CLUSTERED (ITEM ASC, CUSTID ASC);
