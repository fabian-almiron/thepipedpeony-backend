# Docker Setup Guide for The Piped Peony Backend

## What's Been Created

✅ **Docker Image**: `pp-strapi:latest` (992MB)
✅ **Docker Compose Configuration**: Multi-container setup with PostgreSQL
✅ **Multi-stage Dockerfile**: Optimized production build

## Quick Start

### Option 1: Run with Docker Compose (Recommended)

This will start both Strapi and PostgreSQL together:

```bash
# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f strapi

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

Access your Strapi admin at: http://localhost:1337/admin

### Option 2: Run Container Only

If you want to run just the Strapi container (using an external database):

```bash
docker run -d \
  --name pp-strapi \
  -p 1337:1337 \
  -e DATABASE_CLIENT=sqlite \
  -v $(pwd)/public/uploads:/app/public/uploads \
  pp-strapi:latest
```

## What's Included

### Services (docker-compose.yml)

1. **Strapi Container** (`pp-strapi`)
   - Image: `pp-strapi:latest`
   - Port: `1337`
   - Volumes: `./public/uploads` (persisted uploads)
   
2. **PostgreSQL Database** (`pp-postgres`)
   - Image: `postgres:16-alpine`
   - Port: `5432`
   - Volume: `strapi-data` (persisted database)

### Environment Variables

The docker-compose setup uses these default credentials:
- **Database**: `strapi`
- **Username**: `strapi`
- **Password**: `strapi`
- **Host**: `postgres` (Docker network)

**Important**: Your `.env` file will be used to provide APP_KEYS and other secrets.

## Useful Commands

### Image Management

```bash
# List all images
docker images

# Remove the image
docker rmi pp-strapi:latest

# Rebuild the image
docker-compose build --no-cache
```

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View logs
docker logs pp-strapi -f

# Execute commands in running container
docker exec -it pp-strapi sh

# Restart container
docker restart pp-strapi
```

### Database Management

```bash
# Connect to PostgreSQL
docker exec -it pp-postgres psql -U strapi -d strapi

# Backup database
docker exec pp-postgres pg_dump -U strapi strapi > backup.sql

# Restore database
docker exec -i pp-postgres psql -U strapi strapi < backup.sql
```

### Clean Up

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v

# Remove unused Docker resources
docker system prune -a
```

## Production Deployment

For production, you should:

1. **Update environment variables** in `docker-compose.yml`:
   - Change default database password
   - Set strong secrets (APP_KEYS, JWT_SECRET, etc.)
   - Configure proper DATABASE_URL

2. **Use external database** for better scalability

3. **Configure volume backups** for uploads and database

4. **Add reverse proxy** (nginx/traefik) for SSL/TLS

5. **Enable health checks** (already included in Dockerfile)

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs pp-strapi

# Check if port is already in use
lsof -i :1337
```

### Database connection issues
```bash
# Verify database is running
docker ps | grep postgres

# Check database logs
docker logs pp-postgres
```

### Permission issues
```bash
# Fix upload directory permissions
chmod -R 755 public/uploads
```

### Reset everything
```bash
# Complete reset
docker-compose down -v
rm -rf public/uploads/*
docker-compose up -d
```

## Image Details

**Base Image**: `node:20-alpine`
**Final Size**: 992MB
**Build Type**: Multi-stage (deps → builder → runner)
**Security**: Runs as non-root user (`strapi:nodejs`)
**Health Check**: Enabled on `/_health` endpoint
**Port**: 1337

## Next Steps

1. Create an admin user at http://localhost:1337/admin
2. Configure your content types
3. Set up proper environment variables for production
4. Configure external storage for uploads (S3, Cloudinary, etc.)
5. Set up CI/CD pipeline for automated builds

