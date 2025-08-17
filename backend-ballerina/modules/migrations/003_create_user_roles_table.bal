import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for creating user_roles table
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
