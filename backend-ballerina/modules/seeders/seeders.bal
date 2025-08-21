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

        // Create regular users
        string userPassword = crypto:hashSha256("password".toBytes()).toBase64();
        sql:ExecutionResult|error userResult1 = self.dbClient->execute(`
            INSERT INTO users (username, email, password_hash, is_admin, role) 
            VALUES ('john', 'john@example.com', ${userPassword}, FALSE, 'user')
        `);
        if userResult1 is error {
            return error("Failed to seed user: " + userResult1.message());
        }

        sql:ExecutionResult|error userResult2 = self.dbClient->execute(`
            INSERT INTO users (username, email, password_hash, is_admin, role) 
            VALUES ('alice', 'alice@example.com', ${userPassword}, FALSE, 'user')
        `);
        if userResult2 is error {
            return error("Failed to seed user: " + userResult2.message());
        }

        sql:ExecutionResult|error userResult3 = self.dbClient->execute(`
            INSERT INTO users (username, email, password_hash, is_admin, role) 
            VALUES ('bob', 'bob@example.com', ${userPassword}, FALSE, 'user')
        `);
        if userResult3 is error {
            return error("Failed to seed user: " + userResult3.message());
        }

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
            VALUES ('Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.', 'Easy', '["Array", "Hash Table"]', 30, 256, 1, 0, 0.0)
        `);
        if result1 is error {
            return error("Failed to seed challenge: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate) 
            VALUES ('Binary Tree Inorder Traversal', 'Given the root of a binary tree, return the inorder traversal of its nodes values.', 'Medium', '["Tree", "DFS", "Binary Tree"]', 45, 512, 1, 0, 0.0)
        `);
        if result2 is error {
            return error("Failed to seed challenge: " + result2.message());
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate) 
            VALUES ('Maximum Subarray', 'Given an integer array nums, find the subarray with the largest sum, and return its sum.', 'Hard', '["Array", "Dynamic Programming", "Divide and Conquer"]', 60, 512, 1, 0, 0.0)
        `);
        if result3 is error {
            return error("Failed to seed challenge: " + result3.message());
        }

        sql:ExecutionResult|error result4 = self.dbClient->execute(`
            INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate) 
            VALUES ('Valid Parentheses', 'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.', 'Easy', '["String", "Stack"]', 30, 256, 1, 0, 0.0)
        `);
        if result4 is error {
            return error("Failed to seed challenge: " + result4.message());
        }

        sql:ExecutionResult|error result5 = self.dbClient->execute(`
            INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate) 
            VALUES ('Reverse String', 'Write a function that reverses a string. The input string is given as an array of characters s.', 'Easy', '["String", "Two Pointers"]', 30, 256, 1, 0, 0.0)
        `);
        if result5 is error {
            return error("Failed to seed challenge: " + result5.message());
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

        // Test cases for Two Sum (challenge_id = 1)
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (1, '[2,7,11,15]\n9', '[0,1]', FALSE, 25)
        `);
        if result1 is error {
            return error("Failed to seed test case: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (1, '[3,2,4]\n6', '[1,2]', FALSE, 25)
        `);
        if result2 is error {
            return error("Failed to seed test case: " + result2.message());
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (1, '[3,3]\n6', '[0,1]', TRUE, 50)
        `);
        if result3 is error {
            return error("Failed to seed test case: " + result3.message());
        }

        // Test cases for Binary Tree Inorder Traversal (challenge_id = 2)
        sql:ExecutionResult|error result4 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (2, '[1,null,2,3]', '[1,3,2]', FALSE, 50)
        `);
        if result4 is error {
            return error("Failed to seed test case: " + result4.message());
        }

        // Test cases for Maximum Subarray (challenge_id = 3)
        sql:ExecutionResult|error result5 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (3, '[-2,1,-3,4,-1,2,1,-5,4]', '6', FALSE, 50)
        `);
        if result5 is error {
            return error("Failed to seed test case: " + result5.message());
        }

        // Test cases for Valid Parentheses (challenge_id = 4)
        sql:ExecutionResult|error result6 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (4, '()', 'true', FALSE, 25)
        `);
        if result6 is error {
            return error("Failed to seed test case: " + result6.message());
        }

        sql:ExecutionResult|error result7 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (4, '()[]{}', 'true', FALSE, 25)
        `);
        if result7 is error {
            return error("Failed to seed test case: " + result7.message());
        }

        sql:ExecutionResult|error result8 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (4, '(]', 'false', TRUE, 50)
        `);
        if result8 is error {
            return error("Failed to seed test case: " + result8.message());
        }

        // Test cases for Reverse String (challenge_id = 5)
        sql:ExecutionResult|error result9 = self.dbClient->execute(`
            INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points) 
            VALUES (5, '["h","e","l","l","o"]', '["o","l","l","e","h"]', FALSE, 50)
        `);
        if result9 is error {
            return error("Failed to seed test case: " + result9.message());
        }

        io:println("✓ Test cases seeded successfully");
    }

    // Seed code templates table
    public function seedCodeTemplates() returns error? {
        io:println("Seeding code templates...");

        // Check if code templates already exist
        stream<record {|int count;|}, sql:Error?> countStream =
            self.dbClient->query(`SELECT COUNT(*) as count FROM code_templates`);

        record {|record {|int count;|} value;|}|error? countResult = countStream.next();
        error? closeResult = countStream.close();

        if closeResult is error {
            return closeResult;
        }

        if countResult is record {|record {|int count;|} value;|} && countResult.value.count > 0 {
            io:println("Code templates already exist, skipping seeding");
            return;
        }

        // Python template for Two Sum
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO code_templates (challenge_id, language, function_name, parameters, return_type, starter_code, execution_template) 
            VALUES (1, 'python', 'twoSum', '["nums", "target"]', 'List[int]', 'def twoSum(nums: List[int], target: int) -> List[int]:\n    # TODO: Implement your solution\n    pass', 'def twoSum(nums, target):\n    # TODO: Implement your solution\n    pass\n\n# Test the function\nnums = [2, 7, 11, 15]\ntarget = 9\nresult = twoSum(nums, target)\nprint(result)')
        `);
        if result1 is error {
            return error("Failed to seed code template: " + result1.message());
        }

        // JavaScript template for Two Sum
        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO code_templates (challenge_id, language, function_name, parameters, return_type, starter_code, execution_template) 
            VALUES (1, 'javascript', 'twoSum', '["nums", "target"]', 'number[]', 'function twoSum(nums, target) {\n    // TODO: Implement your solution\n}\n\nmodule.exports = twoSum;', 'function twoSum(nums, target) {\n    // TODO: Implement your solution\n}\n\n// Test the function\nconst nums = [2, 7, 11, 15];\nconst target = 9;\nconst result = twoSum(nums, target);\nconsole.log(result);')
        `);
        if result2 is error {
            return error("Failed to seed code template: " + result2.message());
        }

        // Python template for Valid Parentheses
        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO code_templates (challenge_id, language, function_name, parameters, return_type, starter_code, execution_template) 
            VALUES (4, 'python', 'isValid', '["s"]', 'bool', 'def isValid(s: str) -> bool:\n    # TODO: Implement your solution\n    pass', 'def isValid(s):\n    # TODO: Implement your solution\n    pass\n\n# Test the function\ns = "()"\nresult = isValid(s)\nprint(result)')
        `);
        if result3 is error {
            return error("Failed to seed code template: " + result3.message());
        }

        // Python template for Reverse String
        sql:ExecutionResult|error result4 = self.dbClient->execute(`
            INSERT INTO code_templates (challenge_id, language, function_name, parameters, return_type, starter_code, execution_template) 
            VALUES (5, 'python', 'reverseString', '["s"]', 'None', 'def reverseString(s: List[str]) -> None:\n    # TODO: Implement your solution\n    pass', 'def reverseString(s):\n    # TODO: Implement your solution\n    pass\n\n# Test the function\ns = ["h","e","l","l","o"]\nreverseString(s)\nprint(s)')
        `);
        if result4 is error {
            return error("Failed to seed code template: " + result4.message());
        }

        io:println("✓ Code templates seeded successfully");
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

        // Create sample contests with future dates
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO contests (title, description, start_time, end_time, duration, max_participants, prizes, rules, created_by, registration_deadline, participants_count) 
            VALUES ('Weekly Coding Challenge', 'Test your problem-solving skills with our weekly challenges. Perfect for beginners and intermediate coders looking to improve their algorithmic thinking.', '2025-01-20T10:00:00Z', '2025-01-20T13:00:00Z', 180, 100, '["1st Place: $100", "2nd Place: $50", "3rd Place: $25"]', '1. All submissions must be original\n2. No external libraries allowed\n3. Contestants can submit multiple times\n4. Final score is based on correct solutions and execution time', 1, '2025-01-19T23:59:59Z', 0)
        `);
        if result1 is error {
            return error("Failed to seed contest: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO contests (title, description, start_time, end_time, duration, max_participants, prizes, rules, created_by, registration_deadline, participants_count) 
            VALUES ('Advanced Algorithm Contest', 'Challenge yourself with complex algorithmic problems. This contest is designed for experienced programmers who want to push their limits.', '2025-01-25T14:00:00Z', '2025-01-25T18:00:00Z', 240, 50, '["1st Place: $500", "2nd Place: $250", "3rd Place: $100"]', '1. Advanced algorithms and data structures required\n2. No external libraries allowed\n3. Multiple submissions allowed\n4. Scoring based on correctness, efficiency, and elegance', 1, '2025-01-24T23:59:59Z', 0)
        `);
        if result2 is error {
            return error("Failed to seed contest: " + result2.message());
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO contests (title, description, start_time, end_time, duration, max_participants, prizes, rules, created_by, registration_deadline, participants_count) 
            VALUES ('Beginner Friendly Contest', 'Perfect for those new to competitive programming. Learn the basics and build confidence with approachable problems.', '2025-01-30T09:00:00Z', '2025-01-30T11:00:00Z', 120, 200, '["1st Place: $50", "2nd Place: $25", "3rd Place: $10"]', '1. Basic programming concepts only\n2. All skill levels welcome\n3. Educational resources provided\n4. Focus on learning and improvement', 1, '2025-01-29T23:59:59Z', 0)
        `);
        if result3 is error {
            return error("Failed to seed contest: " + result3.message());
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
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index) 
            VALUES (1, 1, 100, 1)
        `);
        if result1 is error {
            return error("Failed to seed contest challenge relationship: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index) 
            VALUES (1, 4, 100, 2)
        `);
        if result2 is error {
            return error("Failed to seed contest challenge relationship: " + result2.message());
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index) 
            VALUES (1, 5, 100, 3)
        `);
        if result3 is error {
            return error("Failed to seed contest challenge relationship: " + result3.message());
        }

        sql:ExecutionResult|error result4 = self.dbClient->execute(`
            INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index) 
            VALUES (2, 2, 150, 1)
        `);
        if result4 is error {
            return error("Failed to seed contest challenge relationship: " + result4.message());
        }

        sql:ExecutionResult|error result5 = self.dbClient->execute(`
            INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index) 
            VALUES (2, 3, 150, 2)
        `);
        if result5 is error {
            return error("Failed to seed contest challenge relationship: " + result5.message());
        }

        sql:ExecutionResult|error result6 = self.dbClient->execute(`
            INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index) 
            VALUES (3, 1, 50, 1)
        `);
        if result6 is error {
            return error("Failed to seed contest challenge relationship: " + result6.message());
        }

        sql:ExecutionResult|error result7 = self.dbClient->execute(`
            INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index) 
            VALUES (3, 5, 50, 2)
        `);
        if result7 is error {
            return error("Failed to seed contest challenge relationship: " + result7.message());
        }

        io:println("✓ Contest-challenge relationships seeded successfully");
    }

    // Seed contest participants table
    public function seedContestParticipants() returns error? {
        io:println("Seeding contest participants...");

        // Check if contest participants already exist
        stream<record {|int count;|}, sql:Error?> countStream =
            self.dbClient->query(`SELECT COUNT(*) as count FROM contest_participants`);

        record {|record {|int count;|} value;|}|error? countResult = countStream.next();
        error? closeResult = countStream.close();

        if closeResult is error {
            return closeResult;
        }

        if countResult is record {|record {|int count;|} value;|} && countResult.value.count > 0 {
            io:println("Contest participants already exist, skipping seeding");
            return;
        }

        // Register users for contests
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO contest_participants (contest_id, user_id, score, rank, submissions_count) 
            VALUES (1, 2, 0, 0, 0)
        `);
        if result1 is error {
            return error("Failed to seed contest participant: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO contest_participants (contest_id, user_id, score, rank, submissions_count) 
            VALUES (1, 3, 0, 0, 0)
        `);
        if result2 is error {
            return error("Failed to seed contest participant: " + result2.message());
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO contest_participants (contest_id, user_id, score, rank, submissions_count) 
            VALUES (1, 4, 0, 0, 0)
        `);
        if result3 is error {
            return error("Failed to seed contest participant: " + result3.message());
        }

        sql:ExecutionResult|error result4 = self.dbClient->execute(`
            INSERT INTO contest_participants (contest_id, user_id, score, rank, submissions_count) 
            VALUES (2, 2, 0, 0, 0)
        `);
        if result4 is error {
            return error("Failed to seed contest participant: " + result4.message());
        }

        sql:ExecutionResult|error result5 = self.dbClient->execute(`
            INSERT INTO contest_participants (contest_id, user_id, score, rank, submissions_count) 
            VALUES (3, 2, 0, 0, 0)
        `);
        if result5 is error {
            return error("Failed to seed contest participant: " + result5.message());
        }

        sql:ExecutionResult|error result6 = self.dbClient->execute(`
            INSERT INTO contest_participants (contest_id, user_id, score, rank, submissions_count) 
            VALUES (3, 3, 0, 0, 0)
        `);
        if result6 is error {
            return error("Failed to seed contest participant: " + result6.message());
        }

        io:println("✓ Contest participants seeded successfully");
    }

    // Seed submissions table
    public function seedSubmissions() returns error? {
        io:println("Seeding submissions...");

        // Check if submissions already exist
        stream<record {|int count;|}, sql:Error?> countStream =
            self.dbClient->query(`SELECT COUNT(*) as count FROM submissions`);

        record {|record {|int count;|} value;|}|error? countResult = countStream.next();
        error? closeResult = countStream.close();

        if closeResult is error {
            return closeResult;
        }

        if countResult is record {|record {|int count;|} value;|} && countResult.value.count > 0 {
            io:println("Submissions already exist, skipping seeding");
            return;
        }

        // Create sample submissions
        sql:ExecutionResult|error result1 = self.dbClient->execute(`
            INSERT INTO submissions (user_id, challenge_id, contest_id, code, language, status, result, score, execution_time, memory_used, test_cases_passed, total_test_cases) 
            VALUES (2, 1, 1, 'def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []', 'python', 'completed', 'accepted', 100, 45, 14, 3, 3)
        `);
        if result1 is error {
            return error("Failed to seed submission: " + result1.message());
        }

        sql:ExecutionResult|error result2 = self.dbClient->execute(`
            INSERT INTO submissions (user_id, challenge_id, contest_id, code, language, status, result, score, execution_time, memory_used, test_cases_passed, total_test_cases) 
            VALUES (3, 4, 1, 'def isValid(s):\n    stack = []\n    brackets = {")": "(", "]": "[", "}": "{"}\n    for char in s:\n        if char in "([{":\n            stack.append(char)\n        else:\n            if not stack or stack.pop() != brackets[char]:\n                return False\n    return len(stack) == 0', 'python', 'completed', 'accepted', 100, 32, 12, 3, 3)
        `);
        if result2 is error {
            return error("Failed to seed submission: " + result2.message());
        }

        sql:ExecutionResult|error result3 = self.dbClient->execute(`
            INSERT INTO submissions (user_id, challenge_id, contest_id, code, language, status, result, score, execution_time, memory_used, test_cases_passed, total_test_cases) 
            VALUES (4, 5, 1, 'def reverseString(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1', 'python', 'completed', 'accepted', 100, 28, 10, 1, 1)
        `);
        if result3 is error {
            return error("Failed to seed submission: " + result3.message());
        }

        io:println("✓ Submissions seeded successfully");
    }

    // Run all seeders
    public function seed() returns error? {
        io:println("🌱 Starting database seeding...");

        check self.seedUsers();
        check self.seedChallenges();
        check self.seedTestCases();
        check self.seedCodeTemplates();
        check self.seedContests();
        check self.seedContestChallenges();
        check self.seedContestParticipants();
        check self.seedSubmissions();

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

        sql:ExecutionResult|error result4 = self.dbClient->execute(`DELETE FROM code_templates`);
        if result4 is error {
            return result4;
        }

        sql:ExecutionResult|error result5 = self.dbClient->execute(`DELETE FROM test_cases`);
        if result5 is error {
            return result5;
        }

        sql:ExecutionResult|error result6 = self.dbClient->execute(`DELETE FROM contests`);
        if result6 is error {
            return result6;
        }

        sql:ExecutionResult|error result7 = self.dbClient->execute(`DELETE FROM challenges`);
        if result7 is error {
            return result7;
        }

        sql:ExecutionResult|error result8 = self.dbClient->execute(`DELETE FROM users`);
        if result8 is error {
            return result8;
        }

        io:println("✓ Database cleared");

        // Note: Auto-increment reset is skipped to avoid SQLite issues
        io:println("✓ Auto-increment reset skipped");

        // Run seeding again
        check self.seed();
    }
}
