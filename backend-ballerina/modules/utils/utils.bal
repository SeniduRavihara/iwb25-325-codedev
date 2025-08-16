// Utility functions and constants

// HTTP status codes
public const int HTTP_OK = 200;
public const int HTTP_CREATED = 201;
public const int HTTP_BAD_REQUEST = 400;
public const int HTTP_UNAUTHORIZED = 401;
public const int HTTP_NOT_FOUND = 404;
public const int HTTP_CONFLICT = 409;
public const int HTTP_INTERNAL_SERVER_ERROR = 500;

// Validation constants
public const int MIN_USERNAME_LENGTH = 3;
public const int MIN_PASSWORD_LENGTH = 6;

// JWT constants
public const int TOKEN_EXPIRY_HOURS = 1;

// Helper functions can be added here as needed
public function isValidEmail(string email) returns boolean {
    // Simple email validation - can be enhanced
    return email.includes("@") && email.includes(".");
}