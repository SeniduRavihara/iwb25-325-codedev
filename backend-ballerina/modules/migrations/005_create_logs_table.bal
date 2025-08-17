import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating logs table
public function createLogsTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 005_create_logs_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `);

    if result is error {
        return error("Failed to create logs table: " + result.message());
    }

    // Create indexes for better performance
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level)
    `);

    if indexResult1 is error {
        return error("Failed to create logs level index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at)
    `);

    if indexResult2 is error {
        return error("Failed to create logs created_at index: " + indexResult2.message());
    }

    io:println("✓ Logs table created successfully");
}
