import backend_ballerina.models;

import ballerina/io;
import ballerina/regex;
import ballerina/sql;
import ballerina/time;
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

// --Create new user--
public function createUser(models:UserRegistration userReg, string hashedPassword) returns sql:ExecutionResult|error {
    return dbClient->execute(`
        INSERT INTO users (username, email, password_hash, is_admin, role) 
        VALUES (${userReg.username}, ${userReg.email}, ${hashedPassword}, FALSE, 'user')
    `);
}

// --Verify user credentials--
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

    // io:println("DEBUG: Got first result");

    while result is record {|record {} value;|} {
        record {} rawChallenge = result.value;
        // io:println("DEBUG: Processing challenge: " + rawChallenge.toString());

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
            // function_templates: rawChallenge["function_templates"] == () ? () : <string>rawChallenge["function_templates"],
            // test_cases: rawChallenge["test_cases"] == () ? () : <string>rawChallenge["test_cases"],
            created_at: <string>rawChallenge["created_at"],
            updated_at: <string>rawChallenge["updated_at"]
        };

        challenges.push(challenge);
        result = challengeStream.next();
    }

    check challengeStream.close();

    // io:println("DEBUG: Returning " + challenges.length().toString() + " challenges");
    return challenges;
}

// Get all contests
public function getAllContests() returns models:Contest[]|error {
    // io:println("DEBUG: Starting getAllContests with datetime conversion");

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
            // io:println("DEBUG: Raw contest: " + raw.toString());

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

    // io:println("DEBUG: Returning " + contests.length().toString() + " contests");
    return contests;
}

// Get test cases by challenge ID
public function getTestCasesByChallengeId(int challengeId) returns models:TestCase[]|error {
    io:println("DEBUG: Getting test cases by challenge ID: " + challengeId.toString());

    // Use raw query first, then manually map to avoid type issues
    stream<record {}, sql:Error?> testCaseStream =
        dbClient->query(`SELECT id, challenge_id, input_data, expected_output, is_hidden, points, created_at FROM test_cases WHERE challenge_id = ${challengeId} ORDER BY id`);

    io:println("DEBUG: Test case stream: " + testCaseStream.toString());

    models:TestCase[] testCases = [];
    record {|record {} value;|}|error? result = testCaseStream.next();

    while result is record {|record {} value;|} {
        record {} rawTestCase = result.value;

        // Manually map the raw data to TestCase type
        models:TestCase testCase = {
            id: <int>rawTestCase["id"],
            challenge_id: <int>rawTestCase["challenge_id"],
            input_data: <string>rawTestCase["input_data"],
            expected_output: <string>rawTestCase["expected_output"],
            is_hidden: <boolean>rawTestCase["is_hidden"],
            points: <int>rawTestCase["points"],
            created_at: <string>rawTestCase["created_at"]
        };

        testCases.push(testCase);
        result = testCaseStream.next();
    }

    error? closeResult = testCaseStream.close();
    if closeResult is error {
        return closeResult;
    }

    io:println("DEBUG: Test cases: " + testCases.length().toString());

    return testCases;
}

