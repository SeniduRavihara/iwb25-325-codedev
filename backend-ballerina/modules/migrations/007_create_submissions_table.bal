import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating submissions table
public function createSubmissionsTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 007_create_submissions_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            challenge_id INTEGER NOT NULL,
            contest_id INTEGER, -- NULL if not part of a contest
            code TEXT NOT NULL,
            language TEXT NOT NULL,
            status TEXT CHECK(status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
            result TEXT CHECK(result IN ('accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error', 'partial_correct')) DEFAULT 'pending',
            score INTEGER DEFAULT 0,
            execution_time INTEGER, -- in milliseconds
            memory_used INTEGER, -- in KB
            error_message TEXT,
            test_cases_passed INTEGER DEFAULT 0,
            total_test_cases INTEGER DEFAULT 0,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
            FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE SET NULL,
            UNIQUE(user_id, challenge_id, contest_id)
        )
    `);

    if result is error {
        return error("Failed to create submissions table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id)
    `);

    if indexResult1 is error {
        return error("Failed to create user index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON submissions(challenge_id)
    `);

    if indexResult2 is error {
        return error("Failed to create challenge index: " + indexResult2.message());
    }

    sql:ExecutionResult|error indexResult3 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_submissions_contest ON submissions(contest_id)
    `);

    if indexResult3 is error {
        return error("Failed to create contest index: " + indexResult3.message());
    }

    sql:ExecutionResult|error indexResult4 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status)
    `);

    if indexResult4 is error {
        return error("Failed to create status index: " + indexResult4.message());
    }

    sql:ExecutionResult|error indexResult5 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at)
    `);

    if indexResult5 is error {
        return error("Failed to create submitted_at index: " + indexResult5.message());
    }

    io:println("✓ Submissions table created successfully");
}
