import backend_ballerina.auth;
import backend_ballerina.database;
import backend_ballerina.migrations;
import backend_ballerina.models;
import backend_ballerina.seeders;

import ballerina/http;
import ballerina/io;
import ballerina/os;
import ballerina/regex;
import ballerina/time;

// Configuration
configurable int serverPort = 8080;

// Check for command line arguments
public function main(string... args) returns error? {
    if args.length() > 0 {
        match args[0] {
            "migrate" => {
                return runMigrations();
            }
            "migrate:rollback" => {
                return rollbackMigration();
            }
            "seed" => {
                return runSeeders();
            }
            "db:fresh" => {
                return freshDatabase();
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

function runMigrations() returns error? {
    io:println("🔄 Running database migrations...");
    migrations:MigrationManager migrationManager = new (database:getDbClient());
    check migrationManager.migrate();
    return;
}

function rollbackMigration() returns error? {
    io:println("⏪ Rolling back last migration...");
    migrations:MigrationManager migrationManager = new (database:getDbClient());
    check migrationManager.rollbackMigration();
    return;
}

function runSeeders() returns error? {
    seeders:DatabaseSeeder seeder = new (database:getDbClient());
    check seeder.seed();
    return;
}

function freshDatabase() returns error? {
    seeders:DatabaseSeeder seeder = new (database:getDbClient());
    check seeder.fresh();
    return;
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
                    "analysis": analyzeCode(code, lang),
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
                    "analysis": analyzeCode(code, lang),
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
}

// Function to analyze code complexity
function analyzeCode(string code, string language) returns json {
    json analysis = {
        "linesOfCode": countLines(code),
        "codeLength": code.length(),
        "complexity": "unknown"
    };

    if language == "python" {
        json pythonAnalysis = analyzePythonComplexity(code);
        json patterns = analyzePythonPatterns(code);

        analysis = {
            "linesOfCode": countLines(code),
            "codeLength": code.length(),
            "estimatedComplexity": pythonAnalysis,
            "patterns": patterns
        };
    } else if language == "java" {
        json javaAnalysis = analyzeJavaComplexity(code);
        json patterns = analyzeJavaPatterns(code);

        analysis = {
            "linesOfCode": countLines(code),
            "codeLength": code.length(),
            "estimatedComplexity": javaAnalysis,
            "patterns": patterns
        };
    } else if language == "ballerina" {
        json balAnalysis = analyzeBallerinaComplexity(code);
        analysis = {
            "linesOfCode": countLines(code),
            "codeLength": code.length(),
            "estimatedComplexity": balAnalysis,
            "patterns": []
        };
    }

    return analysis;
}

function countLines(string code) returns int {
    string[] lines = regex:split(code, "\n");
    // Count non-empty lines
    int nonEmptyLines = 0;
    foreach string line in lines {
        if line.trim().length() > 0 {
            nonEmptyLines += 1;
        }
    }
    return nonEmptyLines;
}

function analyzePythonComplexity(string code) returns json {
    string timeComplexity = "O(?)";
    string spaceComplexity = "O(?)";
    string[] patterns = [];

    // Basic pattern detection
    if code.includes("for") && regex:matches(code, ".*for.*for.*") {
        patterns.push("nested_loops");
        timeComplexity = "O(n²) - potential nested loops detected";
    } else if code.includes("for") || code.includes("while") {
        patterns.push("single_loop");
        timeComplexity = "O(n) - single loop detected";
    } else {
        timeComplexity = "O(1) - no loops detected";
    }

    if code.includes("[]") || code.includes("list") || code.includes("dict") {
        patterns.push("data_structures");
        spaceComplexity = "O(n) - data structures detected";
    } else {
        spaceComplexity = "O(1) - minimal space usage";
    }

    return {
        "timeComplexity": timeComplexity,
        "spaceComplexity": spaceComplexity,
        "detectedPatterns": <json>patterns
    };
}

function analyzeJavaComplexity(string code) returns json {
    string timeComplexity = "O(?)";
    string spaceComplexity = "O(?)";
    string[] patterns = [];

    // Basic pattern detection for Java
    if code.includes("for") && regex:matches(code, ".*for.*for.*") {
        patterns.push("nested_loops");
        timeComplexity = "O(n²) - potential nested loops detected";
    } else if code.includes("for") || code.includes("while") {
        patterns.push("single_loop");
        timeComplexity = "O(n) - single loop detected";
    } else {
        timeComplexity = "O(1) - no loops detected";
    }

    if code.includes("ArrayList") || code.includes("HashMap") || code.includes("[]") {
        patterns.push("data_structures");
        spaceComplexity = "O(n) - data structures detected";
    } else {
        spaceComplexity = "O(1) - minimal space usage";
    }

    return {
        "timeComplexity": timeComplexity,
        "spaceComplexity": spaceComplexity,
        "detectedPatterns": <json>patterns
    };
}

function analyzePythonPatterns(string code) returns json {
    string[] patterns = [];

    if code.includes("def ") {
        patterns.push("function_definition");
    }
    if code.includes("class ") {
        patterns.push("class_definition");
    }
    if code.includes("import ") {
        patterns.push("imports");
    }
    if code.includes("try:") || code.includes("except:") {
        patterns.push("error_handling");
    }
    if code.includes("lambda ") {
        patterns.push("lambda_functions");
    }

    return <json>patterns;
}

function analyzeJavaPatterns(string code) returns json {
    string[] patterns = [];

    if code.includes("public static void main") {
        patterns.push("main_method");
    }
    if code.includes("class ") {
        patterns.push("class_definition");
    }
    if code.includes("import ") {
        patterns.push("imports");
    }
    if code.includes("try {") || code.includes("catch") {
        patterns.push("error_handling");
    }
    if code.includes("interface ") {
        patterns.push("interface_definition");
    }

    return <json>patterns;
}

function analyzeBallerinaComplexity(string code) returns json {
    string timeComplexity = "O(?)";
    string spaceComplexity = "O(?)";
    string[] patterns = [];

    if code.includes("foreach") && regex:matches(code, ".*foreach.*foreach.*") {
        patterns.push("nested_loops");
        timeComplexity = "O(n²) - potential nested loops detected";
    } else if code.includes("foreach") || code.includes("while") {
        patterns.push("single_loop");
        timeComplexity = "O(n) - single loop detected";
    } else {
        timeComplexity = "O(1) - no loops detected";
    }

    spaceComplexity = "O(?)";

    return {
        "timeComplexity": timeComplexity,
        "spaceComplexity": spaceComplexity,
        "detectedPatterns": <json>patterns
    };
}
