# Redis Setup Guide

This guide will help you install and configure Redis for the Online Courses Platform.

## What is Redis?

Redis is an in-memory data structure store used for:
- **Caching**: Store frequently accessed data for faster retrieval
- **Queue Management**: Handle background jobs with Bull queue
- **Session Storage**: Manage user sessions

## Installation

### Windows

#### Option 1: Using WSL2 (Recommended)
1. Install WSL2 if not already installed:
   ```powershell
   wsl --install
   ```

2. Install Redis in WSL2:
   ```bash
   sudo apt update
   sudo apt install redis-server
   ```

3. Start Redis:
   ```bash
   sudo service redis-server start
   ```

4. Verify installation:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

#### Option 2: Using Memurai (Windows Native)
1. Download Memurai from: https://www.memurai.com/get-memurai
2. Install and run the installer
3. Memurai will run as a Windows service automatically

#### Option 3: Using Docker
1. Install Docker Desktop for Windows
2. Run Redis container:
   ```powershell
   docker run -d -p 6379:6379 --name redis redis:latest
   ```

### macOS

#### Using Homebrew (Recommended)
```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Verify installation
redis-cli ping
# Should return: PONG
```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Redis
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server

# Enable Redis to start on boot
sudo systemctl enable redis-server

# Verify installation
redis-cli ping
# Should return: PONG
```

## Configuration

### 1. Update Environment Variables

Add these to your `.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 2. For Production

If using a password (recommended for production):

```env
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
```

### 3. Configure Redis (Optional)

Edit Redis configuration file:

**Linux/macOS**: `/etc/redis/redis.conf`
**Windows (WSL)**: `/etc/redis/redis.conf`

Important settings:
```conf
# Set password (uncomment and set)
# requirepass your-secure-password

# Set max memory (recommended for caching)
maxmemory 256mb
maxmemory-policy allkeys-lru

# Enable persistence (optional)
save 900 1
save 300 10
save 60 10000
```

Restart Redis after configuration changes:
```bash
# Linux/macOS
sudo systemctl restart redis-server

# WSL
sudo service redis-server restart

# Docker
docker restart redis
```

## Testing Redis Connection

### Using Redis CLI

```bash
# Connect to Redis
redis-cli

# Test commands
127.0.0.1:6379> SET test "Hello Redis"
127.0.0.1:6379> GET test
127.0.0.1:6379> DEL test
127.0.0.1:6379> EXIT
```

### Using Node.js

Create a test file `test-redis.js`:

```javascript
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

// Test operations
async function testRedis() {
  await redis.set('test', 'Hello Redis');
  const value = await redis.get('test');
  console.log('Value:', value);
  await redis.del('test');
  await redis.quit();
}

testRedis();
```

Run the test:
```bash
node test-redis.js
```

## Bull Queue Setup

Bull queue is already configured in the project. It uses Redis for job storage.

### Queue Features

1. **Logging Queue**: Handles async log processing
2. **Notification Queue**: Manages notification delivery
3. **Analytics Queue**: Processes analytics calculations
4. **Email Queue**: Handles email sending

### Monitoring Queues

Install Bull Board for queue monitoring (optional):

```bash
npm install @bull-board/express
```

## Troubleshooting

### Redis not starting

**Linux/macOS**:
```bash
sudo systemctl status redis-server
sudo journalctl -u redis-server -n 50
```

**WSL**:
```bash
sudo service redis-server status
```

### Connection refused

1. Check if Redis is running:
   ```bash
   redis-cli ping
   ```

2. Check Redis port:
   ```bash
   sudo netstat -tlnp | grep redis
   ```

3. Check firewall settings

### Memory issues

Monitor Redis memory:
```bash
redis-cli INFO memory
```

Clear all data (use with caution):
```bash
redis-cli FLUSHALL
```

## Production Deployment

### Using Redis Cloud (Recommended)

1. Sign up at: https://redis.com/try-free/
2. Create a new database
3. Get connection details
4. Update `.env` with production credentials

### Using AWS ElastiCache

1. Create ElastiCache Redis cluster in AWS
2. Configure security groups
3. Update `.env` with cluster endpoint

### Using Azure Cache for Redis

1. Create Azure Cache for Redis instance
2. Get connection string
3. Update `.env` with Azure credentials

## Security Best Practices

1. **Always use passwords in production**
2. **Use TLS/SSL for connections**
3. **Restrict network access** (firewall rules)
4. **Regular backups** (if persistence is enabled)
5. **Monitor memory usage**
6. **Set appropriate maxmemory limits**

## Useful Redis Commands

```bash
# Check Redis version
redis-cli --version

# Monitor all commands
redis-cli MONITOR

# Get all keys
redis-cli KEYS "*"

# Get Redis info
redis-cli INFO

# Check memory usage
redis-cli INFO memory

# Flush all data (CAUTION!)
redis-cli FLUSHALL
```

## Resources

- Redis Documentation: https://redis.io/documentation
- Bull Queue Documentation: https://github.com/OptimalBits/bull
- Redis Cloud: https://redis.com/
- Memurai (Windows): https://www.memurai.com/

## Support

If you encounter issues:
1. Check Redis logs
2. Verify environment variables
3. Test Redis connection separately
4. Check firewall/network settings
5. Consult Redis documentation
