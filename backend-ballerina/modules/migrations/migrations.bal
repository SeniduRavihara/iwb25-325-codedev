import backend_ballerina.database;
import backend_ballerina.seeders;

import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration record type
public type Migration record {|
    int id;
    string filename;
    string executed_at;
|};

// Migration function type
public type MigrationFunction function (jdbc:Client) returns error?;

// Migration record type
public type MigrationInfo record {|
    int version;
    string name;
    MigrationFunction execute;
|};

// Migration manager class
public class MigrationManager {
    private final jdbc:Client dbClient;

    public function init(jdbc:Client dbClient) {
        self.dbClient = dbClient;
    }

    // Initialize migrations table
    public function initMigrationsTable() returns error? {
        sql:ExecutionResult|error result = self.dbClient->execute(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT UNIQUE NOT NULL,
                executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        if result is error {
            return result;
        }

        io:println("✓ Migrations table initialized");
    }

    // Get executed migrations
    public function getExecutedMigrations() returns string[]|error {
        stream<record {|string filename;|}, sql:Error?> migrationStream =
            self.dbClient->query(`SELECT filename FROM migrations ORDER BY id`);

        string[] executedMigrations = [];
        error? e = migrationStream.forEach(function(record {|string filename;|} migration) {
            executedMigrations.push(migration.filename);
        });

        error? closeResult = migrationStream.close();
        if closeResult is error {
            return closeResult;
        }

        if e is error {
            return e;
        }

        return executedMigrations;
    }

    // Get pending migrations
    public function getPendingMigrations() returns MigrationInfo[]|error {
        // Get executed migrations
        string[]|error executedMigrations = self.getExecutedMigrations();
        if executedMigrations is error {
            return executedMigrations;
        }

        MigrationInfo[] pendingMigrations = [];

        // Check each migration in the registry
        foreach MigrationInfo migration in MIGRATIONS {
            // Check if already executed
            boolean isExecuted = false;
            foreach string executed in executedMigrations {
                if executed == migration.name {
                    isExecuted = true;
                    break;
                }
            }

            io:println("Migration: ", migration.name, " - isExecuted: ", isExecuted);

            if !isExecuted {
                pendingMigrations.push(migration);
                io:println("✓ Added migration: ", migration.name, " (version: ", migration.version, ")");
            }
        }

        // Sort migrations by version
        pendingMigrations = self.sortMigrationsByVersion(pendingMigrations);

        io:println("Total pending migrations found: ", pendingMigrations.length());
        return pendingMigrations;
    }

    // Helper function to sort migrations by version
    private function sortMigrationsByVersion(MigrationInfo[] migrations) returns MigrationInfo[] {
        // Simple bubble sort by version
        int n = migrations.length();

        foreach int i in 0 ..< n {
            foreach int j in 0 ..< (n - i - 1) {
                if migrations[j].version > migrations[j + 1].version {
                    MigrationInfo temp = migrations[j];
                    migrations[j] = migrations[j + 1];
                    migrations[j + 1] = temp;
                }
            }
        }

        return migrations;
    }

    // Run pending migrations
    public function migrate() returns error? {
        check self.initMigrationsTable();

        MigrationInfo[]|error pendingMigrations = self.getPendingMigrations();
        if pendingMigrations is error {
            return pendingMigrations;
        }

        if pendingMigrations.length() == 0 {
            io:println("✓ No pending migrations");
            return;
        }

        io:println(string `Running ${pendingMigrations.length()} migrations...`);

        foreach MigrationInfo migration in pendingMigrations {
            io:println(string `Executing: ${migration.name}`);

            // Execute the migration function
            MigrationFunction func = migration.execute;
            error? result = func(self.dbClient);
            if result is error {
                return error(string `Failed to execute migration ${migration.name}: ${result.message()}`);
            }

            // Mark as executed
            sql:ExecutionResult|error insertResult = self.dbClient->execute(`
                INSERT INTO migrations (filename) VALUES (${migration.name})
            `);

            if insertResult is error {
                return error(string `Failed to record migration ${migration.name}: ${insertResult.message()}`);
            }

            io:println(string `✓ ${migration.name} executed successfully`);
        }

        io:println("✓ All migrations completed successfully");
    }

    // Rollback last migration (basic implementation)
    public function rollbackMigration() returns error? {
        stream<record {|string filename; int id;|}, sql:Error?> lastMigrationStream =
            self.dbClient->query(`SELECT filename, id FROM migrations ORDER BY id DESC LIMIT 1`);

        record {|record {|string filename; int id;|} value;|}|error? lastMigration = lastMigrationStream.next();
        error? closeResult = lastMigrationStream.close();

        if closeResult is error {
            return closeResult;
        }

        if lastMigration is () || lastMigration is error {
            io:println("No migrations to rollback");
            return;
        }

        io:println(string `Rolling back: ${lastMigration.value.filename}`);

        // Remove from migrations table using parameterized query
        sql:ExecutionResult|error result = self.dbClient->execute(`
            DELETE FROM migrations WHERE id = ${lastMigration.value.id}
        `);

        if result is error {
            return result;
        }

        io:println("✓ Rollback completed (Note: Schema changes not automatically reverted)");
    }
}

// Migration functions registry
public MigrationInfo[] MIGRATIONS = [
    {
        version: 1,
        name: "001_create_users_table",
        execute: createUsersTable
    },
    {
        version: 2,
        name: "002_create_challenges_table",
        execute: createChallengesTable
    },
    {
        version: 3,
        name: "003_create_test_cases_table",
        execute: createTestCasesTable
    },
    {
        version: 4,
        name: "004_create_contests_table",
        execute: createContestsTable
    },
    {
        version: 5,
        name: "005_create_contest_challenges_table",
        execute: createContestChallengesTable
    },
    {
        version: 6,
        name: "006_create_contest_participants_table",
        execute: createContestParticipantsTable
    },
    {
        version: 7,
        name: "007_create_submissions_table",
        execute: createSubmissionsTable
    },
    {
        version: 8,
        name: "008_add_function_templates_to_challenges",
        execute: addFunctionTemplatesToChallenges
    }
];

// CLI Helper Functions

// Run database migrations
public function runMigrations() returns error? {
    io:println("🔄 Running database migrations...");
    MigrationManager migrationManager = new (database:getDbClient());
    check migrationManager.migrate();
    return;
}

// Rollback last migration
public function rollbackMigration() returns error? {
    io:println("⏪ Rolling back last migration...");
    MigrationManager migrationManager = new (database:getDbClient());
    check migrationManager.rollbackMigration();
    return;
}

// Run database seeders
public function runSeeders() returns error? {
    seeders:DatabaseSeeder seeder = new (database:getDbClient());
    check seeder.seed();
    return;
}

// Fresh database (migrate + seed)
public function freshDatabase() returns error? {
    seeders:DatabaseSeeder seeder = new (database:getDbClient());
    check seeder.fresh();
    return;
}
