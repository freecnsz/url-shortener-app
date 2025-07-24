# 🔗 URL Shortener Server

This project is the backend part of a URL shortening service developed according to Clean Architecture principles.

## 🌲 Project Structure

```
🏠 url-shortener-app/server/
├── 📦 package.json
├── ⚙️ tsconfig.json
├── 🗄️ prisma/                          # Database schema and migrations
│   └── 📄 schema.prisma
└── 📁 src/                             # Source code directory
    ├── 🚀 app.ts
    ├── 🎯 application/                  # Application layer (use cases, DTOs)
    │   ├── 📊 dtos/                    # Data Transfer Objects
    │   │   ├── 🔐 auth/                # Authentication DTOs
    │   │   │   └── 📋 CreateUserDto.ts
    │   │   └── 📤 responses/           # Response DTOs (empty for now)
    │   └── 🎪 usecases/                # Business logic use cases
    │       └── 👤 user/                # User-related use cases
    │           └── 🛠️ CreateUserUseCase.ts
    ├── ⚙️ config/                       # Configuration files
    │   └── 🖥️ server.ts
    ├── 💉 di/                          # Dependency Injection container
    │   └── 📦 Container.ts
    ├── 🏛️ domain/                       # Domain layer (business entities)
    │   ├── 🏗️ entities/                # Domain entities
    │   │   ├── 📊 ClickLog.ts
    │   │   ├── 📁 Collection.ts
    │   │   ├── 🔄 RefreshToken.ts
    │   │   ├── 🔗 Url.ts
    │   │   ├── 👤 User.ts
    │   │   └── 🌐 CustomDomain.ts
    │   ├── 🎭 enums/                   # Enumeration types
    │   │   ├── 🔐 AuthProvider.ts
    │   │   ├── 🌐 BrowserType.ts
    │   │   ├── 📱 DeviceType.ts
    │   │   └── 💻 OSType.ts
    │   ├── ❌ errors/                   # Custom error classes
    │   │   ├── 🚨 AppError.ts
    │   │   ├── 📝 index.ts
    │   │   ├── 🔍 NotFoundError.ts
    │   │   ├── 👤 UserAlreadyExistsError.ts
    │   │   ├── 🏷️ UsernameAlreadyExistsError.ts
    │   │   └── ✅ ValidationError.ts
    │   ├── 🔌 interfaces/               # Abstractions and contracts
    │   │   ├── 🛠️ helpers/             # Helper interfaces
    │   │   │   ├── 🔒 IPasswordHasher.ts
    │   │   │   └── 🎫 JwtHelper.ts
    │   │   └── 🗄️ repositories/        # Repository interfaces
    │   │       └── 👤 IUserRepository.ts
    │   └── 📤 responses/               # Response models
    │       ├── 📊 ApiResponse.ts
    │       └── ✅ Result.ts
    ├── 🏗️ infrastructure/              # Infrastructure layer (external concerns)
    │   ├── 🗺️ mappers/                 # Data mapping between layers
    │   │   └── 👤 UserMapper.ts
    │   ├── 🗄️ repositories/            # Data access implementations
    │   │   └── 🐘 PrismaUserRepository.ts
    │   └── ✅ validators/              # Input validation schemas
    │       └── 📋 CreateUserSchema.ts
    ├── 🎭 presentation/                # Presentation layer (HTTP/API)
    │   ├── 🎮 controllers/             # HTTP request handlers
    │   │   └── 🔐 AuthController.ts
    │   ├── ⚡ middleware/              # HTTP middleware
    │   │   ├── 🔄 asyncHandler.ts
    │   │   ├── ❌ errorHandler.ts
    │   │   └── 📝 index.ts
    │   └── 🛣️ routes/                  # HTTP route definitions
    │       ├── 🔐 auth.routes.ts
    │       └── 📝 index.ts
    └── 🛠️ utils/                       # Utility functions
        ├── 🔒 bcryptHasher.ts
        └── 📤 responseHelper.ts
```

## 🏛️ Clean Architecture Layers

### 🎯 Application Layer
- **DTOs**: Data Transfer Objects for external communication
- **Use Cases**: Business logic implementation and orchestration

### 🏛️ Domain Layer
- **Entities**: Core business objects containing domain logic
- **Enums**: Constant values and types
- **Errors**: Custom exception classes for domain-specific errors
- **Interfaces**: Abstractions and contracts for external dependencies
- **Responses**: Response models for operations

### 🏗️ Infrastructure Layer
- **Mappers**: Data transformation between domain and persistence layers
- **Repositories**: Data access implementations using external frameworks
- **Validators**: Input validation using external validation libraries

### 🎭 Presentation Layer
- **Controllers**: HTTP request handlers and response formatting
- **Middleware**: Cross-cutting concerns like authentication, logging, error handling
- **Routes**: URL routing and endpoint definitions

## 🔗 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                    👤 USER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🆔 id: string (PK)                                                           │
│ 🏷️ username: string | null                                                   │
│ 📧 email: string                                                             │
│ 🔒 passwordHash?: string                                                      │
│ 🔐 provider: AuthProvider                                                     │
│ 🆔 providerId?: string                                                        │
│ 👤 firstName?: string                                                         │
│ 👤 lastName?: string                                                          │
│ 🖼️ profilePictureUrl?: string                                                │
│ 📝 bio?: string                                                              │
│ ✅ isEmailVerified: boolean                                                   │
│ 🎫 emailVerificationToken?: string                                            │
│ ⏰ emailVerificationExpiresAt?: Date                                           │
│ ✅ isActive: boolean                                                          │
│ 🕒 lastLoginAt?: Date                                                         │
│ 🔄 passwordResetToken?: string                                                │
│ ⏰ passwordResetExpiresAt?: Date                                               │
│ 📅 createdAt: Date                                                           │
│ 📅 updatedAt: Date                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
            │                    │                    │                    │
            │1                   │1                   │1                   │1
            │                    │                    │                    │
            │*                   │*                   │*                   │*
