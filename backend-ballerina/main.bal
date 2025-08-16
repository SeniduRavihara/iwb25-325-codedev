import ballerina/sql;
import ballerina/io;
import ballerina/http;
import ballerina/jwt;
import ballerina/crypto;
// import ballerina/uuid;
import ballerina/time;
import ballerina/regex;
// import ballerina/lang.array;
import ballerina/mime;
import ballerinax/java.jdbc;

// Configuration
configurable string dbPath = "./auth.db";
configurable string jdbcUrl = "jdbc:sqlite:" + dbPath;
configurable string jwtSecret = "your-super-secret-jwt-key-change-this-in-production";
configurable int serverPort = 8080;

// Database client
final jdbc:Client dbClient = check new (jdbcUrl);

// Types
type User record {|
    int id;
    string username;
    string email;
    string password_hash;
    string created_at;
|};

type UserRegistration record {|
    string username;
    string email;
    string password;
|};

type UserLogin record {|
    string username;
    string password;
|};

type AuthResponse record {|
    string token;
    string username;
    string email;
    string message;
|};

type ErrorResponse record {|
    string message;
    int code;
|};

// HTTP service
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

        UserRegistration|error userReg = payload.cloneWithType(UserRegistration);
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

        // Validate input
        if userReg.username.length() < 3 {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                message: "Username must be at least 3 characters long",
                code: 400
            });
            check caller->respond(response);
            return;
        }

        if userReg.password.length() < 6 {
            http:Response response = new;
            response.statusCode = 400;
            response.setJsonPayload({
                message: "Password must be at least 6 characters long",
                code: 400
            });
            check caller->respond(response);
            return;
        }

        // Check if user already exists
        boolean|error userExistsResult = checkUserExists(userReg.username, userReg.email);
        if userExistsResult is error {
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                message: "Database error occurred",
                code: 500
            });
            check caller->respond(response);
            return;
        }

        if userExistsResult {
            http:Response response = new;
            response.statusCode = 409;
            response.setJsonPayload({
                message: "User already exists with this username or email",
                code: 409
            });
            check caller->respond(response);
            return;
        }

        // Hash password
        string hashedPassword = crypto:hashSha256(userReg.password.toBytes()).toBase64();

        // Insert user into database
        sql:ExecutionResult|error result = dbClient->execute(`
            INSERT INTO users (username, email, password_hash) 
            VALUES (${userReg.username}, ${userReg.email}, ${hashedPassword})
        `);

        if result is error {
            io:println("Database error: ", result);
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                message: "Failed to create user",
                code: 500
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 201;
        response.setJsonPayload({
            message: "User registered successfully",
            username: userReg.username,
            email: userReg.email
        });
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

        UserLogin|error userLogin = payload.cloneWithType(UserLogin);
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

        // Verify user credentials
        User|error user = checkUserCredentials(userLogin.username, userLogin.password);
        if user is error {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                message: "Invalid username or password",
                code: 401
            });
            check caller->respond(response);
            return;
        }

        // Generate JWT token
        string|error token = generateJwtToken(user);
        if token is error {
            io:println("JWT generation error: ", token);
            http:Response response = new;
            response.statusCode = 500;
            response.setJsonPayload({
                message: "Failed to generate authentication token",
                code: 500
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            token: token,
            username: user.username,
            email: user.email,
            message: "Login successful"
        });
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

        // Validate JWT token
        jwt:Payload|jwt:Error payload = validateJwtToken(token);
        if payload is jwt:Error {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                message: "Invalid or expired token",
                code: 401
            });
            check caller->respond(response);
            return;
        }

        // Get user info from token
        string|error username = payload.sub.ensureType();
        if username is error {
            http:Response response = new;
            response.statusCode = 401;
            response.setJsonPayload({
                message: "Invalid token payload",
                code: 401
            });
            check caller->respond(response);
            return;
        }

        // Fetch user details
        User|error user = getUserByUsername(username);
        if user is error {
            http:Response response = new;
            response.statusCode = 404;
            response.setJsonPayload({
                message: "User not found",
                code: 404
            });
            check caller->respond(response);
            return;
        }

        http:Response response = new;
        response.statusCode = 200;
        response.setJsonPayload({
            username: user.username,
            email: user.email,
            id: user.id,
            created_at: user.created_at,
            message: "Profile retrieved successfully"
        });
        check caller->respond(response);
    }
}

// Initialize database
function initDatabase() returns error? {
    io:println("Initializing database...");
    
    // Create users table
    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    if result is error {
        return result;
    }
    
    io:println("✓ Database initialized successfully");
}

