import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating code_templates table
public function createCodeTemplatesTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 008_create_code_templates_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS code_templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER NOT NULL,
            language TEXT NOT NULL,
            function_name TEXT NOT NULL,
            parameters TEXT NOT NULL, -- JSON array of parameter names
            return_type TEXT NOT NULL,
            starter_code TEXT NOT NULL,
            execution_template TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
        )
    `);

    if result is error {
        return error("Failed to create code_templates table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_code_templates_challenge ON code_templates(challenge_id)
    `);

    if indexResult1 is error {
        return error("Failed to create challenge index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_code_templates_language ON code_templates(language)
    `);

    if indexResult2 is error {
        return error("Failed to create language index: " + indexResult2.message());
    }

    io:println("✓ Code templates table created successfully");
}
