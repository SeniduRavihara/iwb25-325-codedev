import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating test cases table
public function createTestCasesTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 003_create_test_cases_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS test_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER NOT NULL,
            input_data TEXT NOT NULL,
            expected_output TEXT NOT NULL,
            is_hidden BOOLEAN DEFAULT FALSE,
            points INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
        )
    `);

    if result is error {
        return error("Failed to create test cases table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_test_cases_challenge ON test_cases(challenge_id)
    `);

    if indexResult1 is error {
        return error("Failed to create challenge index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_test_cases_hidden ON test_cases(is_hidden)
    `);

    if indexResult2 is error {
        return error("Failed to create hidden index: " + indexResult2.message());
    }

    io:println("✓ Test cases table created successfully");
}
