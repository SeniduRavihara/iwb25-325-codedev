import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating settings table
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