┌───────────────────┐  ┌─────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│   📁 COLLECTION   │  │      🔗 URL         │  │   🔄 REFRESH_TOKEN  │  │  🌐 CUSTOM_DOMAIN  │
├───────────────────┤  ├─────────────────────┤  ├────────────────────┤  ├────────────────────┤
│ 🆔 id: string     │  │ 🆔 id: string       │  │ 🆔 id: string      │  │ 🆔 id: string      │
│ 👤 userId: string │  │ 👤 userId: string|nu│  │ 👤 userId: string  │  │ 👤 userId: string  │
│ 🏷️ name: string   │  │ 🔗 originalUrl: str │  │ 🎫 token: string   │  │ 🌐 domain: string  │
│ 📝 description?   │  │ 🔗 shortCode: str   │  │ ⏰ expiresAt: Date │  │ 📅 createdAt: Date │
│ 🌍 isPublic: bool │  │ 🏷️ customAlias?    │  │ 📅 createdAt: Date │  │ 📅 updatedAt: Date │
│ 📅 createdAt      │  │ 🌐 customDomainId? │  │ 🕒 lastUsedAt?     │  └────────────────────┘
│ 📅 updatedAt      │  │ 📁 collectionId?   │  │ 🚫 revokedAt?      │
└───────────────────┘  │ 🏷️ name?           │  │ 🔄 replacedBy?     │
            │          │ 📝 description?    │  │ 🌐 ipAddress?      │
            │1         │ 🔢 clickCount: int │  │ 🖥️ userAgent?      │
            │          │ 🕒 lastClickedAt?  │  │ 📱 deviceInfo?     │
            │*         │ ⏰ expiresAt?      │  │ 🔐 deviceFingerpr? │
            └──────────┤ 🔢 maxClicks?      │  │ ✅ isActive: bool  │
                       │ ✅ isActive: bool  │  │ 🔢 usageCount: int │
                       │ 🔒 isPasswordPro?  │  └────────────────────┘
                       │ 🔒 passwordHash?   │
                       │ 📅 createdAt       │           │1
                       │ 📅 updatedAt       │           │
                       └─────────────────────┘           │
                                  │                     │*
                                  │1              ┌────────────────────┐
                                  │               │   📊 CLICK_LOG     │
                                  │*              ├────────────────────┤
                                  └───────────────┤ 🆔 id: number      │
                                                  │ 🔗 urlId: string   │
                                                  │ 🕒 clickedAt: Date │
                                                  │ 🌐 ipAddress?      │
                                                  │ 🖥️ userAgent?      │
                                                  │ 🔗 referrer?       │
                                                  │ 🌍 country?        │
                                                  │ 🏙️ city?           │
                                                  │ 📱 device: DeviceT │
                                                  │ 🌐 browser: Browse │
                                                  │ 💻 os: OSType      │
                                                  └────────────────────┘
```

## 📊 Entity Relationships

### 🔗 One-to-Many Relationships:
- **👤 User** → **📁 Collection** (1:N) - A user can have multiple collections
- **👤 User** → **🔗 Url** (1:N) - A user can create multiple shortened URLs  
- **👤 User** → **🔄 RefreshToken** (1:N) - A user can have multiple active refresh tokens
- **👤 User** → **🌐 CustomDomain** (1:N) - A user can own multiple custom domains
- **📁 Collection** → **🔗 Url** (1:N) - A collection can contain multiple URLs
- **🔗 Url** → **📊 ClickLog** (1:N) - A URL can have multiple click tracking records
- **🌐 CustomDomain** → **🔗 Url** (1:N) - A custom domain can be used by multiple URLs

### 🔑 Foreign Keys:
- `Collection.userId` → `User.id`
- `Url.userId` → `User.id` 
- `Url.collectionId` → `Collection.id`
- `Url.customDomainId` → `CustomDomain.id`
- `RefreshToken.userId` → `User.id`
- `ClickLog.urlId` → `Url.id`
- `CustomDomain.userId` → `User.id`

## 🚀 Features

- ✅ Clean Architecture for maintainable and testable code
- 🔐 JWT-based authentication and authorization
- 📊 Comprehensive click tracking and analytics
- 🔗 Custom domain support for branded short links
- 📁 URL collections for better organization
- 🔒 Password-protected URLs for security
- ⏰ URL expiration support with automatic cleanup
- 📱 Device/Browser/OS tracking for detailed analytics
- 🌍 Geolocation tracking for geographic insights

## 🛠️ Technologies

- **TypeScript** - Type-safe development and better developer experience
- **Prisma** - Type-safe database ORM with excellent TypeScript integration
- **Express.js** - Fast and minimalist web framework for Node.js
- **JWT** - Secure authentication with JSON Web Tokens
- **Bcrypt** - Password hashing for secure user authentication
- **Dependency Injection** - Loose coupling and better testability

## 📝 License

This project is licensed under the MIT License.
