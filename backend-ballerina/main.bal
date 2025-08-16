// main.bal

import backend_ballerina.auth;
import backend_ballerina.database;
import backend_ballerina.models;

import ballerina/http;
import ballerina/io;

// Configuration
configurable int serverPort = 8080;

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
            created_at: result.created_at,
            message: "Profile retrieved successfully"
        });
        check caller->respond(response);
    }
}

// Main function
public function main() returns error? {
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
    io:println("\n✅ Server is ready to accept requests!");
}
