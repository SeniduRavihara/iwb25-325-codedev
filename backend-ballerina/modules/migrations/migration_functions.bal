import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function implementations
public function createUsersTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 001_create_users_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        return error("Failed to create users table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);

    if indexResult1 is error {
        return error("Failed to create username index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    if indexResult2 is error {
        return error("Failed to create email index: " + indexResult2.message());
    }

    io:println("✓ Users table created successfully");
}

public function createRolesTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 002_create_roles_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        return error("Failed to create roles table: " + result.message());
    }

    io:println("✓ Roles table created successfully");
}

public function createUserRolesTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 003_create_user_roles_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS user_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            role_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            UNIQUE(user_id, role_id)
        )
    `);

    if result is error {
        return error("Failed to create user_roles table: " + result.message());
    }

    io:println("✓ User roles table created successfully");
}

// Example of how easy it is to add new migrations
public function createSettingsTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 004_create_settings_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        return error("Failed to create settings table: " + result.message());
    }

    // Create index for faster lookups
    sql:ExecutionResult|error indexResult = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key)
    `);

    if indexResult is error {
        return error("Failed to create settings key index: " + indexResult.message());
    }

    io:println("✓ Settings table created successfully");
}
