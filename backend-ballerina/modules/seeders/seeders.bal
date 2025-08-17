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

        // Create admin user
        string adminPassword = crypto:hashSha256("password".toBytes()).toBase64();
        sql:ExecutionResult|error adminResult = self.dbClient->execute(`
            INSERT INTO users (username, email, password_hash, is_admin, role) 
            VALUES ('admin', 'admin@codearena.com', ${adminPassword}, TRUE, 'admin')
        `);
        if adminResult is error {
            return error("Failed to seed admin user: " + adminResult.message());
        }
        io:println("✓ Admin user created");

        // Create regular user
        string userPassword = crypto:hashSha256("password".toBytes()).toBase64();
        sql:ExecutionResult|error userResult = self.dbClient->execute(`
            INSERT INTO users (username, email, password_hash, is_admin, role) 
            VALUES ('john', 'john@example.com', ${userPassword}, FALSE, 'user')
        `);
        if userResult is error {
            return error("Failed to seed user: " + userResult.message());
        }
        io:println("✓ Regular user created");

        io:println("✓ Users seeded successfully");
    }

    // Seed challenges table
    public function seedChallenges() returns error? {
        io:println("Seeding challenges...");

        // Check if challenges already exist
        stream<record {|int count;|}, sql:Error?> countStream =
            self.dbClient->query(`SELECT COUNT(*) as count FROM challenges`);

        record {|record {|int count;|} value;|}|error? countResult = countStream.next();
        error? closeResult = countStream.close();

        if closeResult is error {
            return closeResult;
        }

        if countResult is record {|record {|int count;|} value;|} && countResult.value.count > 0 {
            io:println("Challenges already exist, skipping seeding");
            return;
        }

        // Create sample challenges
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate) 
            VALUES ('Two Sum', 'Find two numbers that add up to target', 'Easy', '["Array", "Hash Table"]', 30, 256, 1, 0, 0.0)
        `);
        if result1 is error {
            return error("Failed to seed challenge: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate) 
            VALUES ('Binary Tree Traversal', 'Inorder traversal of binary tree', 'Medium', '["Tree", "DFS"]', 45, 512, 1, 0, 0.0)
        `);
        if result2 is error {
            return error("Failed to seed challenge: " + result2.message());
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate) 
            VALUES ('Maximum Subarray', 'Find maximum sum subarray', 'Hard', '["Array", "DP"]', 60, 512, 1, 0, 0.0)
        `);
        if result3 is error {
            return error("Failed to seed challenge: " + result3.message());
        }

        io:println("✓ Challenges seeded successfully");
    }

    // Seed test cases table
    public function seedTestCases() returns error? {
        io:println("Seeding test cases...");

        // Check if test cases already exist
        stream<record {|int count;|}, sql:Error?> countStream =
            self.dbClient->query(`SELECT COUNT(*) as count FROM test_cases`);

        record {|record {|int count;|} value;|}|error? countResult = countStream.next();
        error? closeResult = countStream.close();

        if closeResult is error {
            return closeResult;
        }

        if countResult is record {|record {|int count;|} value;|} && countResult.value.count > 0 {
            io:println("Test cases already exist, skipping seeding");
            return;
        }

        // Add test cases for each challenge
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (1, '[2,7,11,15]\n9', '[0,1]', FALSE, 50)
        `);
        if result1 is error {
            return error("Failed to seed test case: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (2, '[1,null,2,3]', '[1,3,2]', FALSE, 50)
        `);
        if result2 is error {
            return error("Failed to seed test case: " + result2.message());
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (3, '[-2,1,-3,4,-1,2,1,-5,4]', '6', FALSE, 50)
        `);
        if result3 is error {
            return error("Failed to seed test case: " + result3.message());
        }

        io:println("✓ Test cases seeded successfully");
    }

    // Seed contests table
    public function seedContests() returns error? {
        io:println("Seeding contests...");

        // Check if contests already exist
        stream<record {|int count;|}, sql:Error?> countStream =
            self.dbClient->query(`SELECT COUNT(*) as count FROM contests`);

        record {|record {|int count;|} value;|}|error? countResult = countStream.next();
        error? closeResult = countStream.close();

        if closeResult is error {
            return closeResult;
        }

        if countResult is record {|record {|int count;|} value;|} && countResult.value.count > 0 {
            io:println("Contests already exist, skipping seeding");
            return;
        }

        // Create sample contests
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO contests (title, description, start_time, end_time, duration, max_participants, prizes, rules, created_by, registration_deadline, participants_count) 
            VALUES ('Weekly Challenge', 'Test your skills', '2024-01-20T10:00:00Z', '2024-01-20T13:00:00Z', 180, 100, '["Prize"]', 'Rules', 1, '2024-01-20T09:00:00Z', 0)
        `);
        if result1 is error {
            return error("Failed to seed contest: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO contests (title, description, start_time, end_time, duration, max_participants, prizes, rules, created_by, registration_deadline, participants_count) 
            VALUES ('Advanced Contest', 'Complex problems', '2024-01-18T14:00:00Z', '2024-01-18T18:00:00Z', 240, 50, '["Prize"]', 'Rules', 1, '2024-01-18T13:00:00Z', 0)
        `);
        if result2 is error {
            return error("Failed to seed contest: " + result2.message());
        }

        io:println("✓ Contests seeded successfully");
    }

    // Seed contest-challenge relationships
    public function seedContestChallenges() returns error? {
        io:println("Seeding contest-challenge relationships...");

        // Check if contest challenges already exist
        stream<record {|int count;|}, sql:Error?> countStream =
            self.dbClient->query(`SELECT COUNT(*) as count FROM contest_challenges`);

        record {|record {|int count;|} value;|}|error? countResult = countStream.next();
        error? closeResult = countStream.close();

        if closeResult is error {
            return closeResult;
        }

        if countResult is record {|record {|int count;|} value;|} && countResult.value.count > 0 {
            io:println("Contest challenges already exist, skipping seeding");
            return;
        }

        // Link contests to challenges
        sql:ExecutionResult|error result = self.dbClient->execute(`
            INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index) 
            VALUES (1, 1, 100, 1)
        `);
        if result is error {
            return error("Failed to seed contest challenge relationship: " + result.message());
        }

        io:println("✓ Contest-challenge relationships seeded successfully");
    }

    // Run all seeders
    public function seed() returns error? {
        io:println("🌱 Starting database seeding...");

        check self.seedUsers();
        check self.seedChallenges();
        check self.seedTestCases();
        check self.seedContests();
        check self.seedContestChallenges();

        io:println("✅ Database seeding completed successfully");
    }

    // Clear all seeded data
    public function fresh() returns error? {
        io:println("🧹 Clearing database...");

        // Clear in reverse order of dependencies
        sql:ExecutionResult|error result1 = self.dbClient->execute(`DELETE FROM submissions`);
        if result1 is error {
            return result1;
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`DELETE FROM contest_participants`);
        if result2 is error {
            return result2;
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`DELETE FROM contest_challenges`);
        if result3 is error {
            return result3;
        }

        sql:ExecutionResult|error result4 = self.dbClient->execute(`DELETE FROM test_cases`);
        if result4 is error {
            return result4;
        }

        sql:ExecutionResult|error result5 = self.dbClient->execute(`DELETE FROM contests`);
        if result5 is error {
            return result5;
        }

        sql:ExecutionResult|error result6 = self.dbClient->execute(`DELETE FROM challenges`);
        if result6 is error {
            return result6;
        }

        sql:ExecutionResult|error result7 = self.dbClient->execute(`DELETE FROM users`);
        if result7 is error {
            return result7;
        }

        io:println("✓ Database cleared");

        // Reset auto-increment for all tables
        string[] tableNames = ["users", "challenges", "test_cases", "contests", "contest_challenges", "contest_participants", "submissions"];
        foreach string tableName in tableNames {
            sql:ExecutionResult|error resetResult = self.dbClient->execute(`
                DELETE FROM sqlite_sequence WHERE name='${tableName}'
            `);
            if resetResult is error {
                return resetResult;
            }
        }

        io:println("✓ Auto-increment reset for all tables");

        // Run seeding again
        check self.seed();
    }
}
