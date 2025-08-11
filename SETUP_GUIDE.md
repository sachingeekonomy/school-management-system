# School Management System - Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Initial Setup](#initial-setup)
4. [Database Setup with Prisma](#database-setup-with-prisma)
5. [Docker Configuration](#docker-configuration)
6. [Environment Configuration](#environment-configuration)
7. [Development Workflow](#development-workflow)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher)
  ```bash
  # Check Node.js version
  node --version
  ```
- **npm** or **yarn** package manager
  ```bash
  # Check npm version
  npm --version
  ```
- **Docker** and **Docker Compose**
  ```bash
  # Check Docker version
  docker --version
  docker compose version
  ```
- **Git** (for version control)
  ```bash
  # Check Git version
  git --version
  ```

### Optional but Recommended
- **VS Code** with extensions:
  - Prisma Extension
  - Docker Extension
  - TypeScript Extension
  - ESLint Extension

## Project Overview

This is a comprehensive school management system built with:
- **Frontend**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **Containerization**: Docker & Docker Compose
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom components with modern design

## Initial Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd school-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Project Structure
The project should have the following key directories:
```
school-management-system/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configurations
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── docker-compose.yml       # Docker services
├── Dockerfile              # Application container
└── package.json            # Dependencies and scripts
```

## Database Setup with Prisma

### 1. Prisma Configuration
The project uses Prisma as the ORM. The schema is located in `prisma/schema.prisma`.

### 2. Database Models
The system includes the following main entities:
- **Users**: Students, Teachers, Parents, Admins
- **Academic**: Classes, Subjects, Lessons, Exams, Results
- **Administrative**: Attendance, Assignments, Announcements
- **Communication**: Messages, Events

### 3. Database Migrations
```bash
# Generate a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations to database
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### 4. Seed Data
```bash
# Run seed script to populate initial data
npx prisma db seed
```

## Docker Configuration

### 1. Docker Services
The `docker-compose.yml` file defines two main services:

#### Application Service (`app`)
```yaml
app:
  build: .
  ports:
    - "3000:3000"
  environment:
    - DATABASE_URL=${DATABASE_URL}
  depends_on:
    - postgres
```

#### Database Service (`postgres`)
```yaml
postgres:
  image: postgres:15
  environment:
    - POSTGRES_USER=${POSTGRES_USER}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    - POSTGRES_DB=${POSTGRES_DB}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  ports:
    - "5432:5432"
```

### 2. Dockerfile Configuration
The `Dockerfile` uses a multi-stage build:
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Configuration

### 1. Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=school_management

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Application Configuration
NODE_ENV=development
```

### 2. Environment File Setup
```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env
```

## Development Workflow

### 1. Local Development (Without Docker)
```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

### 2. Docker Development
```bash
# Build and start services
docker compose up -d

# View logs
docker compose logs -f app
docker compose logs -f postgres

# Stop services
docker compose down

# Rebuild after changes
docker compose up -d --build
```

### 3. Database Operations
```bash
# Access database shell
docker compose exec postgres psql -U postgres -d school_management

# Run Prisma commands in container
docker compose exec app npx prisma migrate dev
docker compose exec app npx prisma studio
```

### 4. Code Quality
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (if configured)
npm run test
```

## Production Deployment

### 1. Production Environment Variables
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
CLERK_SECRET_KEY=your_production_clerk_secret
```

### 2. Production Build
```bash
# Build production image
docker build -t school-management-system:latest .

# Run production container
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL=your_production_db_url \
  -e NODE_ENV=production \
  school-management-system:latest
```

### 3. Docker Compose Production
```bash
# Use production compose file
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Docker Build Failures
**Issue**: Build fails during `npm run build`
```bash
# Solution: Check for TypeScript/ESLint errors
npm run lint
npm run type-check

# Fix errors and rebuild
docker compose up -d --build
```

#### 2. Database Connection Issues
**Issue**: Application can't connect to database
```bash
# Check if database is running
docker compose ps

# Check database logs
docker compose logs postgres

# Restart database service
docker compose restart postgres
```

#### 3. Prisma Migration Issues
**Issue**: Migration conflicts or failures
```bash
# Reset database (development only)
npx prisma migrate reset

# Generate fresh migration
npx prisma migrate dev --name fresh_start
```

#### 4. Port Conflicts
**Issue**: Port 3000 or 5432 already in use
```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Kill process or change ports in docker-compose.yml
```

#### 5. Environment Variable Issues
**Issue**: Missing or incorrect environment variables
```bash
# Verify .env file exists
ls -la .env

# Check environment variables in container
docker compose exec app env | grep DATABASE_URL
```

### Debugging Commands

#### Container Management
```bash
# List running containers
docker compose ps

# View container logs
docker compose logs app
docker compose logs postgres

# Access container shell
docker compose exec app sh
docker compose exec postgres psql -U postgres

# Restart services
docker compose restart
```

#### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# View database in browser
npx prisma studio

# Export database
npx prisma db pull
```

#### Application Debugging
```bash
# Check Next.js build
npm run build

# Run development server with debugging
NODE_ENV=development npm run dev

# Check for TypeScript errors
npx tsc --noEmit
```

## Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Clerk Documentation](https://clerk.com/docs)

### Useful Commands Reference
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check

# Database
npx prisma migrate dev    # Create and apply migration
npx prisma studio        # Open database GUI
npx prisma generate      # Generate Prisma client
npx prisma db seed       # Run seed script

# Docker
docker compose up -d      # Start services
docker compose down       # Stop services
docker compose logs -f    # Follow logs
docker compose restart    # Restart services
```

### Project Structure Explanation
```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard layout group
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── forms/            # Form components
│   └── ...               # Other components
└── lib/                  # Utilities and configurations
    ├── prisma.ts         # Prisma client
    ├── actions.ts        # Server actions
    └── utils.ts          # Utility functions
```

This setup guide provides a comprehensive overview of how to set up and work with the school management system. Follow the steps in order for a successful setup.
