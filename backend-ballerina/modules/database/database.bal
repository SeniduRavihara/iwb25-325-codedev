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

// Get all users (test function)
public function getAllUsers() returns models:User[]|error {
    stream<models:User, sql:Error?> userStream =
        dbClient->query(`SELECT id, username, email, password_hash, is_admin, role, created_at FROM users ORDER BY created_at DESC`);

    models:User[] users = [];
    record {|models:User value;|}|error? result = userStream.next();

    while result is record {|models:User value;|} {
        users.push(result.value);
        result = userStream.next();
    }

    error? closeResult = userStream.close();
    if closeResult is error {
        return closeResult;
    }

    return users;
}

// Get all challenges
public function getAllChallenges() returns models:Challenge[]|error {
    io:println("DEBUG: Starting getAllChallenges query");

    // Use raw query first, then manually map to avoid type issues
    stream<record {}, sql:Error?> challengeStream =
        dbClient->query(`SELECT id, title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate, created_at, updated_at FROM challenges ORDER BY created_at DESC`);

    models:Challenge[] challenges = [];
    record {|record {} value;|}|error? result = challengeStream.next();

    io:println("DEBUG: Got first result");

    while result is record {|record {} value;|} {
        record {} rawChallenge = result.value;
        io:println("DEBUG: Processing challenge: " + rawChallenge.toString());

        // Manually create the Challenge record with proper type conversion
        models:Challenge challenge = {
            id: <int>rawChallenge["id"],
            title: <string>rawChallenge["title"],
            description: <string>rawChallenge["description"],
            difficulty: <string>rawChallenge["difficulty"],
            tags: <string>rawChallenge["tags"],
            time_limit: <int>rawChallenge["time_limit"],
            memory_limit: <int>rawChallenge["memory_limit"],
            author_id: <int>rawChallenge["author_id"],
            submissions_count: <int>rawChallenge["submissions_count"],
            success_rate: <decimal>rawChallenge["success_rate"],  // Convert int to decimal
            created_at: <string>rawChallenge["created_at"],
            updated_at: <string>rawChallenge["updated_at"]
        };

        challenges.push(challenge);
        result = challengeStream.next();
    }

    check challengeStream.close();

    io:println("DEBUG: Returning " + challenges.length().toString() + " challenges");
    return challenges;
}

// Get all contests
public function getAllContests() returns models:Contest[]|error {
    io:println("DEBUG: Starting getAllContests with datetime conversion");

    // Convert DATETIME fields to strings in the SQL query
    stream<record {}, sql:Error?> contestStream =
        dbClient->query(`
            SELECT 
                id, 
                title, 
                description, 
                datetime(start_time) as start_time,
                datetime(end_time) as end_time,
                duration, 
                status, 
                max_participants, 
                prizes, 
                rules, 
                created_by, 
                datetime(registration_deadline) as registration_deadline,
                participants_count, 
                datetime(created_at) as created_at,
                datetime(updated_at) as updated_at
            FROM contests 
            ORDER BY created_at DESC
        `);

    models:Contest[] contests = [];

    check from record {} raw in contestStream
        do {
            io:println("DEBUG: Raw contest: " + raw.toString());

            models:Contest contest = {
                id: <int>raw["id"],
                title: <string>raw["title"],
                description: <string>raw["description"],
                start_time: <string>raw["start_time"],
                end_time: <string>raw["end_time"],
                duration: <int>raw["duration"],
                status: <string>raw["status"],
                max_participants: raw["max_participants"] == () ? () : <int>raw["max_participants"],
                prizes: raw["prizes"] == () ? () : <string>raw["prizes"],
                rules: raw["rules"] == () ? () : <string>raw["rules"],
                created_by: <int>raw["created_by"],
                registration_deadline: <string>raw["registration_deadline"],
                participants_count: <int>raw["participants_count"],
                created_at: <string>raw["created_at"],
                updated_at: <string>raw["updated_at"]
            };

            contests.push(contest);
        };

    io:println("DEBUG: Returning " + contests.length().toString() + " contests");
    return contests;
}

// Get test cases by challenge ID
public function getTestCasesByChallengeId(int challengeId) returns models:TestCase[]|error {
    stream<models:TestCase, sql:Error?> testCaseStream =
        dbClient->query(`SELECT id, challenge_id, input_data, expected_output, is_hidden, points, created_at FROM test_cases WHERE challenge_id = ${challengeId} AND is_hidden = FALSE ORDER BY id`);

    models:TestCase[] testCases = [];
    record {|models:TestCase value;|}|error? result = testCaseStream.next();

    while result is record {|models:TestCase value;|} {
        testCases.push(result.value);
        result = testCaseStream.next();
    }

    error? closeResult = testCaseStream.close();
    if closeResult is error {
        return closeResult;
    }

    return testCases;
}

