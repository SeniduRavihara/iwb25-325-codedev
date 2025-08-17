# HackathonPlus Backend

A robust Ballerina-based backend server for the HackathonPlus platform, featuring authentication, database management, and code execution capabilities.

## 🏗️ Architecture

The backend is built using **Ballerina** and follows a modular architecture with the following components:

- **Authentication Module** (`modules/auth/`) - JWT-based user authentication
- **Database Module** (`modules/database/`) - SQLite database operations
- **Migrations Module** (`modules/migrations/`) - Database schema management
- **Models Module** (`modules/models/`) - Data structures and types
- **Seeders Module** (`modules/seeders/`) - Initial data seeding
- **JWT Module** (`modules/jwt/`) - JWT token handling
- **Utils Module** (`modules/utils/`) - Utility functions

## 🚀 Getting Started

### Prerequisites

- Ballerina 2201.12.7 or later
- Docker (for code execution engine)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend-ballerina
   ```

2. **Install dependencies**

   ```bash
   bal build
   ```

3. **Run database migrations**

   ```bash
   bal run -- migrate
   ```

4. **Seed initial data**

   ```bash
   bal run -- seed
   ```

5. **Start the server**
   ```bash
   bal run
   ```

The server will start on port 8080 by default.

## 📊 Database Management

### Migration System

The backend uses a custom migration system that allows you to manage database schema changes in a version-controlled manner.

#### How Migrations Work

1. **Migration Registry**: All migrations are registered in `modules/migrations/migration_registry.bal`
2. **Individual Migration Files**: Each migration is a separate Ballerina function in `modules/migrations/`
3. **Execution**: Migrations are executed in order based on their version number
4. **Tracking**: Executed migrations are recorded in the `migrations` table

#### Creating a New Migration

1. **Create the migration function** in `modules/migrations/`:

```ballerina
// modules/migrations/006_create_new_table.bal
import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

public function createNewTable(jdbc:Client dbClient) returns error? {
    io:println("Executing: 006_create_new_table");

    sql:ExecutionResult|error result = dbClient->execute(`
        CREATE TABLE IF NOT EXISTS new_table (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    if result is error {
        return error("Failed to create new_table: " + result.message());
    }

    io:println("✓ New table created successfully");
}
```

2. **Register the migration** in `modules/migrations/migration_registry.bal`:

```ballerina
// Add import at the top
import backend_ballerina.migrations.006_create_new_table;

// Add to MIGRATIONS array
public MigrationInfo[] MIGRATIONS = [
    // ... existing migrations
    {
        version: 6,
        name: "006_create_new_table",
        execute: createNewTable
    }
];
```

3. **Run the migration**:
   ```bash
   bal run -- migrate
   ```

#### Migration Commands

- **Run all pending migrations**: `bal run -- migrate`
- **Rollback last migration**: `bal run -- migrate:rollback`
- **Fresh database**: `bal run -- db:fresh` (drops all tables and re-runs migrations + seeders)

### Database Schema

The current schema includes:

- **users** - User accounts and authentication
- **roles** - User roles (admin, user)
- **user_roles** - Many-to-many relationship between users and roles
- **settings** - Application settings
- **logs** - System logs
- **migrations** - Migration tracking

## 🔐 Authentication System

### Features

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- Token expiration handling

### API Endpoints

#### Registration

```http
POST /register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

#### Login

```http
POST /login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password"
}
```

#### Get Profile (Protected)

```http
GET /profile
Authorization: Bearer <jwt_token>
```

### User Roles

- **user** - Regular user with basic access
- **admin** - Administrator with full access

## 🐳 Code Execution Engine

The backend integrates with a Docker-based code execution engine that supports:

- **Python 3** - Python code execution
- **Java 17** - Java code compilation and execution
- **Ballerina 2201.12.7** - Ballerina code execution

### Docker Setup

1. **Build the execution engine**:

   ```bash
   cd code-execution-engine-docker
   docker build -t multi-lang-runner:latest .
   ```

2. **Test the execution engine**:

   ```bash
   # Python
   docker run --rm -e CODE_TO_EXECUTE_B64="$(echo 'print("Hello Python")' | base64)" multi-lang-runner:latest python

   # Java
   docker run --rm -e CODE_TO_EXECUTE_B64="$(echo 'public class Main { public static void main(String[] args) { System.out.println("Hello Java"); } }' | base64)" multi-lang-runner:latest java

   # Ballerina
   docker run --rm -e CODE_TO_EXECUTE_B64="$(echo 'import ballerina/io; public function main() { io:println("Hello Ballerina"); }' | base64)" multi-lang-runner:latest ballerina
   ```

### Security Features

- **Resource limits**: Memory (256MB), CPU (1 core), PIDs (50)
- **Network isolation**: Containers run with `--network=none`
- **Timeout protection**: 25-second execution timeout
- **Non-root user**: Container runs as user `runner` (UID 10001)

## 📁 Project Structure

```
backend-ballerina/
├── main.bal                    # Main server entry point
├── Ballerina.toml             # Ballerina project configuration
├── Dependencies.toml          # External dependencies
├── modules/
│   ├── auth/                  # Authentication module
│   │   └── auth.bal
│   ├── database/              # Database operations
│   │   └── database.bal
│   ├── migrations/            # Database migrations
│   │   ├── migrations.bal     # Migration manager
│   │   ├── migration_registry.bal  # Migration registry
│   │   ├── 001_create_users_table.bal
│   │   ├── 002_create_roles_table.bal
│   │   ├── 003_create_user_roles_table.bal
│   │   ├── 004_create_settings_table.bal
│   │   └── 005_create_logs_table.bal
│   ├── models/                # Data models
│   │   └── models.bal
│   ├── seeders/               # Database seeding
│   │   └── seeders.bal
│   ├── jwt/                   # JWT handling
│   │   └── jwt.bal
│   └── utils/                 # Utility functions
│       └── utils.bal
├── resources/
│   ├── migrations/            # SQL migration files (legacy)
│   └── seeds/                 # Seed data files
└── target/                    # Build artifacts
```

## 🔧 Configuration

### Environment Variables

- `serverPort` - Server port (default: 8080)
- `dbPath` - SQLite database path (default: `auth.db`)

### CORS Configuration

The server is configured to accept requests from:

- `http://localhost:3000` (Frontend)
- `http://localhost:3001` (Alternative frontend port)

## 🧪 Testing

### Manual Testing

1. **Health Check**:

   ```bash
   curl http://localhost:8080/health
   ```

2. **User Registration**:

   ```bash
   curl -X POST http://localhost:8080/register \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@example.com","password":"password123"}'
   ```

3. **User Login**:
   ```bash
   curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"password123"}'
   ```

## 🚨 Error Handling

The backend implements comprehensive error handling:

- **HTTP Status Codes**: Proper status codes for different scenarios
- **Error Messages**: Descriptive error messages
- **Validation**: Input validation for all endpoints
- **Logging**: Error logging for debugging

## 🔒 Security Considerations

- **Password Hashing**: Passwords are hashed using secure algorithms
- **JWT Tokens**: Secure token generation and validation
- **SQL Injection Prevention**: Parameterized queries throughout
- **CORS Protection**: Proper CORS configuration
- **Input Validation**: All inputs are validated and sanitized

## 📈 Performance

- **Connection Pooling**: Efficient database connection management
- **Caching**: JWT token caching for performance
- **Resource Management**: Proper resource cleanup

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Add proper error handling for new features
3. Update this README for any new features
4. Test thoroughly before submitting changes

## 📝 License

This project is part of the HackathonPlus platform.

---

For more information about the frontend integration, see the `frontend-next/` directory.
