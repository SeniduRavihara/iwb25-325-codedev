import backend_ballerina.models;

import ballerina/crypto;
import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

public class DatabaseSeeder {
    private final jdbc:Client dbClient;

    public function init(jdbc:Client dbClient) {
        self.dbClient = dbClient;
    }

    // Seed users table
    public function seedUsers() returns error? {
        io:println("Seeding users...");

        // Check if users already exist
        stream<record {|int count;|}, sql:Error?> countStream =
            self.dbClient->query(`SELECT COUNT(*) as count FROM users`);

        record {|record {|int count;|} value;|}|error? countResult = countStream.next();
        error? closeResult = countStream.close();

        if closeResult is error {
            return closeResult;
        }

        if countResult is record {|record {|int count;|} value;|} && countResult.value.count > 0 {
            io:println("Users already exist, skipping seeding");
            return;
        }

        // Sample users data
        models:UserRegistration[] sampleUsers = [
            {username: "admin", email: "admin@codearena.com", password: "password"},
            {username: "john", email: "john@example.com", password: "password"},
            {username: "jane", email: "jane@example.com", password: "password"},
            {username: "test", email: "test@example.com", password: "password"}
        ];

        foreach models:UserRegistration user in sampleUsers {
            string hashedPassword = crypto:hashSha256(user.password.toBytes()).toBase64();

            sql:ExecutionResult|error result = self.dbClient->execute(`
                INSERT INTO users (username, email, password_hash, is_admin, role) 
                VALUES (${user.username}, ${user.email}, ${hashedPassword}, ${user.username == "admin"}, ${user.username == "admin" ? "admin" : "user"})
            `);

            if result is error {
                return error(string `Failed to seed user ${user.username}: ${result.message()}`);
            }

            io:println(string `✓ User '${user.username}' created`);
        }

        io:println("✓ Users seeded successfully");
    }

    // Seed roles table (if you have one)
    public function seedRoles() returns error? {
        io:println("Seeding roles...");

        string[] roles = ["admin", "user", "moderator"];

        foreach string role in roles {
            sql:ExecutionResult|error result = self.dbClient->execute(`
                INSERT OR IGNORE INTO roles (name) VALUES (${role})
            `);

            if result is error {
                return error(string `Failed to seed role ${role}: ${result.message()}`);
            }

            io:println(string `✓ Role '${role}' created`);
        }

        io:println("✓ Roles seeded successfully");
    }

    // Run all seeders
    public function seed() returns error? {
        io:println("🌱 Starting database seeding...");

        check self.seedUsers();
        // check self.seedRoles(); // Uncomment if you have roles table

        io:println("✅ Database seeding completed successfully");
    }

    // Clear all seeded data
    public function fresh() returns error? {
        io:println("🧹 Clearing database...");

        sql:ExecutionResult|error result = self.dbClient->execute(`DELETE FROM users`);
        if result is error {
            return result;
        }

        io:println("✓ Database cleared");

        // Reset auto-increment
        sql:ExecutionResult|error resetResult = self.dbClient->execute(`
            DELETE FROM sqlite_sequence WHERE name='users'
        `);
        if resetResult is error {
            return resetResult;
        }

        io:println("✓ Auto-increment reset");

        // Run seeding again
        check self.seed();
    }
}
