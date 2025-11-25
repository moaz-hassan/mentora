# Redis and Bull Queue Setup Guide

## Overview
This guide explains how to set up Redis and Bull queues for the admin dashboard enhancement features including async logging, scheduled notifications, and background job processing.

## Prerequisites
- Node.js installed
- Backend dependencies installed (`npm install`)
- MySQL database running

## Step 1: Install Redis

### Windows
1. **Download Redis for Windows:**
   - Visit: https://github.com/microsoftarchive/redis/releases
   - Download the latest `.msi` installer
   - Run the installer and follow the setup wizard

2. **Or use WSL (Windows Subsystem for Linux):**
   ```bash
   wsl --install
   sudo apt-get update
   sudo apt-get install redis-server
   sudo service redis-server start
   ```

3. **Or use Docker:**
   ```bash
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

### macOS
```bash
# Using Homebrew
brew install redis

# Start Redis
brew services start redis

# Or run manually
redis-server
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server

# Start Redis
sudo systemctl start redis-server

# Enable on boot
sudo systemctl enable redis-server
```

## Step 2: Verify Redis Installation

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check Redis version
redis-cli --version
```

## Step 3: Configure Environment Variables

Update your `.env` file with Redis configuration:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

For production, set a strong password:
```env
REDIS_PASSWORD=your_secure_password_here
```

## Step 4: Start Workers

The workers process background jobs from Bull queues. Start them with:

```bash
# Start all workers
node backend/workers/index.js
```

Or add to your `package.json`:
```json
{
  "scripts": {
    "start": "nodemon server.js",
    "workers": "nodemon workers/index.js",
    "dev": "concurrently \"npm run start\" \"npm run workers\""
  }
}
```

## Step 5: Test the Setup

### Test Redis Connection
```javascript
// In Node.js REPL or test file
import { redisClient } from './config/redis.js';

// Set a value
await redisClient.set('test', 'Hello Redis!');

// Get the value
const value = await redisClient.get('test');
console.log(value); // Should print: Hello Redis!
```

### Test Bull Queue
```javascript
import { addLoggingJob } from './config/queue.js';

// Add a test job
await addLoggingJob({
  type: 'audit',
  data: {
    admin_id: 'test-admin',
    action_type: 'test',
    resource_type: 'test',
    description: 'Test log entry'
  }
});

console.log('Job added successfully!');
```

## Architecture

### Redis Databases
- **Database 0**: General caching (analytics, settings, AI responses)
- **Database 1**: Bull queues (job processing)

### Bull Queues
1. **Logging Queue**: Processes audit, payment, enrollment, error logs
2. **Notification Queue**: Handles scheduled notifications and broadcasts
3. **Analytics Queue**: Background analytics calculations
4. **Email Queue**: Email sending jobs

### Workers
- **Logging Worker**: Batch processes logs (50 logs per batch or 5-second timeout)
- **Notification Worker**: Sends scheduled notifications (checks every minute)

## Features Enabled

### 1. Async Logging
All admin actions are logged asynchronously without blocking requests:
```javascript
import { logAdminAction } from './middlewares/logging.middleware.js';

router.post('/courses/:id/approve', 
  logAdminAction('approve', 'course'),
  courseController.approveCourse
);
```

### 2. Scheduled Notifications
Notifications can be scheduled for future delivery:
```javascript
await broadcastNotification({
  title: 'System Maintenance',
  message: 'Scheduled maintenance tonight',
  targetAudience: 'all',
  scheduledAt: '2024-12-25T20:00:00Z'
}, adminId);
```

### 3. Caching
Expensive operations are cached in Redis:
```javascript
import { getCacheOrFetch } from './config/redis.js';

const analytics = await getCacheOrFetch(
  'analytics:overview',
  () => analyticsService.getPlatformOverview(),
  3600 // Cache for 1 hour
);
```

### 4. Batch Processing
Logs are batched for efficient database writes:
- Accumulates up to 50 logs
- Auto-flushes after 5 seconds
- Bulk inserts to database

## Monitoring

### Check Queue Status
```javascript
import { getAllQueueStats } from './config/queue.js';

const stats = await getAllQueueStats();
console.log(stats);
// {
//   logging: { waiting: 5, active: 2, completed: 1000, failed: 3 },
//   notification: { waiting: 0, active: 0, completed: 50, failed: 0 },
//   ...
// }
```

### Redis CLI Commands
```bash
# Monitor Redis in real-time
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys
redis-cli keys "*"

# Get queue job count
redis-cli llen bull:logging:wait
```

## Production Deployment

### 1. Use Redis Password
```env
REDIS_PASSWORD=strong_random_password_here
```

### 2. Use Redis Cluster (Optional)
For high availability, consider Redis Cluster or Redis Sentinel.

### 3. Monitor with Bull Board (Optional)
Install Bull Board for a web UI to monitor queues:
```bash
npm install @bull-board/express
```

### 4. Set Up Persistent Storage
Configure Redis to persist data:
```bash
# In redis.conf
save 900 1
save 300 10
save 60 10000
```

### 5. Use Process Manager
Use PM2 to manage workers:
```bash
npm install -g pm2

# Start workers
pm2 start workers/index.js --name workers

# Start server
pm2 start server.js --name server

# Save configuration
pm2 save
pm2 startup
```

## Troubleshooting

### Redis Connection Failed
```bash
# Check if Redis is running
sudo systemctl status redis-server

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Test connection
redis-cli ping
```

### Workers Not Processing Jobs
1. Check if workers are running
2. Check Redis connection in workers
3. Check queue error logs
4. Verify job data format

### High Memory Usage
```bash
# Check Redis memory
redis-cli info memory

# Clear all data (CAUTION: Development only!)
redis-cli FLUSHALL

# Set max memory limit
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

## Performance Tips

1. **Batch Operations**: Use bulk operations when possible
2. **Set TTL**: Always set expiration on cached data
3. **Monitor Memory**: Keep Redis memory usage under 80%
4. **Use Pipelines**: For multiple Redis commands
5. **Optimize Job Payload**: Keep job data small

## Security Best Practices

1. **Use Password**: Always set REDIS_PASSWORD in production
2. **Bind to Localhost**: Don't expose Redis to public internet
3. **Use Firewall**: Restrict Redis port (6379) access
4. **Regular Backups**: Enable Redis persistence and backup
5. **Update Regularly**: Keep Redis updated to latest stable version

## Next Steps

1. ✅ Redis and Bull are configured
2. ✅ Workers are ready to process jobs
3. ✅ Logging middleware is available
4. ✅ Caching utilities are ready
5. 🔄 Integrate logging into your routes
6. 🔄 Use caching for expensive operations
7. 🔄 Monitor queue performance

## Support

For issues or questions:
- Redis Documentation: https://redis.io/documentation
- Bull Documentation: https://github.com/OptimalBits/bull
- Bull Board: https://github.com/felixmosh/bull-board