// Create new challenge
public function createChallenge(models:ChallengeCreate challengeData, int authorId) returns sql:ExecutionResult|error {
    return dbClient->execute(`
        INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate, created_at, updated_at) 
        VALUES (${challengeData.title}, ${challengeData.description}, ${challengeData.difficulty}, ${challengeData.tags}, ${challengeData.time_limit}, ${challengeData.memory_limit}, ${authorId}, 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
}

// Create new contest
public function createContest(models:ContestCreate contestData, int createdBy) returns sql:ExecutionResult|error {
    return dbClient->execute(`
        INSERT INTO contests (title, description, start_time, end_time, duration, status, max_participants, prizes, rules, created_by, registration_deadline, participants_count, created_at, updated_at) 
        VALUES (${contestData.title}, ${contestData.description}, ${contestData.start_time}, ${contestData.end_time}, ${contestData.duration}, 'upcoming', ${contestData.max_participants}, ${contestData.prizes}, ${contestData.rules}, ${createdBy}, ${contestData.registration_deadline}, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
}

/// Add these debug functions to your database module

// Add this debug function that uses the EXACT same query as your main function

public function debugSpecificContests() returns record {}[]|error {
    io:println("DEBUG: Using exact same query as main function");

    stream<record {}, sql:Error?> contestStream =
        dbClient->query(`SELECT id, title, description, start_time, end_time, duration, status, max_participants, prizes, rules, created_by, registration_deadline, participants_count, created_at, updated_at FROM contests ORDER BY created_at DESC`);

    record {}[] rawContests = [];

    record {|record {} value;|}|error? result = contestStream.next();
    while result is record {|record {} value;|} {
        io:println("DEBUG: Found contest record: " + result.value.toString());
        rawContests.push(result.value);
        result = contestStream.next();
    }

    check contestStream.close();
    io:println("DEBUG: Total contests found: " + rawContests.length().toString());
    return rawContests;
}

// Also check if there are any NULL values causing issues
public function debugContestsSimple() returns record {|int id; string title;|}[]|error {
    stream<record {|int id; string title;|}, sql:Error?> contestStream =
        dbClient->query(`SELECT id, title FROM contests ORDER BY created_at DESC`);

    record {|int id; string title;|}[] contests = [];

    record {|record {|int id; string title;|} value;|}|error? result = contestStream.next();
    while result is record {|record {|int id; string title;|} value;|} {
        contests.push(result.value);
        result = contestStream.next();
    }

    check contestStream.close();
    return contests;
}

// Delete challenge
public function deleteChallenge(int challengeId) returns sql:ExecutionResult|error {
    // First delete related test cases
    sql:ExecutionResult|error testCasesResult = dbClient->execute(`
        DELETE FROM test_cases WHERE challenge_id = ${challengeId}
    `);
    if testCasesResult is error {
        return error("Failed to delete test cases: " + testCasesResult.message());
    }

    // Then delete related contest challenges
    sql:ExecutionResult|error contestChallengesResult = dbClient->execute(`
        DELETE FROM contest_challenges WHERE challenge_id = ${challengeId}
    `);
    if contestChallengesResult is error {
        return error("Failed to delete contest challenges: " + contestChallengesResult.message());
    }

    // Finally delete the challenge
    return dbClient->execute(`
        DELETE FROM challenges WHERE id = ${challengeId}
    `);
}

// Delete contest
public function deleteContest(int contestId) returns sql:ExecutionResult|error {
    // First delete related contest participants
    sql:ExecutionResult|error participantsResult = dbClient->execute(`
        DELETE FROM contest_participants WHERE contest_id = ${contestId}
    `);
    if participantsResult is error {
        return error("Failed to delete contest participants: " + participantsResult.message());
    }

    // Then delete related contest challenges
    sql:ExecutionResult|error contestChallengesResult = dbClient->execute(`
        DELETE FROM contest_challenges WHERE contest_id = ${contestId}
    `);
    if contestChallengesResult is error {
        return error("Failed to delete contest challenges: " + contestChallengesResult.message());
    }

    // Finally delete the contest
    return dbClient->execute(`
        DELETE FROM contests WHERE id = ${contestId}
    `);
}
