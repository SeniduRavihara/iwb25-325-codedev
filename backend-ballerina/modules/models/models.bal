// models.bal

// User data models
public type User record {|
    int id;
    string username;
    string email;
    string password_hash;
    boolean is_admin;
    string role;
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
    boolean is_admin;
    string role;
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
    boolean is_admin;
    string role;
|};

// Challenge models
public type Challenge record {|
    int id;
    string title;
    string description;
    string difficulty; // "Easy", "Medium", "Hard"
    string tags; // JSON array of tags
    int time_limit; // in minutes
    int memory_limit; // in MB
    int author_id;
    int submissions_count;
    decimal success_rate;
    string created_at;
    string updated_at;
|};

public type ChallengeCreate record {|
    string title;
    string description;
    string difficulty;
    string tags;
    int time_limit;
    int memory_limit;
|};

public type ChallengeUpdate record {|
    string title?;
    string description?;
    string difficulty?;
    string tags?;
    int time_limit?;
    int memory_limit?;
|};

// Test Case models
public type TestCase record {|
    int id;
    int challenge_id;
    string input_data;
    string expected_output;
    boolean is_hidden;
    int points;
    string created_at;
|};

public type TestCaseCreate record {|
    int challenge_id;
    string input_data;
    string expected_output;
    boolean is_hidden;
    int points;
|};

// Contest models
public type Contest record {|
    int id;
    string title;
    string description;
    string start_time;
    string end_time;
    int duration; // in minutes
    string status; // "upcoming", "active", "completed"
    int max_participants?;
    string prizes; // JSON array of prizes
    string rules;
    int created_by;
    string registration_deadline;
    int participants_count;
    string created_at;
    string updated_at;
|};

public type ContestCreate record {|
    string title;
    string description;
    string start_time;
    string end_time;
    int duration;
    int max_participants?;
    string prizes;
    string rules;
    string registration_deadline;
|};

public type ContestUpdate record {|
    string title?;
    string description?;
    string start_time?;
    string end_time?;
    int duration?;
    int max_participants?;
    string prizes?;
    string rules?;
    string registration_deadline?;
|};

// Contest Challenge relationship
public type ContestChallenge record {|
    int id;
    int contest_id;
    int challenge_id;
    int points;
    int order_index;
    string created_at;
|};

// Contest Participant models
public type ContestParticipant record {|
    int id;
    int contest_id;
    int user_id;
    int score;
    int rank;
    int submissions_count;
    string last_submission_time?;
    string registered_at;
|};

// Submission models
public type Submission record {|
    int id;
    int user_id;
    int challenge_id;
    int contest_id?;
    string code;
    string language;
    string status; // "pending", "running", "completed", "failed"
    string result; // "accepted", "wrong_answer", "time_limit_exceeded", "memory_limit_exceeded", "runtime_error", "compilation_error"
    int score;
    int execution_time?; // in milliseconds
    int memory_used?; // in KB
    string error_message?;
    int test_cases_passed;
    int total_test_cases;
    string submitted_at;
|};

public type SubmissionCreate record {|
    int challenge_id;
    int contest_id?;
    string code;
    string language;
|};

// API Response models
public type ApiResponse record {|
    boolean success;
    string message?;
    json data?;
|};

public type PaginatedResponse record {|
    json[] data;
    int total;
    int page;
    int page_limit;
    boolean has_next;
    boolean has_prev;
|};
