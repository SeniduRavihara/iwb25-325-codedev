// models.bal

// User data models
public type User record {|
    int id;
    string username;
    string email;
    string password_hash;
    string created_at;
|};

public type UserRegistration record {|
    string username;
    string email;
    string password;
|};

public type UserLogin record {|
    string username;
    string password;
|};

public type AuthResponse record {|
    string token?;
    string username;
    string email;
    string message;
|};

public type ErrorResponse record {|
    string message;
    int code;
|};

// JWT Payload structure
public type JwtPayload record {|
    string iss;
    string sub;
    string[] aud;
    int exp;
    int iat;
    int user_id?;
    string email?;
|};