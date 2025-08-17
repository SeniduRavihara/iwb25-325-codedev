# CodeArena - Advanced Coding Platform

A modern competitive programming platform built with Next.js frontend and Ballerina backend, featuring real-time code execution, test case validation, and comprehensive contest management.

## 🚀 Features

### Frontend (Next.js)

- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Authentication**: Login/signup with JWT token storage
- **Role-based Access Control**: Admin and user roles with different permissions
- **Code Editor**: Monaco Editor with syntax highlighting for Python, Java, and Ballerina
- **Real-time Code Execution**: Execute code against test cases with instant feedback
- **Test Case Validation**: Automatic comparison of expected vs actual outputs
- **Performance Analysis**: Time complexity, space complexity, and execution metrics
- **Global State Management**: React Context for auth and data management
- **Responsive Design**: Mobile-friendly interface

### Backend (Ballerina)

- **RESTful API**: Clean API endpoints for authentication and data management
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **SQLite Database**: Lightweight database with migrations and seeding
- **Role-based Access Control**: Admin and user role management
- **Password Hashing**: Secure password storage using SHA-256
- **Code Execution Engine**: Docker-based secure code execution
- **Multi-language Support**: Python, Java, and Ballerina execution
- **Performance Monitoring**: Execution time, memory usage, and complexity analysis

### Code Execution Engine

- **Secure Containerization**: Docker-based isolated execution environment
- **Multi-language Support**: Python 3, Java 17, Ballerina 2201.12.7
- **Resource Limits**: Memory (256MB), CPU (1.0 cores), Process (50)
- **Network Isolation**: No external network access for security
- **Real-time Feedback**: Instant execution results and error reporting

## 🏗️ Project Structure

```
HACKATHON_PLUS_BALLERINA/
├── backend-ballerina/          # Ballerina backend
│   ├── modules/
│   │   ├── auth/              # Authentication logic
│   │   ├── database/          # Database operations
│   │   ├── jwt/               # JWT token management
│   │   ├── migrations/        # Database migrations
│   │   ├── models/            # Data models
│   │   └── seeders/           # Database seeding
│   └── main.bal               # Main server file
├── frontend-next/             # Next.js frontend
│   ├── src/
│   │   ├── app/               # App router pages
│   │   │   ├── (auth)/        # Authentication pages
│   │   │   ├── (private)/     # Protected pages
│   │   │   │   ├── challenges/ # Challenge management
│   │   │   │   ├── contests/  # Contest management
│   │   │   │   └── leaderboard/ # Leaderboards
│   │   │   └── admin/         # Admin dashboard
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React Context providers
│   │   └── lib/               # Utility functions and API
│   └── package.json
├── code-execution-engine-docker/ # Docker code execution engine
│   ├── Dockerfile             # Multi-language container
│   ├── run-code.sh            # Execution script
│   └── README.md              # Engine documentation
└── docker-compose.yml         # Docker configuration
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Ballerina 2201.12.7+
- Docker (required for code execution)
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HACKATHON_PLUS_BALLERINA
```

### 2. Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend-ballerina
   ```

2. **Install dependencies:**

   ```bash
   bal build
   ```

3. **Run database migrations:**

   ```bash
   bal run -- migrate
   ```

4. **Seed the database:**

   ```bash
   bal run -- seed
   ```

5. **Start the server:**
   ```bash
   bal run
   ```

The backend will start on `http://localhost:8080`

### 3. Code Execution Engine Setup

1. **Navigate to code execution directory:**

   ```bash
   cd code-execution-engine-docker
   ```

2. **Build the Docker image:**

   ```bash
   docker build -t multi-lang-runner:latest .
   ```

3. **Verify the build:**
   ```bash
   docker images | grep multi-lang-runner
   ```

### 4. Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend-next
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:3000`

## 🧪 Testing the Code Execution

### Sample Test Cases

#### Python Example

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorderTraversal(root):
    result = []
    def inorder(node):
        if node:
            inorder(node.left)
            result.append(node.val)
            inorder(node.right)
    inorder(root)
    return result

# Test case
root = TreeNode(1, None, TreeNode(2, TreeNode(3)))
result = inorderTraversal(root)
print(result)
```

#### Java Example

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        for (int i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }
    }
}
```

#### Ballerina Example

```ballerina
import ballerina/io;

public function main() {
    io:println("Hello from Ballerina!");
    foreach int i in 0..<5 {
        io:println(string`Count: ${i}`);
    }
}
```

## 📡 API Endpoints

### Authentication

- `POST /login` - User login
- `POST /register` - User registration
- `GET /profile` - Get user profile (requires JWT)

### Code Execution

- `POST /api/submit` - Execute code
- `GET /api/health` - Code execution service health
- `GET /api/languages` - Get supported languages

### Health Check

- `GET /health` - Server health check

## 🗄️ Database Commands

### Backend Commands

```bash
# Run migrations
bal run -- migrate

# Rollback last migration
bal run -- migrate:rollback

# Seed database
bal run -- seed

