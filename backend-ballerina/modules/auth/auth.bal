import backend_ballerina.database;
import backend_ballerina.jwt;
import backend_ballerina.models;

import ballerina/crypto;
import ballerina/io;

// Register new user
public function registerUser(models:UserRegistration userReg) returns models:AuthResponse|models:ErrorResponse {
    // Validate input
    if userReg.username.length() < 3 {
        return {
            message: "Username must be at least 3 characters long",
            code: 400
        };
    }

    if userReg.password.length() < 6 {
        return {
            message: "Password must be at least 6 characters long",
            code: 400
        };
    }

    // Check if user already exists
    boolean|error userExistsResult = database:checkUserExists(userReg.username, userReg.email);
    if userExistsResult is error {
        return {
            message: "Database error occurred",
            code: 500
        };
    }

    if userExistsResult {
        return {
            message: "User already exists with this username or email",
            code: 409
        };
    }

    // Hash password
    string hashedPassword = crypto:hashSha256(userReg.password.toBytes()).toBase64();

    // Insert user into database
    var result = database:createUser(userReg, hashedPassword);
    if result is error {
        io:println("Database error: ", result);
        return {
            message: "Failed to create user",
            code: 500
        };
    }

    return {
        message: "User registered successfully",
        username: userReg.username,
        email: userReg.email,
        is_admin: false,
        role: "user"
    };
}

// Login user
public function loginUser(models:UserLogin userLogin) returns models:AuthResponse|models:ErrorResponse {
    // Hash password
    string hashedPassword = crypto:hashSha256(userLogin.password.toBytes()).toBase64();

    // Verify user credentials
    models:User|error user = database:getUserByCredentials(userLogin.username, hashedPassword);
    if user is error {
        return {
            message: "Invalid username or password",
            code: 401
        };
    }

    // Generate JWT token
    string|error token = jwt:generateToken(user);
    if token is error {
        io:println("JWT generation error: ", token);
        return {
            message: "Failed to generate authentication token",
            code: 500
        };
    }

    return {
        token: token,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
        role: user.role,
        message: "Login successful"
    };
}

// Get user profile
public function getUserProfile(string token) returns models:User|models:ErrorResponse {
    // Validate JWT token
    models:JwtPayload|error payload = jwt:validateToken(token);
    if payload is error {
        return {
            message: "Invalid or expired token",
            code: 401
        };
    }

    // Get user info from token
    string username = payload.sub;

    // Fetch user details
    models:User|error user = database:getUserByUsername(username);
    if user is error {
        return {
            message: "User not found",
            code: 404
        };
    }

    return user;
}
