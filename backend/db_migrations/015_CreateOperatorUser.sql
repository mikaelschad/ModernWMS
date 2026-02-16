-- Create or update 'operator' user with predefined password hash ('Operator123!')
DECLARE @Hash NVARCHAR(255) = '$2a$12$3Z3/.4.4zRvRKpq9drPw3unZSXOWiMd7KN2fGUnhgcbeDX2DhJp7i';
DECLARE @OperatorId NVARCHAR(50) = 'operator';
DECLARE @OperatorName NVARCHAR(100) = 'Warehouse Operator';

-- Ensure USERS table exists (it should)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'USERS')
BEGIN
    IF NOT EXISTS (SELECT * FROM USERS WHERE USERID = @OperatorId)
    BEGIN
        -- Insert new operator user
        INSERT INTO USERS (
            USERID, NAME, PasswordHash, FACILITY, STATUS, LANGUAGE, MustChangePassword, 
            FailedLoginAttempts, PasswordChangedDate, LASTUPDATE, LASTUSER
        )
        VALUES (
            @OperatorId, @OperatorName, @Hash, 'ALL', 'A', 'en', 1, 
            0, GETUTCDATE(), GETUTCDATE(), 'SYSTEM'
        );
        PRINT 'User operator created.';
    END
    ELSE
    BEGIN
        -- Update existing operator user password
        UPDATE USERS 
        SET PasswordHash = @Hash, 
            MustChangePassword = 1,
            LockedUntil = NULL,
            FailedLoginAttempts = 0
        WHERE USERID = @OperatorId;
        PRINT 'User operator updated.';
    END

    -- Assign 'OPERATOR' role
    IF NOT EXISTS (SELECT * FROM USER_ROLES WHERE USERID = @OperatorId AND ROLEID = 'OPERATOR')
    BEGIN
        INSERT INTO USER_ROLES (USERID, ROLEID) VALUES (@OperatorId, 'OPERATOR');
    END

    -- Give access to all facilities for test
    IF NOT EXISTS (SELECT * FROM USER_FACILITIES WHERE USERID = @OperatorId)
    BEGIN
        INSERT INTO USER_FACILITIES (USERID, FACILITYID)
        SELECT @OperatorId, FACILITY FROM FACILITY;
    END
END
ELSE
BEGIN
    PRINT 'USERS table not found. Skipping user creation.';
END
GO
