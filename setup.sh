#!/bin/bash

# School Management System Setup Script
# This script automates the initial setup process

set -e  # Exit on any error

echo "🚀 School Management System Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed."
    exit 1
fi

print_success "npm $(npm --version) is installed"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. You can still run the project locally without Docker."
    DOCKER_AVAILABLE=false
else
    print_success "Docker $(docker --version) is installed"
    DOCKER_AVAILABLE=true
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_warning "Docker Compose is not installed. You can still run the project locally."
    DOCKER_COMPOSE_AVAILABLE=false
else
    print_success "Docker Compose is installed"
    DOCKER_COMPOSE_AVAILABLE=true
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_warning "Git is not installed. Version control features will not be available."
else
    print_success "Git $(git --version) is installed"
fi

echo ""

# Environment setup
print_status "Setting up environment..."

if [ ! -f .env ]; then
    if [ -f env.example ]; then
        cp env.example .env
        print_success "Created .env file from .env.example"
        print_warning "Please edit .env file with your configuration values"
    else
        print_warning "No .env.example file found. Creating basic .env file..."
        cat > .env << EOF
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_management"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=school_management

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Application Configuration
NODE_ENV=development
EOF
        print_success "Created basic .env file"
        print_warning "Please update the .env file with your actual configuration values"
    fi
else
    print_success ".env file already exists"
fi

echo ""

# Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed successfully"

echo ""

# Setup database
print_status "Setting up database..."

# Generate Prisma client
npx prisma generate
print_success "Prisma client generated"

# Check if we should run migrations
if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
    print_status "Docker is available. You can start the application with:"
    echo "  docker compose up -d"
    echo ""
    print_status "Or run locally with:"
    echo "  npm run dev"
else
    print_status "To run the application locally:"
    echo "  npm run dev"
    echo ""
    print_warning "Note: You'll need to set up a PostgreSQL database manually for local development"
fi

echo ""

# Final instructions
print_success "Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit the .env file with your configuration values"
echo "2. If using Docker: docker compose up -d"
echo "3. If running locally: npm run dev"
echo "4. Access the application at: http://localhost:3000"
echo ""
echo "📚 For more information, see the README.md file"
echo ""
print_success "Happy coding! 🎉"
