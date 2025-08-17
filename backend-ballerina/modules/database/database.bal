import backend_ballerina.models;

import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Configuration
configurable string dbPath = "./auth.db";
configurable string jdbcUrl = "jdbc:sqlite:" + dbPath;

// Database client
final jdbc:Client dbClient = check new (jdbcUrl);

// Initialize database
public function initDatabase() returns error? {
    io:println("Initializing database...");

    // Create users table
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        return result;
    }

    io:println("✓ Database initialized successfully");
}

// Check if user exists
public function checkUserExists(string username, string email) returns boolean|error {
    stream<record {|int count;|}, sql:Error?> resultStream =
        dbClient->query(`SELECT COUNT(*) as count FROM users WHERE username = ${username} OR email = ${email}`);

    record {|record {|int count;|} value;|}|error? result = resultStream.next();
    error? closeResult = resultStream.close();

    if closeResult is error {
        return closeResult;
    }

    if result is () || result is error {
        return false;
    }

    return result.value.count > 0;
}

// Create new user
public function createUser(models:UserRegistration userReg, string hashedPassword) returns sql:ExecutionResult|error {
    return dbClient->execute(`
        INSERT INTO users (username, email, password_hash, is_admin, role) 
        VALUES (${userReg.username}, ${userReg.email}, ${hashedPassword}, FALSE, 'user')
    `);
}

// Verify user credentials
public function getUserByCredentials(string username, string hashedPassword) returns models:User|error {
    stream<models:User, sql:Error?> userStream =
        dbClient->query(`SELECT id, username, email, password_hash, is_admin, role, created_at FROM users 
                        WHERE username = ${username} AND password_hash = ${hashedPassword}`);

    record {|models:User value;|}|error? user = userStream.next();
    error? closeResult = userStream.close();

    if closeResult is error {
        return closeResult;
    }

    if user is () || user is error {
        return error("Invalid credentials");
    }

    return user.value;
}

// Get user by username
public function getUserByUsername(string username) returns models:User|error {
    stream<models:User, sql:Error?> userStream =
        dbClient->query(`SELECT id, username, email, password_hash, is_admin, role, created_at FROM users WHERE username = ${username}`);

    record {|models:User value;|}|error? user = userStream.next();
    error? closeResult = userStream.close();

    if closeResult is error {
        return closeResult;
    }

    if user is () || user is error {
        return error("User not found");
    }

    return user.value;
}

public function getDbClient() returns jdbc:Client {
    return dbClient;
}
