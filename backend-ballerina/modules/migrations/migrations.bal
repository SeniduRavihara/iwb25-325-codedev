import ballerina/sql;
import ballerina/io;
import ballerina/file;
import ballerina/regex;
import ballerinax/java.jdbc;

// Migration record type
public type Migration record {|
    int id;
    string filename;
    string executed_at;
|};

public type MigrationFile record {|
    int version;
    string filename;
    string content;
|};

// Migration manager class
public class MigrationManager {
    private final jdbc:Client dbClient;
    private final string migrationsPath;

    public function init(jdbc:Client dbClient, string migrationsPath = "./resources/migrations/") {
        self.dbClient = dbClient;
        self.migrationsPath = migrationsPath;
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
    public function getPendingMigrations() returns MigrationFile[]|error {
        // For now, return empty array - you can implement file reading later
        MigrationFile[] pendingMigrations = [];
        
        // Try to read migrations directory
        file:MetaData[]|file:Error files = file:readDir(self.migrationsPath);
        if files is file:Error {
            io:println("No migrations directory found or error reading: " + files.message());
            return pendingMigrations;
        }

        // Get executed migrations
        string[]|error executedMigrations = self.getExecutedMigrations();
        if executedMigrations is error {
            return executedMigrations;
        }
        
        foreach file:MetaData fileInfo in files {
            if fileInfo.dir {
                continue;
            }

            // Extract filename from absolute path
            string[] pathParts = regex:split(fileInfo.absPath, "/");
            if pathParts.length() == 0 {
                pathParts = regex:split(fileInfo.absPath, "\\\\"); // Windows path
            }
            string filename = pathParts[pathParts.length() - 1];

            // Check if it's a SQL file
            if !filename.endsWith(".sql") {
                continue;
            }

            // Check if already executed
            boolean isExecuted = false;
            foreach string executed in executedMigrations {
                if executed == filename {
                    isExecuted = true;
                    break;
                }
            }

            if !isExecuted {
                // Parse version from filename (e.g., 001_create_users_table.sql)
                string[] parts = regex:split(filename, "_");
                if parts.length() > 0 {
                    int|error version = int:fromString(parts[0]);
                    if version is int {
                        string|io:Error content = io:fileReadString(fileInfo.absPath);
                        if content is string {
                            pendingMigrations.push({
                                version: version,
                                filename: filename,
                                content: content
                            });
                        }
                    }
                }
            }
        }

        // Simple bubble sort by version
        int n = pendingMigrations.length();
        foreach int i in 0 ..< n {
            foreach int j in 0 ..< (n - i - 1) {
                if pendingMigrations[j].version > pendingMigrations[j + 1].version {
                    MigrationFile temp = pendingMigrations[j];
                    pendingMigrations[j] = pendingMigrations[j + 1];
                    pendingMigrations[j + 1] = temp;
                }
            }
        }
        
        return pendingMigrations;
    }

    // Run pending migrations
    public function migrate() returns error? {
        check self.initMigrationsTable();
        
        MigrationFile[]|error pendingMigrations = self.getPendingMigrations();
        if pendingMigrations is error {
            return pendingMigrations;
        }

        if pendingMigrations.length() == 0 {
            io:println("✓ No pending migrations");
            return;
        }

        io:println(string `Running ${pendingMigrations.length()} migrations...`);

        foreach MigrationFile migration in pendingMigrations {
            io:println(string `Executing: ${migration.filename}`);
            
            // Execute migration SQL
            sql:ParameterizedQuery query = `${migration.content}`;
            sql:ExecutionResult|error result = self.dbClient->execute(query);
            if result is error {
                return error(string `Failed to execute migration ${migration.filename}: ${result.message()}`);
            }

            // Mark as executed
            sql:ExecutionResult|error insertResult = self.dbClient->execute(`
                INSERT INTO migrations (filename) VALUES (${migration.filename})
            `);
            
            if insertResult is error {
                return error(string `Failed to record migration ${migration.filename}: ${insertResult.message()}`);
            }
            
            io:println(string `✓ ${migration.filename} executed successfully`);
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
        
        // Remove from migrations table
        sql:ExecutionResult|error result = self.dbClient->execute(`
            DELETE FROM migrations WHERE id = ${lastMigration.value.id}
        `);
        
        if result is error {
            return result;
        }
        
        io:println("✓ Rollback completed (Note: Schema changes not automatically reverted)");
    }
}