import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating contest participants table
public function createContestParticipantsTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 006_create_contest_participants_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS contest_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contest_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            score INTEGER DEFAULT 0,
            rank INTEGER DEFAULT 0,
            submissions_count INTEGER DEFAULT 0,
            last_submission_time DATETIME,
            registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(contest_id, user_id)
        )
    `);

    if result is error {
        return error("Failed to create contest participants table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contest_participants_contest ON contest_participants(contest_id)
    `);

    if indexResult1 is error {
        return error("Failed to create contest index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contest_participants_user ON contest_participants(user_id)
    `);

    if indexResult2 is error {
        return error("Failed to create user index: " + indexResult2.message());
    }

    sql:ExecutionResult|error indexResult3 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contest_participants_rank ON contest_participants(contest_id, rank)
    `);

    if indexResult3 is error {
        return error("Failed to create rank index: " + indexResult3.message());
    }

    io:println("✓ Contest participants table created successfully");
}
