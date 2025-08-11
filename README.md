# School Management System

A comprehensive school management system built with Next.js 14, Prisma ORM, PostgreSQL, and Docker. This system provides a complete solution for managing students, teachers, classes, attendance, results, and administrative tasks.

## 🚀 Features

- **User Management**: Students, Teachers, Parents, and Administrators
- **Academic Management**: Classes, Subjects, Lessons, Exams, Results
- **Administrative Tools**: Attendance tracking, Assignments, Announcements
- **Communication**: Internal messaging system and event management
- **Modern UI**: Responsive design with Tailwind CSS
- **Authentication**: Secure authentication with Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Containerized**: Docker and Docker Compose for easy deployment

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Docker** and **Docker Compose**
- **Git** (for version control)

### Check Versions
```bash
node --version
npm --version
docker --version
docker compose version
git --version
```

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd school-management-system
```

### 2. Environment Setup
```bash
# Option 1: Use the automated setup script (Recommended)
# On Windows:
setup.bat

# On Linux/Mac:
chmod +x setup.sh
./setup.sh

# Option 2: Manual setup
# Copy environment file
cp env.example .env

# Edit environment variables
nano .env
# or
code .env
```

### 3. Start with Docker (Recommended)
```bash
# Build and start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f app
```

### 4. Access the Application
- **Application**: http://localhost:3000
- **Database**: localhost:5432
- **Prisma Studio**: Run `npx prisma studio` (if running locally)

## 📁 Project Structure

```
school-management-system/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/       # Dashboard layout group
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── teacher/       # Teacher dashboard
│   │   │   ├── student/       # Student dashboard
│   │   │   └── parent/        # Parent dashboard
│   │   ├── api/               # API routes
│   │   ├── list/              # List pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── forms/            # Form components
│   │   ├── ui/               # UI components
│   │   └── ...               # Other components
│   └── lib/                  # Utilities and configurations
│       ├── prisma.ts         # Prisma client
│       ├── actions.ts        # Server actions
│       └── utils.ts          # Utility functions
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── docker-compose.yml        # Docker services
├── Dockerfile               # Application container
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🗄️ Database Setup

### Prisma Configuration
The project uses Prisma as the ORM. The schema is located in `prisma/schema.prisma`.

### Database Models
The system includes the following main entities:
- **Users**: Students, Teachers, Parents, Admins
- **Academic**: Classes, Subjects, Lessons, Exams, Results
- **Administrative**: Attendance, Assignments, Announcements
- **Communication**: Messages, Events

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration-name>

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Push schema changes (development)
npx prisma db push
```

## 🐳 Docker Configuration

### Services Overview
The `docker-compose.yml` file defines two main services:

#### Application Service (`app`)
- **Port**: 3000
- **Build**: Uses Dockerfile
- **Environment**: Uses .env file
- **Dependencies**: Requires postgres service

#### Database Service (`postgres`)
- **Port**: 5432
- **Image**: postgres:15
- **Volume**: Persistent data storage
- **Environment**: Database credentials

### Docker Commands
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Rebuild and start
docker compose up -d --build

# View logs
docker compose logs -f app
docker compose logs -f postgres

# Access container shell
docker compose exec app sh
docker compose exec postgres psql -U postgres

# Restart services
docker compose restart
```

## ⚙️ Environment Configuration

### Required Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
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

### Environment Setup Commands
```bash
# Copy example file
cp .env.example .env

# Edit environment variables
nano .env
# or
code .env
```

## 🔧 Development Workflow

### Local Development (Without Docker)
```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

### Docker Development
```bash
# Start services
docker compose up -d

# View application logs
docker compose logs -f app

# Run commands in container
docker compose exec app npm run lint
docker compose exec app npx prisma studio
```

### Code Quality
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (if configured)
npm run test

# Build for production
npm run build
```

## 🚀 Production Deployment

### Production Environment Variables
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
CLERK_SECRET_KEY=your_production_clerk_secret
```

### Production Build
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

### Docker Compose Production
```bash
# Use production compose file
docker compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

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

#### 3. Port Conflicts
**Issue**: Port 3000 or 5432 already in use
```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Kill process or change ports in docker-compose.yml
```

#### 4. Environment Variable Issues
**Issue**: Missing or incorrect environment variables
```bash
# Verify .env file exists
ls -la .env

# Check environment variables in container
docker compose exec app env | grep DATABASE_URL
```

### Debugging Commands
```bash
# Container management
docker compose ps
docker compose logs app
docker compose logs postgres

# Database operations
npx prisma generate
npx prisma db push
npx prisma studio

# Application debugging
npm run build
npx tsc --noEmit
```

## 📚 API Documentation

The application includes built-in API documentation accessible at `/api-docs` when running.

### API Endpoints
- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Students**: `/api/students/*`
- **Teachers**: `/api/teachers/*`
- **Classes**: `/api/classes/*`
- **Results**: `/api/results/*`
- **Attendance**: `/api/attendance/*`

## 🛡️ Security

### Authentication
- Uses Clerk for secure authentication
- Role-based access control
- Protected API routes

### Database Security
- Environment variable configuration
- Prisma ORM for SQL injection prevention
- Input validation with Zod

### Docker Security
- Non-root user in containers
- Minimal base images
- Environment variable isolation

## 📝 Available Scripts

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [API Documentation](#api-documentation)
3. Open an issue on GitHub
4. Contact the development team

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Happy Coding! 🎉**
