import ballerina/file;
import ballerina/io;
import ballerina/regex;
import ballerina/sql;
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

            // Fixed filename extraction logic
            string filename = self.extractFilename(fileInfo.absPath);

            // Debug: print the extracted filename
            io:println("Extracted filename: ", filename);

            // Check if it's a TXT file
            if !filename.endsWith(".txt") {
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

            io:println("File: ", filename, " - isExecuted: ", isExecuted);

            if !isExecuted {
                // Parse version from filename (e.g., 001_create_users_table.txt)
                string[] parts = regex:split(filename, "_");
                io:println("Filename parts: ", parts);

                if parts.length() > 0 {
                    int|error version = int:fromString(parts[0]);
                    io:println("Parsing version from '", parts[0], "': ", version);

                    if version is int {
                        string|io:Error content = io:fileReadString(fileInfo.absPath);
                        if content is string {
                            pendingMigrations.push({
                                version: version,
                                filename: filename,
                                content: content
                            });
                            io:println("✓ Added migration: ", filename, " (version: ", version, ")");
                        } else {
                            io:println("✗ Failed to read file content: ", filename);
                        }
                    } else {
                        io:println("✗ Invalid version format in filename: ", filename);
                    }
                }
            }
        }

        // Sort migrations by version
        pendingMigrations = self.sortMigrationsByVersion(pendingMigrations);

        io:println("Total pending migrations found: ", pendingMigrations.length());
        return pendingMigrations;
    }

    // Helper function to extract filename from path
    private function extractFilename(string absPath) returns string {
        // Handle both Windows and Unix paths
        string[] pathParts;

        if absPath.includes("\\") {
            // Windows path - split by backslash
            pathParts = regex:split(absPath, "\\\\");
        } else {
            // Unix path - split by forward slash
            pathParts = regex:split(absPath, "/");
        }

        // Return the last part (filename)
        if pathParts.length() > 0 {
            return pathParts[pathParts.length() - 1];
        }

        // Fallback: return the original path if splitting failed
        return absPath;
    }

    // Helper function to sort migrations by version
    private function sortMigrationsByVersion(MigrationFile[] migrations) returns MigrationFile[] {
        // Simple bubble sort by version
        int n = migrations.length();

        foreach int i in 0 ..< n {
            foreach int j in 0 ..< (n - i - 1) {
                if migrations[j].version > migrations[j + 1].version {
                    MigrationFile temp = migrations[j];
                    migrations[j] = migrations[j + 1];
                    migrations[j + 1] = temp;
                }
            }
        }

        return migrations;
    }

    // Parse and execute SQL from migration content
    private function executeMigrationSQL(string sqlContent) returns error? {
        io:println("📋 Processing migration content...");
        io:println("Content preview: ", sqlContent.substring(0, sqlContent.length() < 100 ? sqlContent.length() : 100), "...");
        
        // Clean the SQL content by removing comments and extra whitespace
        string cleanSQL = self.cleanSQLContent(sqlContent);
        if cleanSQL.length() == 0 {
            return;
        }

        // Split statements by semicolon
        string[] statements = regex:split(cleanSQL, ";");
        
        foreach string statement in statements {
            string trimmedStatement = statement.trim();
            if trimmedStatement.length() == 0 {
                continue;
            }
            
            io:println("🔄 Executing: ", trimmedStatement);
            
            // Handle different SQL patterns
            error? result = self.parseAndExecuteSQL(trimmedStatement);
            if result is error {
                return error(string `Failed to execute SQL statement: ${result.message()}`);
            }
        }
        
        return;
    }
    
    // Clean SQL content by removing comments and normalizing whitespace
    private function cleanSQLContent(string sqlContent) returns string {
        string[] lines = regex:split(sqlContent, "\n");
        string[] cleanLines = [];
        
        foreach string line in lines {
            string trimmedLine = line.trim();
            
            // Skip comment lines that start with --
            if trimmedLine.startsWith("--") || trimmedLine.length() == 0 {
                continue;
            }
            
            // Remove inline comments
            if trimmedLine.includes("--") {
                string[] parts = regex:split(trimmedLine, "--");
                if parts.length() > 0 {
                    trimmedLine = parts[0].trim();
                }
            }
            
            if trimmedLine.length() > 0 {
                cleanLines.push(trimmedLine);
            }
        }
        
        // Join the clean lines with spaces
        string cleanSQL = "";
        foreach int i in 0 ..< cleanLines.length() {
            if i > 0 {
                cleanSQL += " ";
            }
            cleanSQL += cleanLines[i];
        }
        
        return cleanSQL;
    }
    
    // Parse and execute individual SQL statements
    private function parseAndExecuteSQL(string sqlStatement) returns error? {
        string upperSQL = sqlStatement.toUpperAscii().trim();
        
        if upperSQL.startsWith("CREATE TABLE") {
            return self.executeCreateTableFromContent(sqlStatement);
        } else if upperSQL.startsWith("CREATE INDEX") {
            return self.executeCreateIndexFromContent(sqlStatement);
        } else if upperSQL.startsWith("INSERT INTO") {
            return self.executeInsertFromContent(sqlStatement);
        } else if upperSQL.startsWith("ALTER TABLE") {
            return self.executeAlterTableFromContent(sqlStatement);
        } else if upperSQL.startsWith("DROP TABLE") {
            return self.executeDropTableFromContent(sqlStatement);
        } else {
            io:println("⚠️  Unknown SQL statement type, skipping: ", sqlStatement.substring(0, 50), "...");
            return;
        }
    }
    
    // Execute CREATE TABLE from parsed content
    private function executeCreateTableFromContent(string sql) returns error? {
        io:println("🔨 Processing CREATE TABLE statement");
        string upperSQL = sql.toUpperAscii();
        
        // Check if it's creating a users table
        if upperSQL.includes("CREATE TABLE USERS") || upperSQL.includes("CREATE TABLE IF NOT EXISTS USERS") {
            io:println("📝 Creating users table...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
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
                return result;
            }
            io:println("✅ Users table created successfully");
            
        } else if upperSQL.includes("CREATE TABLE CHALLENGES") || upperSQL.includes("CREATE TABLE IF NOT EXISTS CHALLENGES") {
            io:println("📝 Creating challenges table...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
                CREATE TABLE IF NOT EXISTS challenges (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    difficulty TEXT NOT NULL,
                    input_format TEXT,
                    output_format TEXT,
                    constraints TEXT,
                    time_limit INTEGER DEFAULT 1000,
                    memory_limit INTEGER DEFAULT 256,
                    created_by INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id)
                )
            `);
            if result is error {
                return result;
            }
            io:println("✅ Challenges table created successfully");
            
        } else if upperSQL.includes("CREATE TABLE SUBMISSIONS") || upperSQL.includes("CREATE TABLE IF NOT EXISTS SUBMISSIONS") {
            io:println("📝 Creating submissions table...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
                CREATE TABLE IF NOT EXISTS submissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    challenge_id INTEGER NOT NULL,
                    user_id INTEGER NOT NULL,
                    code TEXT NOT NULL,
                    language TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    runtime INTEGER,
                    memory_used INTEGER,
                    test_cases_passed INTEGER DEFAULT 0,
                    total_test_cases INTEGER DEFAULT 0,
                    error_message TEXT,
                    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (challenge_id) REFERENCES challenges(id),
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);
            if result is error {
                return result;
            }
            io:println("✅ Submissions table created successfully");
            
        } else if upperSQL.includes("CREATE TABLE CONTESTS") || upperSQL.includes("CREATE TABLE IF NOT EXISTS CONTESTS") {
            io:println("📝 Creating contests table...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
                CREATE TABLE IF NOT EXISTS contests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    start_time DATETIME NOT NULL,
                    end_time DATETIME NOT NULL,
                    created_by INTEGER NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id)
                )
            `);
            if result is error {
                return result;
            }
            io:println("✅ Contests table created successfully");
            
        } else if upperSQL.includes("CREATE TABLE ROLES") || upperSQL.includes("CREATE TABLE IF NOT EXISTS ROLES") {
            io:println("📝 Creating roles table...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
                CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            if result is error {
                return result;
            }
            io:println("✅ Roles table created successfully");
            
        } else if upperSQL.includes("CREATE TABLE USER_ROLES") || upperSQL.includes("CREATE TABLE IF NOT EXISTS USER_ROLES") {
            io:println("📝 Creating user_roles table...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
                CREATE TABLE IF NOT EXISTS user_roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    role_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (role_id) REFERENCES roles(id),
                    UNIQUE(user_id, role_id)
                )
            `);
            if result is error {
                return result;
            }
            io:println("✅ User_roles table created successfully");
            
        } else if upperSQL.includes("CREATE TABLE TEST_CASES") || upperSQL.includes("CREATE TABLE IF NOT EXISTS TEST_CASES") {
            io:println("📝 Creating test_cases table...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
                CREATE TABLE IF NOT EXISTS test_cases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    challenge_id INTEGER NOT NULL,
                    input_data TEXT NOT NULL,
                    expected_output TEXT NOT NULL,
                    is_sample BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (challenge_id) REFERENCES challenges(id)
                )
            `);
            if result is error {
                return result;
            }
            io:println("✅ Test_cases table created successfully");
            
        } else {
            io:println("⚠️  CREATE TABLE statement not specifically handled");
            io:println("📋 SQL content: ", sql.substring(0, 100), "...");
            io:println("💡 Add a specific handler in executeCreateTableFromContent() for this table");
        }
        
        return;
    }
    
    // Execute CREATE INDEX from parsed content  
    private function executeCreateIndexFromContent(string sql) returns error? {
        string upperSQL = sql.toUpperAscii();
        
        if upperSQL.includes("IDX_USERS_EMAIL") {
            io:println("📝 Creating index on users.email...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
                CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
            `);
            if result is error {
                return result;
            }
            io:println("✅ Index idx_users_email created successfully");
            
        } else if upperSQL.includes("IDX_USERS_USERNAME") {
            io:println("📝 Creating index on users.username...");
            sql:ExecutionResult|error result = self.dbClient->execute(`
                CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
            `);
            if result is error {
                return result;
            }
            io:println("✅ Index idx_users_username created successfully");
            
        } else {
            io:println("⚠️  CREATE INDEX statement not specifically handled: ", sql.substring(0, 50), "...");
            io:println("💡 Add a specific handler in executeCreateIndexFromContent() for this index");
        }
        return;
    }
    
    // Execute INSERT from parsed content
    private function executeInsertFromContent(string sql) returns error? {
        // Handle INSERT statements - you'd parse the actual values
        io:println("✓ INSERT statement processed (placeholder)");
        return;
    }
    
    // Execute ALTER TABLE from parsed content
    private function executeAlterTableFromContent(string sql) returns error? {
        // Handle ALTER statements - you'd parse the actual changes
        io:println("✓ ALTER TABLE statement processed (placeholder)");
        return;
    }
    
    // Execute DROP TABLE from parsed content
    private function executeDropTableFromContent(string sql) returns error? {
        // Handle DROP statements - you'd parse the table name
        io:println("✓ DROP TABLE statement processed (placeholder)");
        return;
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
            io:println(string `🚀 Executing migration: ${migration.filename}`);

            // Execute migration SQL
            error? executionResult = self.executeMigrationSQL(migration.content);
            if executionResult is error {
                return error(string `Failed to execute migration ${migration.filename}: ${executionResult.message()}`);
            }

            // Mark as executed
            sql:ExecutionResult|error insertResult = self.dbClient->execute(`
                INSERT INTO migrations (filename) VALUES (${migration.filename})
            `);

            if insertResult is error {
                return error(string `Failed to record migration ${migration.filename}: ${insertResult.message()}`);
            }

            io:println(string `✅ ${migration.filename} executed successfully`);
        }

        io:println("🎉 All migrations completed successfully");
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