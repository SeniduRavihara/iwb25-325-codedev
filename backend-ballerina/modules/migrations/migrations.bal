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
        name: "002_create_roles_table",
        execute: createRolesTable
    },
    {
        version: 3,
        name: "003_create_user_roles_table",
        execute: createUserRolesTable
    }
];

// Migration function implementations
public function createUsersTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 001_create_users_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        return error("Failed to create users table: " + result.message());
    }

    // Create indexes
    sql:ExecutionResult|error indexResult1 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `);

    if indexResult1 is error {
        return error("Failed to create username index: " + indexResult1.message());
    }

    sql:ExecutionResult|error indexResult2 = dbClient->execute(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

    if indexResult2 is error {
        return error("Failed to create email index: " + indexResult2.message());
    }

    io:println("✓ Users table created successfully");
}

public function createRolesTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 002_create_roles_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        return error("Failed to create roles table: " + result.message());
    }

    io:println("✓ Roles table created successfully");
}

public function createUserRolesTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 003_create_user_roles_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS user_roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            role_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            UNIQUE(user_id, role_id)
        )
    `);

    if result is error {
        return error("Failed to create user_roles table: " + result.message());
    }

    io:println("✓ User roles table created successfully");
}
