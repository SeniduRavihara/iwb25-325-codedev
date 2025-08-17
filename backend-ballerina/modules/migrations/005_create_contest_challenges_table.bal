import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating contest_challenges junction table
public function createContestChallengesTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 005_create_contest_challenges_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS contest_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            contest_id INTEGER NOT NULL,
            challenge_id INTEGER NOT NULL,
            points INTEGER DEFAULT 0,
            order_index INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
            UNIQUE(contest_id, challenge_id)
        )
    `);

    if result is error {
        return error("Failed to create contest_challenges table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contest_challenges_contest ON contest_challenges(contest_id)
    `);

    if indexResult1 is error {
        return error("Failed to create contest index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contest_challenges_challenge ON contest_challenges(challenge_id)
    `);

    if indexResult2 is error {
        return error("Failed to create challenge index: " + indexResult2.message());
    }

    sql:ExecutionResult|error indexResult3 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contest_challenges_order ON contest_challenges(contest_id, order_index)
    `);

    if indexResult3 is error {
        return error("Failed to create order index: " + indexResult3.message());
    }

    io:println("✓ Contest challenges table created successfully");
}