// --Create new challenge--
public function createChallenge(models:ChallengeCreate challengeData, int authorId) returns sql:ExecutionResult|error {
    // Log the incoming data for debugging
    // io:println("Creating challenge with data:");
    // io:println("Title: " + challengeData.title);
    // io:println("Description: " + challengeData.description);
    // io:println("Difficulty: " + challengeData.difficulty);
    // io:println("Tags: " + challengeData.tags);
    // io:println("Time limit: " + challengeData.time_limit.toString());
    // io:println("Memory limit: " + challengeData.memory_limit.toString());

    // Log if additional data is provided
    // if challengeData.function_templates is string {
    //     io:println("Function templates provided");
    // }

    // if challengeData.test_cases is string {
    //     io:println("Test cases provided");
    // }

    // Create the challenge in database with function_templates and test_cases
    return dbClient->execute(`
        INSERT INTO challenges (title, description, difficulty, tags, time_limit, memory_limit, author_id, submissions_count, success_rate, created_at, updated_at) 
        VALUES (${challengeData.title}, ${challengeData.description}, ${challengeData.difficulty}, ${challengeData.tags}, ${challengeData.time_limit}, ${challengeData.memory_limit}, ${authorId}, 0, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
}

public function createTestCases(models:RecevingTestCases testcasesData, int challengeId) returns sql:ExecutionResult|error {
    // Log the incoming data for debugging
    // io:println("Creating test case with data:");
    // io:println("Challenge ID: " + challengeId.toString());
    // io:println("Input data: " + testcasesData.input_data);
    // io:println("Expected output: " + testcasesData.expected_output);
    // io:println("Is hidden: " + testcasesData.is_hidden.toString());
    // io:println("Points: " + testcasesData.points.toString());

    // Create the test case in database
    return dbClient->execute(`
        INSERT INTO test_cases (challenge_id, input_data, expected_output, is_hidden, points, created_at) 
        VALUES (${challengeId}, ${testcasesData.input_data}, ${testcasesData.expected_output}, ${testcasesData.is_hidden}, ${testcasesData.points}, CURRENT_TIMESTAMP)
    `);
}

// Create new contest
public function createContest(models:ContestCreate contestData, int createdBy) returns sql:ExecutionResult|error {
    // Log the times being inserted for debugging
    // io:println("DEBUG: Creating contest with times:");
    // io:println("  Start time: " + contestData.start_time);
    // io:println("  End time: " + contestData.end_time);
    // io:println("  Registration deadline: " + contestData.registration_deadline);

    return dbClient->execute(`
        INSERT INTO contests (title, description, start_time, end_time, duration, status, max_participants, prizes, rules, created_by, registration_deadline, participants_count, created_at, updated_at) 
        VALUES (${contestData.title}, ${contestData.description}, ${contestData.start_time}, ${contestData.end_time}, ${contestData.duration}, 'upcoming', ${contestData.max_participants}, ${contestData.prizes}, ${contestData.rules}, ${createdBy}, ${contestData.registration_deadline}, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
}

// --------------------------Code Template functions-----------------
public function createCodeTemplate(models:CodeTemplateCreate templateData, int challengeId) returns sql:ExecutionResult|error {
    // Log the incoming data for debugging
    io:println("Creating code template with data:");
    io:println("Challenge ID: " + challengeId.toString());
    io:println("Language: " + templateData.language);
    io:println("Function name: " + templateData.function_name);
    io:println("Parameters: " + templateData.parameters);
    io:println("Return type: " + templateData.return_type);

    return dbClient->execute(`
        INSERT INTO code_templates (challenge_id, language, function_name, parameters, return_type, starter_code, execution_template, created_at, updated_at) 
        VALUES (${challengeId}, ${templateData.language}, ${templateData.function_name}, ${templateData.parameters}, ${templateData.return_type}, ${templateData.starter_code}, ${templateData.execution_template}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
}

public function getCodeTemplatesByChallengeId(int challengeId) returns models:CodeTemplate[]|error {
    io:println("DEBUG: Getting code templates by challenge ID: " + challengeId.toString());

    // Use raw query first, then manually map to avoid type issues
    stream<record {}, sql:Error?> templateStream =
        dbClient->query(`SELECT id, challenge_id, language, function_name, parameters, return_type, starter_code, execution_template, created_at, updated_at FROM code_templates WHERE challenge_id = ${challengeId} ORDER BY language, id`);

    models:CodeTemplate[] templates = [];
    record {|record {} value;|}|error? result = templateStream.next();

    while result is record {|record {} value;|} {
        record {} rawTemplate = result.value;

        // Manually map the raw data to CodeTemplate type
        models:CodeTemplate template = {
            id: <int>rawTemplate["id"],
            challenge_id: <int>rawTemplate["challenge_id"],
            language: <string>rawTemplate["language"],
            function_name: <string>rawTemplate["function_name"],
            parameters: <string>rawTemplate["parameters"],
            return_type: <string>rawTemplate["return_type"],
            starter_code: <string>rawTemplate["starter_code"],
            execution_template: <string>rawTemplate["execution_template"],
            created_at: <string>rawTemplate["created_at"],
            updated_at: <string>rawTemplate["updated_at"]
        };

        templates.push(template);
        result = templateStream.next();
    }

    error? closeResult = templateStream.close();
    if closeResult is error {
        return closeResult;
    }

    io:println("DEBUG: Code templates found: " + templates.length().toString());
    return templates;
}

public function updateCodeTemplate(int templateId, models:CodeTemplateUpdate templateData) returns sql:ExecutionResult|error {
    // For now, return a simple update that only changes updated_at
    // This can be enhanced later with proper field updates
    return dbClient->execute(`UPDATE code_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = ${templateId}`);
}

public function deleteCodeTemplate(int templateId) returns sql:ExecutionResult|error {
    return dbClient->execute(`DELETE FROM code_templates WHERE id = ${templateId}`);
}

public function deleteCodeTemplatesByChallengeId(int challengeId) returns sql:ExecutionResult|error {
    return dbClient->execute(`DELETE FROM code_templates WHERE challenge_id = ${challengeId}`);
}

// Create multiple code templates in a single transaction
public function createBulkCodeTemplates(models:BulkCodeTemplateCreate templatesData, int challengeId) returns error? {
    io:println("Creating " + templatesData.templates.length().toString() + " code templates for challenge " + challengeId.toString());

    foreach models:CodeTemplateCreate template in templatesData.templates {
        // Log the template being created
        io:println("Creating template for language: " + template.language + ", function: " + template.function_name);

        // Create the template
        sql:ExecutionResult|error result = dbClient->execute(`
            INSERT INTO code_templates (challenge_id, language, function_name, parameters, return_type, starter_code, execution_template, created_at, updated_at) 
            VALUES (${challengeId}, ${template.language}, ${template.function_name}, ${template.parameters}, ${template.return_type}, ${template.starter_code}, ${template.execution_template}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        if result is error {
            return error("Failed to create code template: " + result.message());
        }
    }

    io:println("✓ Successfully created " + templatesData.templates.length().toString() + " code templates");
    return;
}

// ------------------------------------------------------------------

// Add challenge to contest
public function addChallengeToContest(int contestId, int challengeId, int points, int orderIndex) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        INSERT INTO contest_challenges (contest_id, challenge_id, points, order_index)
        VALUES (${contestId}, ${challengeId}, ${points}, ${orderIndex})
    `);
    if result is error {
        return error("Failed to add challenge to contest: " + result.message());
    }
    return;
}

/// Add these debug functions to your database module

// Add this debug function that uses the EXACT same query as your main function

public function debugSpecificContests() returns record {}[]|error {
    // io:println("DEBUG: Using exact same query as main function");

    stream<record {}, sql:Error?> contestStream =
        dbClient->query(`SELECT id, title, description, datetime(start_time) as start_time, datetime(end_time) as end_time, duration, status, max_participants, prizes, rules, created_by, datetime(registration_deadline) as registration_deadline, participants_count, datetime(created_at) as created_at, datetime(updated_at) as updated_at FROM contests ORDER BY created_at DESC`);

    record {}[] rawContests = [];

    record {|record {} value;|}|error? result = contestStream.next();
    while result is record {|record {} value;|} {
        // io:println("DEBUG: Found contest record: " + result.value.toString());
        rawContests.push(result.value);
        result = contestStream.next();
    }

    check contestStream.close();
    // io:println("DEBUG: Total contests found: " + rawContests.length().toString());
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

// Register user for contest
public function registerForContest(int contestId, int userId) returns sql:ExecutionResult|error {
    // Check if user is already registered
    boolean|error alreadyRegistered = isUserRegisteredForContest(contestId, userId);
    if alreadyRegistered is error {
        return alreadyRegistered;
    }

    if alreadyRegistered {
        return error("User is already registered for this contest");
    }

    // Check if contest exists and registration is still open
    // io:println("DEBUG: Checking contest with ID: " + contestId.toString());

    stream<record {|string registration_deadline; int max_participants; int participants_count;|}, sql:Error?> contestStream =
        dbClient->query(`SELECT datetime(registration_deadline) as registration_deadline, max_participants, participants_count FROM contests WHERE id = ${contestId}`);

    record {|record {|string registration_deadline; int max_participants; int participants_count;|} value;|}|error? contestResult = contestStream.next();
    error? closeResult = contestStream.close();

    if closeResult is error {
        // io:println("DEBUG: Error closing stream: " + closeResult.message());
        return closeResult;
    }

    if contestResult is () {
        // io:println("DEBUG: No contest found with ID: " + contestId.toString());
        return error("Contest not found");
    }

    if contestResult is error {
        // io:println("DEBUG: Error getting contest result: " + contestResult.message());
        return error("Contest not found");
    }

    // io:println("DEBUG: Contest found with registration deadline: " + contestResult.value.registration_deadline);

    // Check if registration deadline has passed
    string registrationDeadline = contestResult.value.registration_deadline;
    time:Utc currentTime = time:utcNow();

    // Convert SQLite datetime format to ISO format
    string isoDeadline = registrationDeadline;

    // If the date has space instead of 'T', replace it
    if registrationDeadline.includes(" ") {
        isoDeadline = regex:replaceAll(registrationDeadline, " ", "T");
    }

    // If the date doesn't end with 'Z', add it
    if !isoDeadline.endsWith("Z") {
        isoDeadline = isoDeadline + "Z";
    }

    // io:println("DEBUG: Original deadline: " + registrationDeadline);
    // io:println("DEBUG: Converted deadline: " + isoDeadline);

    time:Utc|error deadlineTime = time:utcFromString(isoDeadline);

    if deadlineTime is error {
        // io:println("DEBUG: Failed to parse deadline: " + isoDeadline);
        return error("Invalid registration deadline format: " + registrationDeadline);
    }

    if currentTime[0] > deadlineTime[0] {
        return error("Registration deadline has passed");
    }

    // Check if contest is full
    int maxParticipants = contestResult.value.max_participants;
    int currentParticipants = contestResult.value.participants_count;

    if maxParticipants > 0 && currentParticipants >= maxParticipants {
        return error("Contest is full");
    }

    // Register user for contest
    sql:ExecutionResult|error registerResult = dbClient->execute(`
        INSERT INTO contest_participants (contest_id, user_id, score, rank, submissions_count, registered_at) 
        VALUES (${contestId}, ${userId}, 0, 0, 0, CURRENT_TIMESTAMP)
    `);

    if registerResult is error {
        return registerResult;
    }

    // Update contest participants count
    return dbClient->execute(`
        UPDATE contests SET participants_count = participants_count + 1 WHERE id = ${contestId}
    `);
}

// Unregister user from contest
public function unregisterFromContest(int contestId, int userId) returns sql:ExecutionResult|error {
    // Check if user is registered
    boolean|error isRegistered = isUserRegisteredForContest(contestId, userId);
    if isRegistered is error {
        return isRegistered;
    }

    if !isRegistered {
        return error("User is not registered for this contest");
    }

    // Unregister user from contest
    sql:ExecutionResult|error unregisterResult = dbClient->execute(`
        DELETE FROM contest_participants WHERE contest_id = ${contestId} AND user_id = ${userId}
    `);

    if unregisterResult is error {
        return unregisterResult;
    }

    // Update contest participants count
    return dbClient->execute(`
        UPDATE contests SET participants_count = participants_count - 1 WHERE id = ${contestId}
    `);
}

// Check if user is registered for contest
public function isUserRegisteredForContest(int contestId, int userId) returns boolean|error {
    stream<record {|int count;|}, sql:Error?> resultStream =
        dbClient->query(`SELECT COUNT(*) as count FROM contest_participants WHERE contest_id = ${contestId} AND user_id = ${userId}`);

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

// Update contest status based on current time
public function updateContestStatus() returns error? {
    time:Utc currentTime = time:utcNow();
    string currentTimeStr = time:utcToString(currentTime);

    // Update contests that should be active
    sql:ExecutionResult|error activeResult = dbClient->execute(`
        UPDATE contests 
        SET status = 'active' 
        WHERE status = 'upcoming' 
        AND datetime(start_time) <= datetime('${currentTimeStr}')
        AND datetime(end_time) > datetime('${currentTimeStr}')
    `);

    if activeResult is error {
        return error("Failed to update active contests: " + activeResult.message());
    }

    // Update contests that should be completed
    sql:ExecutionResult|error completedResult = dbClient->execute(`
        UPDATE contests 
        SET status = 'completed' 
        WHERE status IN ('upcoming', 'active') 
        AND datetime(end_time) <= datetime('${currentTimeStr}')
    `);

    if completedResult is error {
        return error("Failed to update completed contests: " + completedResult.message());
    }

    return;
}

// Get specific contest status
public function getContestStatus(int contestId) returns string|error {
    stream<record {|string status;|}, sql:Error?> resultStream =
        dbClient->query(`SELECT status FROM contests WHERE id = ${contestId}`);

    record {|record {|string status;|} value;|}|error? result = resultStream.next();
    error? closeResult = resultStream.close();

    if closeResult is error {
        return closeResult;
    }

    if result is () || result is error {
        return error("Contest not found");
    }

    return result.value.status;
}

// Update specific contest status to active
public function updateContestToActive(int contestId) returns error? {
    // Debug: Print before database operation
    io:println("📊 DATABASE: Attempting to update contest " + contestId.toString() + " from 'upcoming' to 'active'");

    // Simple update: just change status from 'upcoming' to 'active' for the given contest ID
    sql:ExecutionResult|error activeResult = dbClient->execute(`
        UPDATE contests 
        SET status = 'active' 
        WHERE id = ${contestId}
        AND status = 'upcoming'
    `);

    if activeResult is error {
        io:println("💥 DATABASE EXECUTE ERROR: " + activeResult.message());
        return error("Failed to update contest to active: " + activeResult.message());
    }

    // Debug: Print after successful database operation
    sql:ExecutionResult result = activeResult;
    io:println("🎯 DATABASE RESULT: Affected rows = " + result.affectedRowCount.toString());

    return;
}

// Save contest submission using existing submissions table
public function saveContestSubmission(
        int userId,
        int challengeId,
        int contestId,
        string code,
        string language,
        int passedTests,
        int totalTests,
        decimal successRate,
        decimal score
) returns error? {
    // Calculate result status based on success rate with more nuanced categorization
    string result;
    if successRate >= 100.0d {
        result = "accepted";
    } else if successRate >= 80.0d {
        result = "partial_correct";
    } else if successRate > 0.0d {
        result = "wrong_answer";
    } else {
        result = "compilation_error"; // or "runtime_error" depending on your needs
    }

    // Additional validation
    if userId <= 0 || challengeId <= 0 || contestId <= 0 {
        return error("Invalid ID parameters provided");
    }

    if code.length() == 0 {
        return error("Code cannot be empty");
    }

    if language.length() == 0 {
        return error("Language must be specified");
    }

    if totalTests < 0 || passedTests < 0 || passedTests > totalTests {
        return error("Invalid test case counts");
    }

    // Log the submission attempt
    io:println("Saving submission - User: " + userId.toString() +
                ", Challenge: " + challengeId.toString() +
                ", Contest: " + contestId.toString());
    io:println("Results - Passed: " + passedTests.toString() +
                "/" + totalTests.toString() +
                " (" + successRate.toString() + "%) - " + result);

    // First, check if a submission already exists
    sql:ParameterizedQuery checkQuery = `
        SELECT id FROM submissions 
        WHERE user_id = ${userId} 
        AND challenge_id = ${challengeId} 
        AND contest_id = ${contestId}
    `;

    stream<record {|int id;|}, error?> resultStream = dbClient->query(checkQuery);
    record {|int id;|}? existingSubmission = ();

    // Check if record exists
    record {|record {|int id;|} value;|}|error? first = resultStream.next();
    if first is record {|record {|int id;|} value;|} {
        existingSubmission = first.value;
    }

    // Close the stream
    error? closeResult = resultStream.close();
    if closeResult is error {
        io:println("Warning: Failed to close result stream: " + closeResult.message());
    }

    sql:ExecutionResult|error dbResult;

    if existingSubmission is record {|int id;|} {
        // Update existing submission
        io:println("Updating existing submission with ID: " + existingSubmission.id.toString());

        dbResult = dbClient->execute(`
            UPDATE submissions SET
                code = ${code},
                language = ${language},
                status = 'completed',
                result = ${result},
                score = ${score},
                test_cases_passed = ${passedTests},
                total_test_cases = ${totalTests},
                submitted_at = CURRENT_TIMESTAMP
            WHERE id = ${existingSubmission.id}
        `);

        if dbResult is error {
            io:println("❌ Database update failed: " + dbResult.message());
            return error("Failed to update contest submission: " + dbResult.message());
        }

        io:println("✓ Submission updated successfully");
    } else {
        // Insert new submission
        io:println("Creating new submission");

        dbResult = dbClient->execute(`
            INSERT INTO submissions (
                user_id, challenge_id, contest_id, code, language, 
                status, result, score, test_cases_passed, total_test_cases,
                submitted_at
            ) VALUES (
                ${userId}, ${challengeId}, ${contestId}, ${code}, ${language},
                'completed', ${result}, ${score}, ${passedTests}, ${totalTests},
                CURRENT_TIMESTAMP
            )
        `);

        if dbResult is error {
            io:println("❌ Database insertion failed: " + dbResult.message());
            return error("Failed to save contest submission: " + dbResult.message());
        }

        io:println("✓ New submission created successfully");
    }

    return;
}

// Get user's contest progress from submissions table
public function getUserContestProgress(int userId, int contestId) returns record {}[]|error {
    stream<record {}, sql:Error?> resultStream = dbClient->query(`
        SELECT 
            s.challenge_id,
            s.test_cases_passed as passed_tests,
            s.total_test_cases as total_tests,
            s.score,
            s.result,
            s.submitted_at,
            c.title as challenge_title
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = ${userId} AND s.contest_id = ${contestId}
        ORDER BY s.submitted_at
    `);

    record {}[] submissions = [];
    record {|record {} value;|}|error? result = resultStream.next();

    while result is record {|record {} value;|} {
        submissions.push(result.value);
        result = resultStream.next();
    }

    error? closeResult = resultStream.close();
    if closeResult is error {
        return closeResult;
    }

    return submissions;
}

// Get challenges by contest ID
public function getChallengesByContestId(int contestId) returns models:Challenge[]|error {
    io:println("Getting challenges by contest ID: " + contestId.toString());

    // First, let's check if the contest exists
    stream<record {|int count;|}, sql:Error?> contestCheckStream = dbClient->query(`
        SELECT COUNT(*) as count FROM contests WHERE id = ${contestId}
    `);
    record {|record {|int count;|} value;|}|error? contestCheckResult = contestCheckStream.next();
    error? closeContestCheck = contestCheckStream.close();
    if closeContestCheck is error {
        return closeContestCheck;
    }

    if contestCheckResult is record {|record {|int count;|} value;|} {
        io:println("Contest " + contestId.toString() + " exists: " + (contestCheckResult.value.count > 0 ? "YES" : "NO"));
    }

    // Check how many contest-challenge relationships exist
    stream<record {|int count;|}, sql:Error?> relationshipCheckStream = dbClient->query(`
        SELECT COUNT(*) as count FROM contest_challenges WHERE contest_id = ${contestId}
    `);
    record {|record {|int count;|} value;|}|error? relationshipCheckResult = relationshipCheckStream.next();
    error? closeRelationshipCheck = relationshipCheckStream.close();
    if closeRelationshipCheck is error {
        return closeRelationshipCheck;
    }

    if relationshipCheckResult is record {|record {|int count;|} value;|} {
        io:println("Contest-challenge relationships for contest " + contestId.toString() + ": " + relationshipCheckResult.value.count.toString());
    }

    stream<record {}, sql:Error?> resultStream = dbClient->query(`
        SELECT c.* FROM challenges c
        JOIN contest_challenges cc ON c.id = cc.challenge_id
        WHERE cc.contest_id = ${contestId}
        ORDER BY c.id
    `);
    models:Challenge[] challenges = [];
    record {|record {} value;|}|error? result = resultStream.next();

    while result is record {|record {} value;|} {
        record {} rawChallenge = result.value;
        io:println("Found challenge: " + rawChallenge.toString());

        // Properly map all fields from result.value to challenge
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
            success_rate: <decimal>rawChallenge["success_rate"],
            // function_templates: rawChallenge["function_templates"] == () ? () : <string>rawChallenge["function_templates"],
            // test_cases: rawChallenge["test_cases"] == () ? () : <string>rawChallenge["test_cases"],
            created_at: <string>rawChallenge["created_at"],
            updated_at: <string>rawChallenge["updated_at"]
        };

        challenges.push(challenge);
        result = resultStream.next();
    }
    error? closeResult = resultStream.close();
    if closeResult is error {
        return closeResult;
    }

    io:println("Returning " + challenges.length().toString() + " challenges for contest " + contestId.toString());
    return challenges;
}

// Save contest result
public function saveContestResult(int userId, int contestId, decimal totalScore, int totalChallenges) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        INSERT INTO contest_results (
            user_id, contest_id, total_score, total_challenges, 
            average_score, completed_at
        ) VALUES (
            ${userId}, ${contestId}, ${totalScore}, ${totalChallenges},
            ${totalChallenges > 0 ? totalScore / <decimal>totalChallenges : 0.0},
            CURRENT_TIMESTAMP
        )
    `);
    if result is error {
        return error("Failed to save contest result: " + result.message());
    }
    return;
}

// Remove challenge from contest
public function removeChallengeFromContest(int contestId, int challengeId) returns error? {
    sql:ExecutionResult|error result = dbClient->execute(`
        DELETE FROM contest_challenges 
        WHERE contest_id = ${contestId} AND challenge_id = ${challengeId}
    `);
    if result is error {
        return error("Failed to remove challenge from contest: " + result.message());
    }
    return;
}

public function test() returns stream<record {}, sql:Error?> {
    stream<record {}, sql:Error?> relationshipStream = dbClient->query(`
        SELECT * FROM contest_challenges ORDER BY contest_id, challenge_id
    `);

    return relationshipStream;
}
