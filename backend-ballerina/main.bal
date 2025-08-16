import ballerina/sql;
import ballerina/io;
import ballerinax/java.jdbc;

// Configuration for SQLite database
configurable string dbPath = "./test.db";
configurable string jdbcUrl = "jdbc:sqlite:" + dbPath;

// Database client
final jdbc:Client dbClient = check new (jdbcUrl);

public function main() returns error? {
    // Test database connection
    check testDatabaseConnection();
    
    // Create table
    check createTable();
    
    // Insert sample data
    check insertSampleData();
    
    // Query and display data
    check queryData();
    
    // Clean up
    check dbClient.close();
    
    io:println("SQLite integration test completed successfully!");
}

// Test database connection
function testDatabaseConnection() returns error? {
    io:println("Testing SQLite database connection...");
    
    // Simple query to test connection - use query() instead of queryRow() for simpler handling
    stream<record {|int test_value;|}, sql:Error?> resultStream = dbClient->query(`SELECT 1 as test_value`);
    _ = check resultStream.next();
    check resultStream.close();
    io:println("✓ Database connection successful");
}

// Create a simple table
function createTable() returns error? {
    io:println("Creating users table...");
    
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            age INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    io:println("✓ Users table created successfully");
}

// Insert sample data
function insertSampleData() returns error? {
    io:println("Inserting sample data...");
    
    // Insert multiple users
    string[][] users = [
        ["Alice Johnson", "alice@example.com", "28"],
        ["Bob Smith", "bob@example.com", "32"],
        ["Carol Davis", "carol@example.com", "25"]
    ];
    
    foreach string[] user in users {
        sql:ParameterizedQuery insertQuery = `
            INSERT INTO users (name, email, age) 
            VALUES (${user[0]}, ${user[1]}, ${check int:fromString(user[2])})
        `;
        
        sql:ExecutionResult result = check dbClient->execute(insertQuery);
        io:println(string `✓ Inserted user: ${user[0]} (ID: ${result.lastInsertId.toString()})`);
    }
}

// Query and display data
function queryData() returns error? {
    io:println("\nQuerying user data...");
    io:println("===================");
    
    // Query all users
    stream<record {|int id; string name; string email; int age; string created_at;|}, sql:Error?> userStream = 
        dbClient->query(`SELECT id, name, email, age, created_at FROM users ORDER BY id`);
    
    check userStream.forEach(function(record {|int id; string name; string email; int age; string created_at;|} user) {
        io:println(string `ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Age: ${user.age}, Created: ${user.created_at}`);
    });
    
    io:println("===================");
    
    // Query with condition
    io:println("\nUsers over 30:");
    stream<record {|string name; int age;|}, sql:Error?> adultStream = 
        dbClient->query(`SELECT name, age FROM users WHERE age > 30`);
    
    check adultStream.forEach(function(record {|string name; int age;|} user) {
        io:println(string `- ${user.name} (${user.age} years old)`);
    });
    
    // Count users
    record {|int user_count;|} countResult = check dbClient->queryRow(`SELECT COUNT(*) as user_count FROM users`);
    io:println(string `\nTotal users in database: ${countResult.user_count}`);
}