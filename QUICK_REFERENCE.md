# Quick Reference - School Management System

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### Start Application
```bash
# With Docker (Recommended)
docker compose up -d

# Without Docker (Local)
npm run dev
```

### Stop Application
```bash
# With Docker
docker compose down

# Without Docker
Ctrl + C
```

## 📋 Essential Commands

### Docker Operations
```bash
docker compose up -d          # Start services
docker compose down           # Stop services
docker compose logs -f app    # View app logs
docker compose logs -f postgres # View database logs
docker compose restart        # Restart services
docker compose up -d --build  # Rebuild and start
```

### Database Operations
```bash
npx prisma generate           # Generate Prisma client
npx prisma migrate dev        # Create and apply migration
npx prisma studio            # Open database GUI
npx prisma db push           # Push schema changes
npx prisma db seed           # Run seed script
```

### Development Commands
```bash
npm run dev                  # Start development server
npm run build               # Build for production
npm run start               # Start production server
npm run lint                # Run ESLint
npm run type-check          # Run TypeScript check
```

### Container Access
```bash
docker compose exec app sh   # Access app container
docker compose exec postgres psql -U postgres # Access database
```

## 🔧 Troubleshooting Commands

### Check Status
```bash
docker compose ps            # Check container status
docker compose logs app      # Check app logs
docker compose logs postgres # Check database logs
```

### Common Fixes
```bash
# Rebuild after changes
docker compose up -d --build

# Reset database (development only)
npx prisma migrate reset

# Clear Docker cache
docker system prune -a

# Check for port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432
```

## 📁 Important Files

- `.env` - Environment variables
- `env.example` - Environment template
- `docker-compose.yml` - Docker services
- `Dockerfile` - Application container
- `prisma/schema.prisma` - Database schema
- `package.json` - Dependencies and scripts

## 🌐 Access Points

- **Application**: http://localhost:3000
- **Database**: localhost:5432
- **Prisma Studio**: Run `npx prisma studio`

## ⚠️ Common Issues

1. **Port 3000 in use**: Change port in docker-compose.yml or kill process
2. **Database connection failed**: Check if postgres container is running
3. **Build fails**: Run `npm run lint` and `npm run type-check` to find errors
4. **Environment variables missing**: Copy `env.example` to `.env` and configure

## 📞 Need Help?

1. Check the [README.md](README.md) for detailed documentation
2. Review the [Troubleshooting](#troubleshooting) section
3. Check container logs: `docker compose logs -f`
4. Open an issue on GitHub