// Check if user exists
function checkUserExists(string username, string email) returns boolean|error {
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

// Verify user credentials
function checkUserCredentials(string username, string password) returns User|error {
    string hashedPassword = crypto:hashSha256(password.toBytes()).toBase64();
    
    stream<User, sql:Error?> userStream = 
        dbClient->query(`SELECT id, username, email, password_hash, created_at FROM users 
                        WHERE username = ${username} AND password_hash = ${hashedPassword}`);
    
    record {|User value;|}|error? user = userStream.next();
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
function getUserByUsername(string username) returns User|error {
    stream<User, sql:Error?> userStream = 
        dbClient->query(`SELECT id, username, email, password_hash, created_at FROM users WHERE username = ${username}`);
    
    record {|User value;|}|error? user = userStream.next();
    error? closeResult = userStream.close();
    
    if closeResult is error {
        return closeResult;
    }
    
    if user is () || user is error {
        return error("User not found");
    }
    
    return user.value;
}

// Generate JWT token
function generateJwtToken(User user) returns string|error {
    time:Utc currentTime = time:utcNow();
    int currentTimestamp = <int>currentTime[0];
    int expiryTime = currentTimestamp + 3600; // 1 hour
    
    string headerStr = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    string payloadStr = string `{"iss":"ballerina-auth-server","sub":"${user.username}","aud":["ballerina-users"],"exp":${expiryTime},"iat":${currentTimestamp},"user_id":${user.id},"email":"${user.email}"}`;
    
    // Base64URL encode header and payload
    byte[] headerBytes = headerStr.toBytes();
    byte[] payloadBytes = payloadStr.toBytes();
    
    string headerB64 = headerBytes.toBase64();
    string payloadB64 = payloadBytes.toBase64();
    
    // Make URL safe
    headerB64 = regex:replaceAll(headerB64, "=", "");
    headerB64 = regex:replaceAll(headerB64, "\\+", "-");
    headerB64 = regex:replaceAll(headerB64, "/", "_");
    
    payloadB64 = regex:replaceAll(payloadB64, "=", "");
    payloadB64 = regex:replaceAll(payloadB64, "\\+", "-");
    payloadB64 = regex:replaceAll(payloadB64, "/", "_");
    
    string unsigned = headerB64 + "." + payloadB64;
    
    // Create signature using HMAC SHA256
    byte[]|error signatureBytes = crypto:hmacSha256(unsigned.toBytes(), jwtSecret.toBytes());
    if signatureBytes is error {
        return signatureBytes;
    }
    
    string signature = signatureBytes.toBase64();
    
    // Make signature URL safe
    signature = regex:replaceAll(signature, "=", "");
    signature = regex:replaceAll(signature, "\\+", "-");
    signature = regex:replaceAll(signature, "/", "_");
    
    return unsigned + "." + signature;
}

// Validate JWT token
function validateJwtToken(string token) returns jwt:Payload|jwt:Error {
    // Split the token
    string[] parts = regex:split(token, "\\.");
    if parts.length() != 3 {
        return error jwt:Error("Invalid token format");
    }
    
    // Verify signature
    string unsigned = parts[0] + "." + parts[1];
    byte[]|error expectedSigBytes = crypto:hmacSha256(unsigned.toBytes(), jwtSecret.toBytes());
    if expectedSigBytes is error {
        return error jwt:Error("Signature verification failed");
    }
    
    string expectedSig = expectedSigBytes.toBase64();
    expectedSig = regex:replaceAll(expectedSig, "=", "");
    expectedSig = regex:replaceAll(expectedSig, "\\+", "-");
    expectedSig = regex:replaceAll(expectedSig, "/", "_");
    
    if expectedSig != parts[2] {
        return error jwt:Error("Invalid signature");
    }
    
    // Decode payload (Base64URL decode)
    string payloadB64 = parts[1];
    // Add padding if needed
    int padding = 4 - (payloadB64.length() % 4);
    if padding < 4 {
        int i = 0;
        while i < padding {
            payloadB64 = payloadB64 + "=";
            i += 1;
        }
    }
    // Make Base64 standard
    payloadB64 = regex:replaceAll(payloadB64, "-", "\\+");
    payloadB64 = regex:replaceAll(payloadB64, "_", "/");
    
    byte[]|mime:DecodeError payloadBytes = mime:base64DecodeBlob(payloadB64.toBytes());
    if payloadBytes is mime:DecodeError {
        return error jwt:Error("Invalid payload encoding");
    }
    
    string|error payloadStr = string:fromBytes(payloadBytes);
    if payloadStr is error {
        return error jwt:Error("Invalid payload string conversion");
    }
    
    json|error payloadJson = payloadStr.fromJsonString();
    if payloadJson is error {
        return error jwt:Error("Invalid payload JSON");
    }
    
    // Extract basic fields manually
    map<json> payloadMap = <map<json>>payloadJson;
    
    string? iss = <string?>payloadMap["iss"];
    string? sub = <string?>payloadMap["sub"];
    json? audJson = payloadMap["aud"];
    int? exp = <int?>payloadMap["exp"];
    int? iat = <int?>payloadMap["iat"];
    
    // Create payload structure
    string[] audArray = [];
    if audJson is json[] {
        foreach json item in audJson {
            if item is string {
                audArray.push(item);
            }
        }
    }
    
    jwt:Payload payload = {
        iss: iss ?: "",
        sub: sub ?: "",
        aud: audArray,
        exp: exp ?: 0,
        iat: iat ?: 0
    };
    
    // Verify expiration
    time:Utc currentTime = time:utcNow();
    int currentTimestamp = <int>currentTime[0];
    
    if payload.exp > 0 && payload.exp < currentTimestamp {
        return error jwt:Error("Token expired");
    }
    
    return payload;
}

// Main function
public function main() returns error? {
    // Initialize database
    error? dbInitResult = initDatabase();
    if dbInitResult is error {
        return dbInitResult;
    }
    
    io:println(string `🚀 Auth Server starting on port ${serverPort}...`);
    io:println("Available endpoints:");
    io:println("  GET  /health   - Health check");
    io:println("  POST /register - User registration");
    io:println("  POST /login    - User login");
    io:println("  GET  /profile  - Get user profile (requires JWT)");
    io:println("\n✅ Server is ready to accept requests!");
}