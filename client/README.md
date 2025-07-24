# URL Shortener - Frontend (Angular)

This project is the Angular-based frontend for a URL shortening application. Built with modern Angular 20 framework, it allows users to shorten long URLs with a clean and intuitive interface.

## 🌐 Live Demo

**Try it now without any installation!** 

👉 **[Live Demo](https://linkhub-freecnsz.web.app/)** 👈


## 📋 Requirements

### For Local Development:
- Node.js (v18 or higher)
- npm (v8 or higher)
- Angular CLI (v20 or higher)

### For Docker Setup:
- Docker Desktop (for Windows/Mac)
- Docker Compose

## 🛠️ Installation

### Method 1: Docker Setup (Recommended)

Docker setup is the easiest and fastest method. No additional software installation required.

#### Step 1: Docker Desktop Installation

1. Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop

#### Step 2: Download the Project

```bash
# Clone with Git (if Git is installed)
git clone https://github.com/freecnsz/url-shortener-app.git
cd url-shortener-app/client

# Or download ZIP file and navigate to the folder
```

#### Step 3: Run with Docker

```bash
# Run with Docker Compose
docker-compose up --build

# To run in background:
docker-compose up -d --build
```

#### Step 4: Access the Application

Open this address in your browser: [http://localhost:8080](http://localhost:8080)

#### Docker Commands

```bash
# Stop the application
docker-compose down

# View logs
docker-compose logs

# Restart containers
docker-compose restart

# Remove containers (clean data)
docker-compose down -v --rmi all
```

### Method 2: Local Development Setup

#### Step 1: Node.js and npm Installation

1. Download and install [Node.js](https://nodejs.org/) (LTS version)
2. Open terminal and check versions:

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v8.0.0 or higher
```

#### Step 2: Angular CLI Installation

```bash
npm install -g @angular/cli@20
```

#### Step 3: Install Project Dependencies

```bash
# Navigate to project folder
cd url-shortener-app/client

# Install dependencies
npm install
```

#### Step 4: Start Development Server

```bash
npm start
# or
ng serve
```

The application will run at [http://localhost:4200](http://localhost:4200).

## 🏗️ Project Structure

```
src/
├── app/
│   ├── auth/                   # Authentication module
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── core/                   # Core services and models
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── models/             # TypeScript models
│   │   └── services/           # Core services
│   ├── features/
│   │   └── shortener/          # URL shortening feature
│   │       ├── components/     # Reusable components
│   │       ├── pages/          # Page components
│   │       └── services/       # URL services
│   ├── shared/                 # Shared components
│   │   ├── components/         # Common components
│   │   └── pipes/              # Custom pipes
│   ├── app.config.ts           # Application configuration
│   ├── app.routes.ts           # Routing configuration
│   └── app.ts                  # Main component
├── index.html                  # Main HTML file
├── main.ts                     # Application entry point
└── styles.scss                 # Global styles
```

## 🎨 Theme and Styling

The application uses SCSS and supports dark/light theme:

- **Theme Toggle**: Switch themes using the button in the top right corner
- **Responsive Design**: Compatible with all screen sizes
- **Modern UI**: Design following Material Design principles

## 🔧 Development Commands

```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm test

# Code quality check (if lint is available)
ng lint

# Build in watch mode
npm run watch
```

## 🐳 Docker Configuration

### Dockerfile Details

The project uses multi-stage Docker build:

1. **Build Stage**: Compiles the Angular application
2. **Production Stage**: Serves optimized files with Nginx

## 🌐 API Integration

The application communicates with backend API. For API endpoints:

```typescript
// src/app/core/services/api.ts
// API base URL and endpoints are defined here
```

## 🔧 Configuration

### Proxy Configuration

Proxy configuration for API requests:

```json
// proxy.conf.json
{
  "/api/*": {
    "target": "http://localhost:3000",
    "secure": true,
    "changeOrigin": true
  }
}
```

## 📞 Support

If you experience any issues:

1. Open an issue in the GitHub Issues section
2. Include log files
3. Describe the problem step by step

## 📄 License

This project is licensed under the MIT License.

---

**Quick Start**: After installing Docker Desktop, just run `docker-compose up --build` and visit [http://localhost:8080](http://localhost:8080)! 🎉
