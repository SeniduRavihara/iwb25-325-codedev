import backend_ballerina.analysis;
import backend_ballerina.auth;
import backend_ballerina.database;
import backend_ballerina.migrations;
import backend_ballerina.models;

import ballerina/http;
import ballerina/io;
import ballerina/os;
import ballerina/sql;
import ballerina/time;

// Configuration
configurable int serverPort = 8080;

// Check for command line arguments
public function main(string... args) returns error? {
    if args.length() > 0 {
        match args[0] {
            "migrate" => {
                return migrations:runMigrations();
            }
            "migrate:rollback" => {
                return migrations:rollbackMigration();
            }
            "seed" => {
                return migrations:runSeeders();
            }
            "db:fresh" => {
                return migrations:freshDatabase();
            }
            _ => {
                io:println("Unknown command: " + args[0]);
                io:println("Available commands: migrate, migrate:rollback, seed, db:fresh");
                return;
            }
        }
    }

    // Default: start server
    return startServer();
}

function startServer() returns error? {
    // Initialize database
    error? dbInitResult = database:initDatabase();
    if dbInitResult is error {
        return dbInitResult;
    }

    io:println(string `🚀 Auth Server starting on port ${serverPort}...`);
    io:println("Available endpoints:");
    io:println("  GET  /health   - Health check");
    io:println("  POST /register - User registration");
    io:println("  POST /login    - User login");
    io:println("  GET  /profile  - Get user profile (requires JWT)");
    io:println("  GET  /api/hello - Welcome message");
    io:println("  POST /api/submit - Code execution");
    io:println("  GET  /api/health - Code execution health");
    io:println("  GET  /api/languages - Supported languages");
    io:println("\n✅ Server is ready to accept requests!");
    return;
}

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:3000"],
        allowCredentials: true,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        exposeHeaders: ["Content-Type"]
    }
}
service / on new http:Listener(serverPort) {

    // Health check endpoint
    resource function get health() returns string {
        return "Auth Server is running!";
    }

    // User registration endpoint
    resource function post register(http:Caller caller, http:Request req) returns error? {
        json|http:ClientError payload = req.getJsonPayload();

        if payload is http:ClientError {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                message: "Invalid JSON payload",
                code: 400
            });
            check caller->respond(response);
            return;
        }

        models:UserRegistration|error userReg = payload.cloneWithType(models:UserRegistration);
        if userReg is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                message: "Invalid user data format",
                code: 400
            });
            check caller->respond(response);
            return;
        }

        // Use auth module for registration
        models:AuthResponse|models:ErrorResponse result = auth:registerUser(userReg);

        if result is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = result.code;
            response.setJsonPayload(result);
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 201;
        response.setJsonPayload(result);
        check caller->respond(response);
    }

    // User login endpoint
    resource function post login(http:Caller caller, http:Request req) returns error? {
        json|http:ClientError payload = req.getJsonPayload();

        if payload is http:ClientError {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                message: "Invalid JSON payload",
                code: 400
            });
            check caller->respond(response);
            return;
        }

        models:UserLogin|error userLogin = payload.cloneWithType(models:UserLogin);
        if userLogin is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                message: "Invalid login data format",
                code: 400
            });
            check caller->respond(response);
            return;
        }

        // Use auth module for login
        models:AuthResponse|models:ErrorResponse result = auth:loginUser(userLogin);

        if result is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = result.code;
            response.setJsonPayload(result);
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload(result);
        check caller->respond(response);
    }

    // Protected endpoint example
    resource function get profile(http:Caller caller, http:Request req) returns error? {
        // Get JWT token from Authorization header
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                message: "Authorization header required",
                code: 401
            });
            check caller->respond(response);
            return;
        }

        // Extract token (remove "Bearer " prefix)
        if !authHeader.startsWith("Bearer ") {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                message: "Invalid authorization header format",
                code: 401
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);

        // Use auth module for profile
        models:User|models:ErrorResponse result = auth:getUserProfile(token);

        if result is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = result.code;
            response.setJsonPayload(result);
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            username: result.username,
            email: result.email,
            id: result.id,
            is_admin: result.is_admin,
            role: result.role,
            created_at: result.created_at,
            message: "Profile retrieved successfully"
        });
        check caller->respond(response);
    }

    // Code Execution API endpoints
    resource function get api/hello() returns json {
        return {
            "message": "Welcome to Hackathon Platform!",
            "version": "1.0.0",
            "endpoints": {
                "submit": "POST /api/submit",
                "health": "GET /api/health"
            }
        };
    }

    resource function post api/submit(http:Caller caller, http:Request req) returns error? {
        json payload = check req.getJsonPayload();

        // Extract and validate fields
        string code = check payload.code.ensureType(string);
        string lang = check payload.language.ensureType(string);

        // Validate supported languages
        if !(lang == "python" || lang == "java" || lang == "ballerina") {
            json errorResponse = {
                "success": false,
                "error": "Unsupported language: " + lang,
                "supportedLanguages": ["python", "java", "ballerina"]
            };
            check caller->respond(errorResponse);
            return;
        }

        // For Java, ensure proper class structure
        if lang == "java" && !code.includes("class Main") {
            json errorResponse = {
                "success": false,
                "error": "Java code must contain 'public class Main' with main method",
                "example": "public class Main { public static void main(String[] args) { System.out.println(\\\"Hello\\\"); } }"
            };
            check caller->respond(errorResponse);
            return;
        }

        // Record start time
        time:Utc startTime = time:utcNow();

        // Build Docker command with performance monitoring
        string dockerImage = "multi-lang-runner:latest";

        // Create proper os:Command record with environment variable for code
        os:Command dockerCmd = {
            value: "docker",
            arguments: [
                "run", "--rm",
                "--memory=256m",  // Memory limit
                "--cpus=1.0",  // CPU limit  
                "--network=none",  // No network access
                "--pids-limit=50",  // Process limit
                "--security-opt", "no-new-privileges",
                "--cap-drop", "ALL",
                "--read-only",
                "--tmpfs", "/tmp:rw,size=16m",
                "--user", "10001:10001",
                "-e", "CODE_TO_EXECUTE_B64=" + code.toBytes().toBase64(),  // Pass base64 encoded code
                dockerImage,
                lang
            ]
        };

        json response;

        // Execute the Docker command
        os:Process|os:Error result = os:exec(dockerCmd);

        if result is os:Process {
            int exitCode = check result.waitForExit();
            time:Utc endTime = time:utcNow();

            // Calculate execution time in seconds, then convert to milliseconds
            decimal executionTimeSeconds = time:utcDiffSeconds(endTime, startTime);
            decimal executionTimeMs = executionTimeSeconds * 1000.0d;

            // Read the output from stdout and stderr
            byte[] stdoutBytes = check result.output(io:stdout);
            byte[] stderrBytes = check result.output(io:stderr);

            string stdout = check string:fromBytes(stdoutBytes);
            string stderr = check string:fromBytes(stderrBytes);

            if exitCode == 0 {
                response = {
                    "success": true,
                    "language": lang,
                    "output": stdout.trim(),
                    "executionTime": {
                        "milliseconds": executionTimeMs,
                        "seconds": executionTimeSeconds
                    },
                    "performance": {
                        "memoryLimit": "256MB",
                        "cpuLimit": "1.0 cores",
                        "processLimit": 50,
                        "networkAccess": false
                    },
                    "analysis": analysis:analyzeCode(code, lang),
                    "exitCode": exitCode,
                    "timestamp": time:utcToString(endTime)
                };
            } else {
                response = {
                    "success": false,
                    "language": lang,
                    "error": stderr.trim().length() > 0 ? stderr.trim() : "Code execution failed",
                    "output": stdout.trim(),
                    "executionTime": {
                        "milliseconds": executionTimeMs,
                        "seconds": executionTimeSeconds
                    },
                    "analysis": analysis:analyzeCode(code, lang),
                    "exitCode": exitCode,
                    "timestamp": time:utcToString(endTime)
                };
            }
        } else {
            time:Utc endTime = time:utcNow();
            decimal executionTimeSeconds = time:utcDiffSeconds(endTime, startTime);
            decimal executionTimeMs = executionTimeSeconds * 1000.0d;

            response = {
                "success": false,
                "error": "Failed to start Docker container: " + result.message(),
                "executionTime": {
                    "milliseconds": executionTimeMs,
                    "seconds": executionTimeSeconds
                }
            };
        }

        check caller->respond(response);
    }

    resource function get api/health() returns json {
        string dockerStatus = "unknown";
        // Probe docker
        os:Command checkCmd = {value: "docker", arguments: ["version", "--format", "{{.Server.Version}}"]};
        os:Process|os:Error pr = os:exec(checkCmd);
        if pr is os:Process {
            int|error ec = pr.waitForExit();
            if ec is int {
                dockerStatus = ec == 0 ? "available" : "unavailable";
            } else {
                dockerStatus = "unavailable";
            }
        } else {
            dockerStatus = "unavailable";
        }

        return {
            "status": dockerStatus == "available" ? "healthy" : "degraded",
            "timestamp": time:utcToString(time:utcNow()),
            "services": {
                "docker": dockerStatus,
                "codeExecution": dockerStatus == "available" ? "ready" : "unavailable"
            },
            "systemInfo": {
                "memoryLimit": "256MB per execution",
                "timeoutLimit": "30 seconds",
                "supportedLanguages": ["python", "java", "ballerina"]
            }
        };
    }

    resource function get api/languages() returns json {
        return {
            "supportedLanguages": [
                {
                    "name": "python",
                    "version": "3.x",
                    "fileExtension": ".py",
                    "example": "print('Hello, World!')"
                },
                {
                    "name": "java",
                    "version": "17",
                    "fileExtension": ".java",
                    "example": "public class Main { public static void main(String[] args) { System.out.println(\\\"Hello, World!\\\"); } }"
                },
                {
                    "name": "ballerina",
                    "version": "2201.9.0",
                    "fileExtension": ".bal",
                    "example": "import ballerina/io; public function main() { io:println(\\\"Hello, World!\\\"); }"
                }
            ]
        };
    }

    // ===== SIMPLE API ENDPOINTS FOR FRONTEND =====

    // Test API - Get all users from database (like authentication works)
    resource function get test_users(http:Caller caller, http:Request req) returns error? {
        // Use the database function (same pattern as authentication)
        models:Challenge[]|error users = database:getAllChallenges();

        if users is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch users: " + users.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "message": "Users fetched from database successfully!",
            "data": users
        });
        check caller->respond(response);
    }

    // Get all challenges (public)
    resource function get challenges(http:Caller caller, http:Request req) returns error? {
        // io:println("DEBUG: Starting challenges endpoint");

        models:Challenge[]|error challenges = database:getAllChallenges();
        // io:println("DEBUG: Database call completed");

        if challenges is error {
            // io:println("DEBUG: Error from database: " + challenges.message());
            // io:println("DEBUG: Error details: " + challenges.toString());

            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch challenges: " + challenges.message(),
                "error_details": challenges.toString()
            });
            check caller->respond(response);
            return;
        }

        // io:println("DEBUG: Successfully got " + challenges.length().toString() + " challenges");

        // Log first challenge for debugging (if exists)
        if challenges.length() > 0 {
            // io:println("DEBUG: First challenge title: " + challenges[0].title);
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": challenges,
            "count": challenges.length()
        });

        // io:println("DEBUG: Sending response with " + challenges.length().toString() + " challenges");
        check caller->respond(response);
    }

    // Get all contests (public)
    resource function get contests(http:Caller caller, http:Request req) returns error? {
        // Update contest status based on current time
        // error? updateResult = database:updateContestStatus();
        // if updateResult is error {
        //     io:println("Warning: Failed to update contest status: " + updateResult.message());
        // }

        models:Contest[]|error contests = database:getAllContests();

        if contests is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch contests: " + contests.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": contests.toJson(),
            "count": contests.length()
        });
        check caller->respond(response);
    }

    // Get test cases for a challenge (public - only visible test cases)
    resource function get testcases(http:Caller caller, http:Request req) returns error? {
        // Get challenge ID from query parameter
        string|http:HeaderNotFoundError challengeIdParam = req.getHeader("X-Challenge-ID");
        int challengeId = 1; // default

        if challengeIdParam is string {
            int|error parsedId = int:fromString(challengeIdParam);
            if parsedId is int {
                challengeId = parsedId;
            }
        }

        models:TestCase[]|error testCases = database:getTestCasesByChallengeId(challengeId);

        if testCases is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch test cases: " + testCases.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": testCases
        });
        check caller->respond(response);
    }

    // Get test cases for a specific challenge (public)
    resource function get challenges/[int challengeId]/testcases(http:Caller caller, http:Request req) returns error? {
        models:TestCase[]|error testCases = database:getTestCasesByChallengeId(challengeId);

        if testCases is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch test cases: " + testCases.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": testCases
        });
        check caller->respond(response);
    }

    // store test cases for a specific challenge (admin only)----------------------------------
    resource function post challenges/[int challengeId]/testcases(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Parse request body
        json|http:ClientError payload = req.getJsonPayload();
        if payload is http:ClientError {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid JSON payload"
            });
            check caller->respond(response);
            return;
        }

        // Extract challenge data
        models:LinkTestcasesToChallenge|error testcasesData = payload.cloneWithType(models:LinkTestcasesToChallenge);

        if testcasesData is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid test cases data format"
            });
            check caller->respond(response);
            return;
        }

        foreach models:RecevingTestCases testcase in testcasesData.testcases {

            io:println("DEBUG: Testcase: ", testcase.toJson());

            sql:ExecutionResult|error result = database:createTestCases(testcase, challengeId);
            if result is error {
                http:Response response = new;
                response.statusCode = 500;
                response.setJsonPayload({
                    "success": false,
                    "message": "Failed to add test case to challenge " + challengeId.toString() + ": " + result.message()
                });
                check caller->respond(response);
                return;
            }
        }

        http:Response response = new;
        response.statusCode = 201;
        response.setJsonPayload({
            "success": true,
            "message": "Test cases added to challenge successfully"
        });
        check caller->respond(response);
    }

    // Code Template endpoints
    // Get code templates for a specific challenge (public)
    resource function get challenges/[int challengeId]/templates(http:Caller caller, http:Request req) returns error? {
        models:CodeTemplate[]|error templates = database:getCodeTemplatesByChallengeId(challengeId);

        if templates is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch code templates: " + templates.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": templates
        });
        check caller->respond(response);
    }

    // Create code template for a specific challenge (admin only)
    resource function post challenges/[int challengeId]/templates(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Parse request body
        json|http:ClientError payload = req.getJsonPayload();
        if payload is http:ClientError {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid JSON payload"
            });
            check caller->respond(response);
            return;
        }

        // Extract template data
        models:CodeTemplateCreate|error templateData = payload.cloneWithType(models:CodeTemplateCreate);

        if templateData is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid template data format"
            });
            check caller->respond(response);
            return;
        }

        // Create template in database
        sql:ExecutionResult|error result = database:createCodeTemplate(templateData, challengeId);
        if result is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to create code template: " + result.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 201;
        response.setJsonPayload({
            "success": true,
            "message": "Code template created successfully",
            "data": {
                "template_id": result.lastInsertId,
                "challenge_id": challengeId
            }
        });
        check caller->respond(response);
    }

    // Create multiple code templates for a specific challenge (admin only)
    resource function post challenges/[int challengeId]/templates/bulk(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Parse request body
        json|http:ClientError payload = req.getJsonPayload();
        if payload is http:ClientError {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid JSON payload"
            });
            check caller->respond(response);
            return;
        }

        io:println("DEBUG: Payload: ", payload.toJson());

        // Extract template data
        models:BulkCodeTemplateCreate|error templatesData = payload.cloneWithType(models:BulkCodeTemplateCreate);

        if templatesData is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid templates data format"
            });
            check caller->respond(response);
            return;
        }

        // Create templates in database
        error? result = database:createBulkCodeTemplates(templatesData, challengeId);
        if result is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to create code templates: " + result.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 201;
        response.setJsonPayload({
            "success": true,
            "message": "Code templates created successfully",
            "data": {
                "challenge_id": challengeId,
                "templates_created": templatesData.templates.length()
            }
        });
        check caller->respond(response);
    }

    // Get challenges for a specific contest (public)
    resource function get contests/[int contestId]/challenges(http:Caller caller, http:Request req) returns error? {
        models:Challenge[]|error challenges = database:getChallengesByContestId(contestId);

        if challenges is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch challenges: " + challenges.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": challenges
        });
        check caller->respond(response);
    }

    // Get submissions for a specific challenge (public)

    resource function get challenges/[int challengeId]/submissions(http:Caller caller, http:Request req) returns error? {
        models:Submission[]|error submissions = database:getSubmissionsByChallengeId(challengeId);

        if submissions is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch submissions: " + submissions.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
                "success": true,
                "data": submissions
            });
        check caller->respond(response);
    }

    // Get all submissions for the authenticated user
    resource function get user/submissions(http:Caller caller, http:Request req) returns error? {
        // Check authentication
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        // Get user's submissions
        models:Submission[]|error submissions = database:getUserSubmissions(userResult.id);
        if submissions is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch user submissions: " + submissions.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": submissions
        });
        check caller->respond(response);
    }

    // Debug endpoint to check database state
    resource function get debug/database(http:Caller caller, http:Request req) returns error? {
        // Get all contests
        models:Contest[]|error contestsResult = database:getAllContests();
        models:Contest[] contests = [];
        if contestsResult is models:Contest[] {
            contests = contestsResult;
        }

        // Get all challenges
        models:Challenge[]|error challengesResult = database:getAllChallenges();
        models:Challenge[] challenges = [];
        if challengesResult is models:Challenge[] {
            challenges = challengesResult;
        }

        // Get contest-challenge relationships
        stream<record {}, sql:Error?> relationshipStream = database:test();

        json[] relationships = [];
        record {|record {} value;|}|error? result = relationshipStream.next();
        while result is record {|record {} value;|} {
            json|error jsonValue = result.value.toJson();
            if jsonValue is json {
                relationships.push(jsonValue);
            }
            result = relationshipStream.next();
        }
        error? closeResult = relationshipStream.close();
        if closeResult is error {
            io:println("Error closing relationship stream: " + closeResult.message());
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": {
                "contests": contests,
                "challenges": challenges,
                "contest_challenges": relationships,
                "summary": {
                    "total_contests": contests.length(),
                    "total_challenges": challenges.length(),
                    "total_relationships": relationships.length()
                }
            }
        });

        // Fixed: Assign action result to variable, then return
        error? respondResult = caller->respond(response);
        return respondResult;
    }

    // Add challenges to contest (admin only)
    resource function post contests/[int contestId]/link_challenges(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Parse request body
        json|http:ClientError payload = req.getJsonPayload();
        if payload is http:ClientError {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid JSON payload"
            });
            check caller->respond(response);
            return;
        }

        // Extract challenge data
        models:LinkChallengesToContest|error challengeIdsData = payload.cloneWithType(models:LinkChallengesToContest);

        if challengeIdsData is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid challenge data format"
            });
            check caller->respond(response);
            return;
        }

        foreach int challengeId in challengeIdsData.challengeIds {
            int points = 100; // default points
            int orderIndex = 0; // default order

            error? result = database:addChallengeToContest(contestId, challengeId, points, orderIndex);
            if result is error {
                http:Response response = new;
                response.statusCode = 500;
                response.setJsonPayload({
                    "success": false,
                    "message": "Failed to add challenge " + challengeId.toString() + ": " + result.message()
                });
                check caller->respond(response);
                return;
            }
        }

        http:Response response = new;
        response.statusCode = 201;
        response.setJsonPayload({
            "success": true,
            "message": "Challenge added to contest successfully"
        });
        check caller->respond(response);
    }

    // Admin endpoints for challenges
    resource function get admin_challenges(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        models:Challenge[]|error challenges = database:getAllChallenges();

        if challenges is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch challenges: " + challenges.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": challenges
        });
        check caller->respond(response);
    }

    // Admin endpoints for contests
    resource function get admin_contests(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        models:Contest[]|error contests = database:getAllContests();

        if contests is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to fetch contests: " + contests.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": contests
        });
        check caller->respond(response);
    }

    // Create new challenge (admin only)
    resource function post challenges(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Parse request body
        json|http:ClientError payload = req.getJsonPayload();
        if payload is http:ClientError {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid JSON payload"
            });
            check caller->respond(response);
            return;
        }

        models:ChallengeCreate|error challengeData = payload.cloneWithType(models:ChallengeCreate);
        if challengeData is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid challenge data format"
            });
            check caller->respond(response);
            return;
        }

        // Create challenge in database
        sql:ExecutionResult|error result = database:createChallenge(challengeData, userResult.id);
        if result is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to create challenge: " + result.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 201;
        response.setJsonPayload({
            "success": true,
            "message": "Challenge created successfully",
            "data": {
                "title": challengeData.title,
                "difficulty": challengeData.difficulty,
                "author_id": userResult.id,
                "challenge_id": result.lastInsertId
            }
        });
        check caller->respond(response);
    }

    // Create new contest (admin only)
    resource function post contests(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Parse request body
        json|http:ClientError payload = req.getJsonPayload();
        if payload is http:ClientError {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid JSON payload"
            });
            check caller->respond(response);
            return;
        }

        models:ContestCreate|error contestData = payload.cloneWithType(models:ContestCreate);
        if contestData is error {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid contest data format"
            });
            check caller->respond(response);
            return;
        }

        // Create contest in database
        sql:ExecutionResult|error result = database:createContest(contestData, userResult.id);
        if result is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to create contest: " + result.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 201;
        response.setJsonPayload({
            "success": true,
            "message": "Contest created successfully",
            "data": {
                "title": contestData.title,
                "duration": contestData.duration,
                "created_by": userResult.id,
                "contest_id": result.lastInsertId
            }
        });
        check caller->respond(response);
    }

    // Delete challenge (admin only)
    resource function delete challenges/[int challengeId](http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Delete challenge from database
        sql:ExecutionResult|error result = database:deleteChallenge(challengeId);
        if result is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to delete challenge: " + result.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "message": "Challenge deleted successfully"
        });
        check caller->respond(response);
    }

    // Delete contest (admin only)
    resource function delete contests/[int contestId](http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Delete contest from database
        sql:ExecutionResult|error result = database:deleteContest(contestId);
        if result is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to delete contest: " + result.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "message": "Contest deleted successfully"
        });
        check caller->respond(response);
    }

    // Register for contest
    resource function post contests/[int contestId]/register(http:Caller caller, http:Request req) returns error? {
        // Check authentication
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        // Register user for contest
        sql:ExecutionResult|error result = database:registerForContest(contestId, userResult.id);
        if result is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to register for contest: " + result.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "message": "Successfully registered for contest"
        });
        check caller->respond(response);
    }

    // Unregister from contest
    resource function delete contests/[int contestId]/register(http:Caller caller, http:Request req) returns error? {
        // Check authentication
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        // Unregister user from contest
        sql:ExecutionResult|error result = database:unregisterFromContest(contestId, userResult.id);
        if result is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to unregister from contest: " + result.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "message": "Successfully unregistered from contest"
        });
        check caller->respond(response);
    }

    // Check if user is registered for contest
    resource function get contests/[int contestId]/register(http:Caller caller, http:Request req) returns error? {
        // Check authentication
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        // Check if user is registered
        boolean|error isRegistered = database:isUserRegisteredForContest(contestId, userResult.id);
        if isRegistered is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to check registration status: " + isRegistered.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": {
                "isRegistered": isRegistered
            }
        });
        check caller->respond(response);
    }

    // Update contest status (admin only)
    resource function post contests_update_status(http:Caller caller, http:Request req) returns error? {
        // Check if user is admin
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        if authHeader is http:HeaderNotFoundError {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Authorization header required"
            });
            check caller->respond(response);
            return;
        }

        string token = authHeader.substring(7);
        models:User|models:ErrorResponse userResult = auth:getUserProfile(token);
        if userResult is models:ErrorResponse {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                "success": false,
                "message": "Invalid token"
            });
            check caller->respond(response);
            return;
        }

        if !userResult.is_admin {
            http:Response response = new;
            response.statusCode = 403;
            response.setJsonPayload({
                "success": false,
                "message": "Admin access required"
            });
            check caller->respond(response);
            return;
        }

        // Update contest status
        error? updateResult = database:updateContestStatus();
        if updateResult is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to update contest status: " + updateResult.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "message": "Contest status updated successfully"
        });
        check caller->respond(response);
    }

    // Update specific contest status (public - for timer-triggered updates)
    resource function post contests/[int contestId]/update_status(http:Caller caller, http:Request req) returns error? {
        // Debug: Print when API is called
        io:println("🔥 API CALLED: POST /contests/" + contestId.toString() + "/update_status");

        // Update specific contest to active
        error? updateResult = database:updateContestToActive(contestId);
        if updateResult is error {
            io:println("❌ DATABASE ERROR: " + updateResult.message());
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to update contest status: " + updateResult.message()
            });
            check caller->respond(response);
            return;
        }

        io:println("✅ DATABASE SUCCESS: Contest " + contestId.toString() + " status updated to 'active'");
        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "message": "Contest status updated successfully"
        });
        check caller->respond(response);
    }

    // Debug endpoint to check contest status
    resource function get contests/[int contestId]/status(http:Caller caller, http:Request req) returns error? {
        string|error status = database:getContestStatus(contestId);

        http:Response response = new;
        if status is error {
            response.statusCode = 404;
            response.setJsonPayload({
                "success": false,
                "message": status.message()
            });
        } else {
            response.statusCode = 200;
            response.setJsonPayload({
                "success": true,
                "data": {
                    "contestId": contestId,
                    "status": status
                }
            });
        }
        check caller->respond(response);
    }

    // Submit solution for a contest challenge
    resource function post contests/[int contestId]/challenges/[int challengeId]/[int userId]/submit(http:Caller caller, http:Request req) returns error? {
        // Parse request body
        json requestBody = check req.getJsonPayload();
        string code = check requestBody.code;
        string language = check requestBody.language;
        // string token = check requestBody.token;

        io:println("🔥 API CALLED: POST /contests/" + contestId.toString() + "/challenges/" + challengeId.toString() + "/submit");
        io:println("🔥 CODE: " + code);
        io:println("🔥 LANGUAGE: " + language);

        // Parse frontend-calculated results properly
        int passedTests = 0;
        int totalTests = 0;
        decimal successRate = 0.0;
        decimal score = 0.0;

        // Extract frontend results from request body
        passedTests = check requestBody.passedTests;
        totalTests = check requestBody.totalTests;
        successRate = check requestBody.successRate;
        score = check requestBody.score;

        io:println("📊 Test Results - Passed: " + passedTests.toString() + "/" + totalTests.toString() +
                " (" + successRate.toString() + "%) - Score: " + score.toString());

        // Save submission to database
        error? saveResult = database:saveContestSubmission(
                userId,
                challengeId,
                contestId,
                code,
                language,
                passedTests,
                totalTests,
                successRate,
                score
        );

        if saveResult is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to save submission: " + saveResult.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": {
                "passedTests": passedTests,
                "totalTests": totalTests,
                "successRate": successRate,
                "score": score,
                "message": "Solution submitted successfully"
            }
        });
        check caller->respond(response);
    }

    // Get user's contest progress
    resource function get contests/[int contestId]/progress(http:Caller caller, http:Request req) returns error? {
        // Get user ID from query params for now
        int userId = 1; // Default user ID for now

        // Get user's submissions for this contest
        record {}[]|error submissions = database:getUserContestProgress(userId, contestId);

        if submissions is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to get progress: " + submissions.message()
            });
            check caller->respond(response);
            return;
        }

        // Get all challenges for this contest
        models:Challenge[]|error challenges = database:getChallengesByContestId(contestId);

        if challenges is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to get challenges: " + challenges.message()
            });
            check caller->respond(response);
            return;
        }

        // Calculate progress
        int totalChallenges = challenges.length();
        int completedChallenges = submissions.length();
        decimal progressPercentage = totalChallenges > 0 ? <decimal>completedChallenges / <decimal>totalChallenges * 100.0 : 0.0;

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": {
                "totalChallenges": totalChallenges,
                "completedChallenges": completedChallenges,
                "progressPercentage": progressPercentage,
                "submissions": [],
                "canEndContest": completedChallenges >= totalChallenges
            }
        });
        check caller->respond(response);
    }

    // End contest and calculate final results
    resource function post contests/[int contestId]/end(http:Caller caller, http:Request req) returns error? {
        // Get user ID from query params for now
        int userId = 1; // Default user ID for now

        // Get user's submissions for this contest
        record {}[]|error submissions = database:getUserContestProgress(userId, contestId);

        if submissions is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to get submissions: " + submissions.message()
            });
            check caller->respond(response);
            return;
        }

        // Calculate total score
        decimal totalScore = 0.0;
        int totalChallenges = 0;

        // foreach record {} submission in submissions {
        //     // Extract score from submission record
        //     // For now, assume score is available in the record
        //     totalScore += 0.0d; // TODO: Extract actual score
        //     totalChallenges += 1;
        // }

        // Save final contest result
        error? saveResult = database:saveContestResult(userId, contestId, totalScore, totalChallenges);

        if saveResult is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                "success": false,
                "message": "Failed to save contest result: " + saveResult.message()
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            "success": true,
            "data": {
                "totalScore": totalScore,
                "totalChallenges": totalChallenges,
                "averageScore": totalChallenges > 0 ? totalScore / <decimal>totalChallenges : 0.0,
                "message": "Contest ended successfully"
            }
        });
        check caller->respond(response);
    }
}

// Function to analyze code complexity

