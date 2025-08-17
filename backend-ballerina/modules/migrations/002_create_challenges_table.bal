import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating challenges table
public function createChallengesTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 002_create_challenges_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
            tags TEXT, -- JSON array of tags
            time_limit INTEGER NOT NULL, -- in minutes
            memory_limit INTEGER NOT NULL, -- in MB
            author_id INTEGER NOT NULL,
            submissions_count INTEGER DEFAULT 0,
            success_rate DECIMAL(5,2) DEFAULT 0.0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    if result is error {
        return error("Failed to create challenges table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON challenges(difficulty)
    `);

    if indexResult1 is error {
        return error("Failed to create difficulty index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_challenges_author ON challenges(author_id)
    `);

    if indexResult2 is error {
        return error("Failed to create author index: " + indexResult2.message());
    }

    sql:ExecutionResult|error indexResult3 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_challenges_created_at ON challenges(created_at)
    `);

    if indexResult3 is error {
        return error("Failed to create created_at index: " + indexResult3.message());
    }

    io:println("✓ Challenges table created successfully");
}
