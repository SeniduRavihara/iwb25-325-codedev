# CodeArena - Coding Platform

A modern coding platform built with Next.js frontend and Ballerina backend, featuring authentication, role-based access control, and contest management.

## Features

### Frontend (Next.js)

- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Authentication**: Login/signup with JWT token storage
- **Role-based Access Control**: Admin and user roles with different permissions
- **Global State Management**: React Context for auth and data management
- **Responsive Design**: Mobile-friendly interface

### Backend (Ballerina)

- **RESTful API**: Clean API endpoints for authentication and data management
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **SQLite Database**: Lightweight database with migrations and seeding
- **Role-based Access Control**: Admin and user role management
- **Password Hashing**: Secure password storage using SHA-256

## Project Structure

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
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React Context providers
│   │   └── lib/               # Utility functions and API
│   └── package.json
└── docker-compose.yml         # Docker configuration
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Ballerina 2201.8.0+
- Docker (optional)

### Backend Setup

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

### Frontend Setup

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

## API Endpoints

### Authentication

- `POST /login` - User login
- `POST /register` - User registration
- `GET /profile` - Get user profile (requires JWT)

### Health Check

- `GET /health` - Server health check

## Database Commands

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

## Demo Credentials

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

## Features Implemented

### ✅ Completed

- [x] User authentication (login/register)
- [x] JWT token management with 7-day expiration
- [x] Role-based access control (admin/user)
- [x] Global authentication context
- [x] Local storage for JWT tokens
- [x] Database migrations and seeding
- [x] Responsive login/signup pages
- [x] API service layer
- [x] Error handling and validation
- [x] Modern UI with proper borders and styling

### 🔄 In Progress

- [ ] Contest management
- [ ] Challenge creation and management
- [ ] User profile management
- [ ] Admin dashboard
- [ ] Real-time features

### 📋 Planned

- [ ] Code execution engine integration
- [ ] Leaderboards
- [ ] Social features
- [ ] Advanced analytics
- [ ] Email notifications

## Technology Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **Icons**: Lucide React
- **TypeScript**: Full type safety

### Backend

- **Language**: Ballerina
- **Database**: SQLite
- **Authentication**: JWT
- **Password Hashing**: SHA-256
- **API**: RESTful HTTP

## Development

### Adding New Features

1. Create database migration if needed
2. Update models in `backend-ballerina/modules/models/`
3. Add API endpoints in `main.bal`
4. Update frontend API service in `frontend-next/src/lib/api.ts`
5. Create UI components in `frontend-next/src/components/`
6. Update contexts if needed

### Code Style

- Use TypeScript for frontend
- Follow Ballerina coding conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
