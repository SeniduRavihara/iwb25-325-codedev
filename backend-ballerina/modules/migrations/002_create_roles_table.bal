import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating roles table
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
