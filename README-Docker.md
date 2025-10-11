# Precast Management System with Docker

This project now includes Docker support for easy deployment and data persistence using PostgreSQL.

## Features

- **PostgreSQL Database**: Robust data storage with ACID compliance
- **Containerized API**: Node.js API server in Docker container
- **Persistent Data**: Database data persists across container restarts
- **Health Checks**: Automatic monitoring of service health
- **Production Ready**: Optimized for production deployment

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Clone and navigate to the project directory**

2. **Start the application with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

3. **Check that services are running:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Access the API:**
   - API: http://localhost:4000
   - Health check: http://localhost:4000/api/health
   - Database: localhost:5432

## Services

### Database (PostgreSQL)
- **Container**: precast-postgres
- **Port**: 5432
- **Database**: precast_db
- **User**: precast_user
- **Password**: precast_password

### API Server
- **Container**: precast-api
- **Port**: 4000
- **Health Check**: /api/health

## Database Schema

The following tables are automatically created:

- **cranes**: Crane information
- **queue**: Operation queue for cranes
- **bookings**: Booking requests
- **history**: Operation history
- **users**: User accounts and roles

## Default Credentials

- **Admin User**: admin / admin123

## Development

### Running in Development Mode

For development with live reloading:

```bash
# Install dependencies
npm install

# Run API in development mode
cd precast-api && npm run dev

# Run frontend (if applicable)
cd precast-ui && npm run dev
```

### Database Management

```bash
# Connect to PostgreSQL container
docker-compose exec db psql -U precast_user -d precast_db

# Backup database
docker-compose exec db pg_dump -U precast_user precast_db > backup.sql

# Restore database
docker-compose exec -T db psql -U precast_user -d precast_db < backup.sql
```

## Troubleshooting

### Check service health:
```bash
docker-compose ps
```

### View service logs:
```bash
docker-compose logs api
docker-compose logs db
```

### Restart services:
```bash
docker-compose restart
```

### Reset database:
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Recreate with fresh database
```

## Environment Variables

The following environment variables can be customized:

- `DB_HOST`: Database host (default: db)
- `DB_PORT`: Database port (default: 5432)
- `DB_NAME`: Database name (default: precast_db)
- `DB_USER`: Database user (default: precast_user)
- `DB_PASSWORD`: Database password (default: precast_password)
- `NODE_ENV`: Node environment (default: production)
- `PORT`: API port (default: 4000)

## Production Deployment

For production deployment:

1. Update environment variables in docker-compose.yml
2. Use secrets management for sensitive data
3. Set up proper logging and monitoring
4. Configure reverse proxy (nginx)
5. Set up SSL/TLS certificates

## File Structure

```
├── Dockerfile              # API server container
├── docker-compose.yml      # Multi-service orchestration
├── init.sql               # Database initialization
├── .dockerignore          # Docker build exclusions
└── logs/                  # Application logs (mounted volume)
