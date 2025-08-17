import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating users table
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
