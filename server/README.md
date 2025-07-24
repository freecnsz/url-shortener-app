# 🔗 URL Shortener Server

A powerful and scalable URL shortener backend built with Clean Architecture principles, featuring advanced analytics, custom domains, and high-performance Redis caching.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker** & **Docker Compose**
- **Git** (for cloning the repository)
- **Node.js** (v20 or higher) - only if running without Docker
- **PostgreSQL** (v15 or higher) - only if running without Docker
- **Redis** (v7 or higher) - only if running without Docker

## 🚀 Installation & Setup

### Method 1: Quick Start with Docker (Recommended)

This is the easiest way to get the application running with all dependencies.

#### Step 1: Clone the Repository
```bash
git clone https://github.com/freecnsz/url-shortener-app.git
cd url-shortener-app/server
```

#### Step 2: Environment Configuration
Create a `.env` file in the server directory with the following variables:

**Example .env configuration:**
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:admin@postgres:5432/linkhub"
POSTGRES_DB=linkhub # Database name
POSTGRES_USER=postgres # Database user
POSTGRES_PASSWORD=admin # Database password

# JWT Authentication Secrets
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET="your-refresh-token-secret-minimum-32-characters"
JWT_REFRESH_EXPIRES_IN=7d

# Short Code Generation
SHORT_CODE_SECRET="your-short-code-generation-secret-minimum-32-characters"
BASE_URL="http://localhost:3000" # Base URL for redirects

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# OAuth Integration
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com" # Google OAuth Client ID

# Application Settings
NODE_ENV=production # Environment (development or production)
PORT=3000
COMPOSE_PROJECT_NAME=linkhub # Docker Compose project name
```

#### Step 3: Build and Start Services

Make sure you have [Docker](https://www.docker.com/) and Docker Compose installed and working correctly. Then run the following command to build and start all services:

```bash
# Build and start all services (app, postgres, redis)
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

#### Step 4: Run Database Migrations
Migrations will be automatically applied when the application starts. If you need to run them manually, use:

```bash
# Run database migrations
docker-compose exec app npx prisma migrate deploy
# Generate Prisma client
docker-compose exec app npx prisma generate
# (Optional) Seed admin user
docker-compose exec app npm run seed:admin
```

#### Step 5: Verify Installation
The application will be available at:
- **API Server**: `http://localhost:3000`
- **Database**: `localhost:5432` (from host machine)
- **Redis**: `localhost:6379` (from host machine)


### Method 2: Local Development Setup

For development with hot reload and debugging capabilities.

#### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/freecnsz/url-shortener-app.git
cd url-shortener-app/server

# Install Node.js dependencies
npm install
```

#### Step 2: Setup Local Database
```bash
# Start only database services
docker-compose up -d postgres redis

# Or setup your own PostgreSQL and Redis instances
```

#### Step 3: Environment Configuration
Update your `.env` file for local development:
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/linkhub"
REDIS_HOST=localhost
NODE_ENV=development
# ... other variables
```

#### Step 4: Database Migration
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# View database (optional)
npx prisma studio
```

#### Step 5: Start Development Server
```bash
npm run dev
```

## Available Endpoints

### Authentication
- **POST** `/api/auth/register`: User registration with email and password
    request body:
    ```json
    {
      "email": "<user@example.com>",
      "password": "your-password",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    }
    ```
- **POST** `/api/auth/login`: User login with email and password
    request body:
    ```json
    {
      "email": "<user@example.com>",
      "password": "your-password"
    }
    ```
- **POST** `/api/auth/google`: Google OAuth login
    request body:
    ```json
    {
      "accessToken": "<google-id-token>"
    }
    ```
### URL Management
- **POST** `/api/urls`: Create a new shortened URL
    request body:
    ```json
    {
      "originalUrl": "https://example.com",
    }
    ```
- **GET** `/api/urls/:shortCode`: Retrieve original URL by short code

## 📁 Project Structure

```
server/
├── package.json                   # Dependencies and scripts
├── Dockerfile                     # Docker container configuration
├── docker-compose.yml             # Multi-service Docker setup
├── docker-entrypoint.sh           # Container startup script
├── tsconfig.json                  # TypeScript configuration
├── .env                           # Environment variables
├── prisma/                        # Database schema and migrations
│   ├── schema.prisma              # Database schema definition
│   └── migrations/                # Database migration files
├── src/                           # Source code
│   ├── app.ts                     # Application entry point
│   ├── application/               # Application layer (Clean Architecture)
│   │   ├── dtos/                  # Data Transfer Objects
│   │   │   ├── auth/              # Authentication DTOs
│   │   │   └── urls/              # URL-related DTOs
│   │   ├── mappers/               # Domain to DTO mappers
│   │   └── usecases/              # Business logic use cases
│   │       ├── auth/              # Authentication use cases
│   │       └── urls/              # URL management use cases
│   ├── config/                    # Configuration files
│   │   └── server.ts              # Express server setup
│   ├── di/                        # Dependency Injection container
│   │   └── Container.ts           # IoC container configuration
│   ├── domain/                    # Domain layer (Clean Architecture)
│   │   ├── entities/              # Business entities
│   │   ├── enums/                 # Enumeration types
│   │   ├── errors/                # Custom error classes
│   │   ├── interfaces/            # Abstractions and contracts
│   │   └── responses/             # Response models
│   ├── infrastructure/            # Infrastructure layer
│   │   ├── helpers/               # Infrastructure helpers
│   │   ├── mappers/               # Data persistence mappers
│   │   ├── queues/                # Background job queues
│   │   ├── redis/                 # Redis services and caching
│   │   ├── repositories/          # Data access implementations
│   │   └── validators/            # Input validation schemas
│   ├── presentation/              # Presentation layer
│   │   ├── controllers/           # HTTP request handlers
│   │   ├── middleware/            # HTTP middleware
│   │   └── routes/                # HTTP route definitions
│   └── utils/                     # Utility functions
└── logs/                          # Application logs (Docker volume)
```

## 🐳 Docker Services

### Core Services
- **app**: Main Node.js application server
- **postgres**: PostgreSQL database
- **redis**: Redis cache and queue storage

### Service Configuration
```yaml
# Application Server
app:
  port: 3000
  environment: production
  restart: unless-stopped

# PostgreSQL Database  
postgres:
  port: 5432
  database: linkhub
  volume: postgres_data

# Redis Cache
redis:
  port: 6379
  volume: redis_data
```

## 🛠️ Development Commands

### Available Scripts
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript for production
npm run start        # Start production server
npm run seed:admin   # Seed admin user to database
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Tokens**: Secure authentication with refresh tokens
- **Input Validation**: Comprehensive request validation with Zod
- **Rate Limiting**: Protection against abuse and DDoS
- **CORS Protection**: Configurable cross-origin requests
- **Helmet.js**: Security headers for Express applications
- **Environment Variables**: Secure configuration management

## 📈 Performance Optimizations

- **Redis Caching**: Fast URL lookups and session storage
- **Connection Pooling**: Efficient database connections
- **Background Jobs**: Asynchronous processing for analytics
- **Short Code Pool**: Pre-generated codes for instant creation
- **Database Indexing**: Optimized query performance
- **Docker Multi-stage Builds**: Optimized container images

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/freecnsz/url-shortener-app/issues) page
2. Create a new issue with detailed information
3. Include logs and environment details for faster resolution

## 🔄 Version History

- **v1.0.0** - Initial release with core URL shortening features
- Features: Authentication, Analytics, Custom Domains, Background Jobs
