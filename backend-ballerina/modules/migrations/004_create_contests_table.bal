import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating contests table
public function createContestsTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 004_create_contests_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS contests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            duration INTEGER NOT NULL, -- in minutes
            status TEXT CHECK(status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
            max_participants INTEGER,
            prizes TEXT, -- JSON array of prizes
            rules TEXT,
            created_by INTEGER NOT NULL,
            registration_deadline DATETIME NOT NULL,
            participants_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    if result is error {
        return error("Failed to create contests table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status)
    `);

    if indexResult1 is error {
        return error("Failed to create status index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time)
    `);

    if indexResult2 is error {
        return error("Failed to create start_time index: " + indexResult2.message());
    }

    sql:ExecutionResult|error indexResult3 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_contests_created_by ON contests(created_by)
    `);

    if indexResult3 is error {
        return error("Failed to create created_by index: " + indexResult3.message());
    }

    io:println("✓ Contests table created successfully");
}
