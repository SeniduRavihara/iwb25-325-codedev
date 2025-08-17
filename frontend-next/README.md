# CodeArena Frontend

A modern Next.js frontend for the CodeArena competitive programming platform, featuring real-time code execution, test case validation, and comprehensive contest management.

## 🚀 Features

### Code Editor & Execution

- **Monaco Editor**: Advanced code editor with syntax highlighting
- **Multi-language Support**: Python, Java, and Ballerina
- **Real-time Execution**: Execute code against test cases instantly
- **Test Case Validation**: Automatic comparison of expected vs actual outputs
- **Performance Analysis**: Time complexity, space complexity, and execution metrics
- **Error Handling**: Comprehensive error reporting and debugging

### Contest Management

- **Contest Creation**: Create and manage programming contests
- **Challenge Management**: Add challenges with test cases
- **Real-time Participation**: Join contests and submit solutions
- **Leaderboards**: Track participant performance
- **Timer Integration**: Contest time management

### User Interface

- **Modern Design**: Built with Tailwind CSS and shadcn/ui
- **Responsive Layout**: Mobile-friendly interface
- **Dark Theme**: Optimized for coding environments
- **Role-based Access**: Different interfaces for admin and users
- **Navigation**: Intuitive routing and navigation

### Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **Global State**: React Context for auth management
- **Local Storage**: Persistent session management

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Code Editor**: Monaco Editor
- **State Management**: React Context
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **HTTP Client**: Fetch API with custom service layer

## 📁 Project Structure

```
frontend-next/
├── src/
│   ├── app/                    # App router pages
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── login/         # Login page
│   │   │   └── signup/        # Signup page
│   │   ├── (private)/         # Protected pages
│   │   │   ├── challenges/    # Challenge management
│   │   │   │   ├── [id]/      # Individual challenge
│   │   │   │   └── add/       # Add new challenge
│   │   │   ├── contests/      # Contest management
│   │   │   │   ├── [id]/      # Individual contest
│   │   │   │   ├── create/    # Create contest
│   │   │   │   └── participate/ # Contest participation
│   │   │   └── leaderboard/   # Leaderboards
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── analytics/     # Analytics and reports
│   │   │   ├── challenges/    # Challenge management
│   │   │   └── contests/      # Contest management
│   │   └── api/               # API routes
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── code-editor.tsx   # Code editor component
│   │   ├── navigation.tsx    # Navigation component
│   │   └── ...               # Other components
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.tsx   # Authentication context
│   │   └── DataContext.tsx   # Data management context
│   ├── lib/                  # Utility functions
│   │   ├── api.ts           # API service layer
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── utils.ts         # General utilities
│   │   └── mock-data.ts     # Mock data for development
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   └── constants/           # Application constants
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:8080`
- Docker (for code execution)

### Installation

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

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=CodeArena
```

## 🧪 Testing Code Execution

### Sample Code Examples

#### Python

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

#### Java

```java
public class Main {
    public static void main(String[] args) {
        int n = 10;
        System.out.println(fibonacci(n));
    }

    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }
}
```

#### Ballerina

```ballerina
import ballerina/io;

public function main() {
    int n = 10;
    io:println(fibonacci(n));
}

function fibonacci(int n) returns int {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n-1) + fibonacci(n-2);
}
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🎨 UI Components

### Code Editor

The main code editor component (`src/components/code-editor.tsx`) provides:

- Syntax highlighting for Python, Java, and Ballerina
- Real-time code execution
- Test case validation
- Performance analysis
- Error reporting

### Navigation

The navigation component (`src/components/navigation.tsx`) includes:

- User authentication status
- Role-based menu items
- Responsive design
- Dark theme support

### UI Components

Built with shadcn/ui components:

- Buttons, cards, and form elements
- Modals and dialogs
- Tables and data displays
- Progress indicators and badges

## 🔐 Authentication

### Login Flow

1. User enters credentials
2. Frontend sends request to backend
3. Backend validates and returns JWT token
4. Frontend stores token in localStorage
5. User is redirected to dashboard

### Protected Routes

- All routes under `(private)` are protected
- Authentication context checks token validity
- Unauthorized users are redirected to login

### Role-based Access

- **Admin**: Access to admin dashboard, user management
- **User**: Access to contests, challenges, leaderboards

## 📡 API Integration

### API Service Layer

The API service (`src/lib/api.ts`) provides:

- Centralized API calls
- Error handling
- Request/response interceptors
- Type-safe API responses

### Code Execution API

```typescript
// Execute code
const response = await apiService.executeCode({
  code: "print('Hello, World!')",
  language: "python",
});

// Get supported languages
const languages = await apiService.getSupportedLanguages();

// Check service health
const health = await apiService.getCodeExecutionHealth();
```

## 🎯 Key Features

### Real-time Code Execution

- Execute code against test cases
- Instant feedback on correctness
- Performance metrics and analysis
- Error handling and debugging

### Test Case Management

- Create challenges with multiple test cases
- Hidden and visible test cases
- Automatic validation and scoring
- Detailed result comparison

### Contest System

- Create time-limited contests
- Multiple challenges per contest
- Real-time leaderboards
- Participant management

### Admin Dashboard

- User management
- Contest and challenge creation
- Analytics and reporting
- System monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**

   - Ensure backend is running on port 8080
   - Check network connectivity
   - Verify API endpoints

2. **Code Execution Fails**

   - Ensure Docker is running
   - Check Docker image is built
   - Verify code execution engine setup

3. **Authentication Issues**
   - Clear localStorage
   - Check JWT token expiration
   - Verify backend authentication

### Debug Commands

```bash
# Check frontend logs
npm run dev

# Check TypeScript errors
npm run type-check

# Check linting errors
npm run lint

# Test API connectivity
curl http://localhost:8080/health
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines

- Use TypeScript for all new code
- Follow Next.js best practices
- Use shadcn/ui components
- Write comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the framework
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

---

**Built with ❤️ for competitive programming enthusiasts**
