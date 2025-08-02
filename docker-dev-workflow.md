# 🐳 Docker Development Workflow - Quick Reference

## Common Update Scenarios

### Frontend Code Changes (React/TypeScript)
```bash
# After editing src/ files:
docker-compose build frontend && docker-compose restart frontend

# Or use the npm script:
npm run docker:build && docker-compose restart frontend
```

### Backend Code Changes (Python)
```bash
# For code changes (hot-reload should work):
docker-compose restart backend

# If hot-reload doesn't work:
docker-compose build backend && docker-compose restart backend
```

### Dependency Changes
```bash
# Frontend (package.json):
docker-compose build frontend && docker-compose restart frontend

# Backend (requirements.txt):
docker-compose build backend && docker-compose restart backend

# Both:
npm run docker:build && npm run docker:up
```

### Configuration Changes
```bash
# nginx.conf:
docker-compose build frontend && docker-compose restart frontend

# docker-compose.yml or Dockerfiles:
npm run docker:down && npm run docker:build && npm run docker:up
```

## Development Tips

### 1. **Live Development with Volume Mounts**
The backend container has volume mounts enabled for development:
```yaml
volumes:
  - ./backend:/app  # Your code is mounted into the container
```
This means Python changes should be picked up automatically by uvicorn's reload feature.

### 2. **Quick Status Check**
```bash
# Check container status:
docker-compose ps

# View logs:
npm run docker:logs

# Follow logs in real-time:
docker-compose logs -f
```

### 3. **Force Fresh Start**
If you're having issues, do a complete reset:
```bash
npm run docker:down
npm run docker:build
npm run docker:up
```

### 4. **Clean Rebuild (Nuclear Option)**
If you want to completely clean everything:
```bash
npm run docker:clean  # Removes containers, volumes, and images
npm run docker:build
npm run docker:up
```

## Fast Development Loop

For the fastest development experience:

1. **Start containers once:**
   ```bash
   npm run docker:up
   ```

2. **For Python changes:**
   - Just save your files - uvicorn should auto-reload
   - If not working: `docker-compose restart backend`

3. **For React changes:**
   ```bash
   docker-compose build frontend && docker-compose restart frontend
   ```

4. **View changes:**
   - Frontend: http://localhost
   - Backend API: http://localhost:3001/api/health

## Troubleshooting

### Container Won't Start
```bash
docker-compose logs [service-name]
```

### Changes Not Appearing
```bash
# Force rebuild:
docker-compose build [service-name] --no-cache
docker-compose restart [service-name]
```

### Port Conflicts
```bash
# See what's using the ports:
lsof -i :80 -i :3001

# Or stop everything:
npm run docker:down
```