# Fresh database (clear + seed)
bal run -- db:fresh
```

## 👥 Demo Credentials

### Admin User

- Username: `admin`
- Password: `password`
- Email: `admin@codearena.com`

### Regular Users

- Username: `john`
- Password: `password`
- Email: `john@example.com`

- Username: `jane`
- Password: `password`
- Email: `jane@example.com`

## ✅ Features Implemented

### Authentication & Authorization

- [x] User authentication (login/register)
- [x] JWT token management with 7-day expiration
- [x] Role-based access control (admin/user)
- [x] Global authentication context
- [x] Local storage for JWT tokens

### Database & Backend

- [x] Database migrations and seeding
- [x] SQLite database with proper schema
- [x] RESTful API endpoints
- [x] Error handling and validation

### Frontend & UI

- [x] Responsive login/signup pages
- [x] Modern UI with Tailwind CSS and shadcn/ui
- [x] API service layer
- [x] Protected routes and navigation

### Code Execution Engine

- [x] Multi-language Docker container (Python, Java, Ballerina)
- [x] Secure code execution with resource limits
- [x] Real-time code execution API
- [x] Performance monitoring and analysis
- [x] Test case validation and comparison
- [x] Code complexity analysis

### Contest Management

- [x] Contest creation and management
- [x] Challenge management with test cases
- [x] Real-time code execution in contests
- [x] Test case validation and scoring
- [x] Leaderboard functionality

### Admin Features

- [x] Admin dashboard
- [x] User management
- [x] Contest and challenge management
- [x] Analytics and monitoring

## 🔄 In Progress

- [ ] Real-time collaboration features
- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] Social features and user profiles
- [ ] Advanced contest features (teams, time limits)

## 📋 Planned Features

- [ ] Code plagiarism detection
- [ ] Advanced code analysis tools
- [ ] Integration with external APIs
- [ ] Mobile app development
- [ ] Advanced security features

## 🛡️ Security Features

### Code Execution Security

- **Container Isolation**: Each execution runs in isolated Docker containers
- **Resource Limits**: Memory (256MB), CPU (1.0 cores), Process (50)
- **Network Isolation**: No external network access
- **Time Limits**: 30-second execution timeout
- **Read-only Filesystem**: Prevents file system attacks
- **Non-root User**: Code runs as unprivileged user

### Application Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: SHA-256 password hashing
- **CORS Protection**: Configured CORS policies
- **Input Validation**: Comprehensive input validation
- **SQL Injection Protection**: Parameterized queries

## 🚀 Performance Features

### Code Analysis

- **Time Complexity**: Automatic detection of algorithm complexity
- **Space Complexity**: Memory usage analysis
- **Pattern Detection**: Identifies common coding patterns
- **Performance Metrics**: Execution time and resource usage

### System Performance

- **Docker Optimization**: Efficient container management
- **Database Optimization**: Indexed queries and efficient schema
- **Frontend Optimization**: Code splitting and lazy loading
- **Caching**: Strategic caching for better performance

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor
- **TypeScript**: Full type safety

### Backend

- **Language**: Ballerina 2201.12.7
- **Database**: SQLite
- **Authentication**: JWT
- **Password Hashing**: SHA-256
- **API**: RESTful HTTP
- **Code Execution**: Docker containers

### Infrastructure

- **Containerization**: Docker
- **Code Execution**: Multi-language Docker containers
- **Security**: Container isolation and resource limits
- **Monitoring**: Performance metrics and analysis

## 🧪 Testing

### Manual Testing

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Login with demo credentials
4. Create or join a contest
5. Write and execute code
6. Verify test case results

### Code Execution Testing

```bash
# Test Python execution
curl -X POST http://localhost:8080/api/submit \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"Hello, World!\")", "language": "python"}'

# Test Java execution
curl -X POST http://localhost:8080/api/submit \
  -H "Content-Type: application/json" \
  -d '{"code": "public class Main { public static void main(String[] args) { System.out.println(\"Hello, World!\"); } }", "language": "java"}'

# Test Ballerina execution
curl -X POST http://localhost:8080/api/submit \
  -H "Content-Type: application/json" \
  -d '{"code": "import ballerina/io; public function main() { io:println(\"Hello, World!\"); }", "language": "ballerina"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **Docker not running**: Ensure Docker is installed and running
2. **Port conflicts**: Check if ports 3000 and 8080 are available
3. **Database errors**: Run `bal run -- db:fresh` to reset database
4. **Code execution fails**: Verify Docker image is built correctly

### Debug Commands

```bash
# Check Docker status
docker ps

# Check backend logs
cd backend-ballerina && bal run

# Check frontend logs
cd frontend-next && npm run dev

# Test code execution health
curl http://localhost:8080/api/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for frontend development
- Follow Ballerina coding conventions
- Write comprehensive tests
- Update documentation for new features
- Ensure security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the frontend framework
- [Ballerina](https://ballerina.io/) for the backend language
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing
- [Docker](https://www.docker.com/) for containerization

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in each component's README

---

**Built with ❤️ for competitive programming enthusiasts**
