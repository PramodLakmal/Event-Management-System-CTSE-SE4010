# User Service - Getting Started Guide

This guide walks you through setting up and running the User Service locally.

## Quick Start (5 minutes)

### Prerequisites

- Node.js v18 or higher ([Download](https://nodejs.org/))
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - free tier)
- Git

### Step 1: Clone or Create the Project

```bash
cd Event-Management-System-CTSE-SE4010
cd user-service
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your settings:

   ```env
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/event-management-db

   # For MongoDB Atlas (recommended for demo)
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/event-management-db?retryWrites=true&w=majority

   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your_super_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   SERVICE_NAME=user-service
   ```

### Step 4: Start the Service

```bash
npm start
```

The service will start on `http://localhost:3001`

You should see:

```
MongoDB Connected: mongodb+srv://...
user-service is running on port 3001
```

### Step 5: Test the API

Open another terminal and test with curl:

```bash
# Check health
curl http://localhost:3001/health

# Register a user
curl -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "123456"
  }'

# Login
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "123456"
  }'
```

---

## Setup with Docker

### Prerequisites

- Docker ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose

### Option A: Using Docker Compose (Recommended)

This will start both the User Service and MongoDB:

```bash
cd user-service
docker-compose up --build
```

**First time?** This will take 2-3 minutes to download and build images.

Once running:

- User Service: `http://localhost:3001`
- MongoDB: `localhost:27017`

To stop:

```bash
docker-compose down
```

### Option B: Manual Docker Build

Build the image:

```bash
docker build -t user-service:1.0.0 .
```

Run the container:

```bash
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/event-management-db \
  -e JWT_SECRET=your_secret_key \
  user-service:1.0.0
```

---

## Development Workflow

### Running in Development Mode

Uses `nodemon` for auto-restart on file changes:

```bash
npm run dev
```

The service will restart automatically when you save files.

### Project Structure Overview

```
user-service/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection setup
│   ├── controllers/
│   │   └── userController.js        # Business logic for all endpoints
│   ├── middleware/
│   │   ├── auth.js                  # JWT authentication middleware
│   │   └── errorHandler.js          # Global error handler
│   ├── models/
│   │   └── User.js                  # MongoDB User schema
│   ├── routes/
│   │   └── userRoutes.js            # API endpoints routing
│   ├── utils/
│   │   └── jwt.js                   # JWT token generation helper
│   └── validators/
│       └── userValidator.js         # Input validation schemas
├── tests/
│   └── user.test.js                 # Jest unit tests
├── app.js                           # Express app setup
├── package.json                     # Dependencies
├── Dockerfile                       # Docker configuration
├── docker-compose.yml               # Multi-container setup
├── .env.example                     # Environment variables template
├── README.md                        # Full documentation
└── API_DOCUMENTATION.md             # API endpoints reference
```

---

## Common Tasks

### Running Tests

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

### Using the API

#### 1. Register a New User

```bash
curl -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "password": "securePassword123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Save the token! You'll need it for the next requests.

#### 2. Login

```bash
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securePassword123"
  }'
```

#### 3. Get Your Profile

Replace `YOUR_TOKEN` with the token from registration/login:

```bash
curl http://localhost:3001/users/profile/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4. Update Profile

```bash
curl -X PUT http://localhost:3001/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1-555-123-4567",
    "address": "123 Main Street, Springfield"
  }'
```

---

## Postman Collection

### Import Postman Collection

1. Save this as `User-Service.postman_collection.json`:

```json
{
  "info": {
    "name": "User Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"123456\"\n}"
        },
        "url": {
          "raw": "http://localhost:3001/users/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["users", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"123456\"\n}"
        },
        "url": {
          "raw": "http://localhost:3001/users/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["users", "login"]
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3001/users/profile/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["users", "profile", "me"]
        }
      }
    },
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3001/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["health"]
        }
      }
    }
  ]
}
```

2. Open Postman → File → Import → Choose the JSON file

3. Set the `token` variable in Postman after login

---

## Troubleshooting

### MongoDB Connection Error

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**

- Make sure MongoDB is running locally, OR
- Use MongoDB Atlas (cloud): Update `MONGODB_URI` in `.env`
- For Docker: Use `docker-compose up` to run MongoDB automatically

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::3001`

**Solution:**

```bash
# Find process using port 3001
# Windows PowerShell:
netstat -ano | findstr :3001

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change the PORT in .env file
```

### Invalid Token Error

**Problem:** `"Invalid or expired token"`

**Solution:**

- Token expires after 7 days (default)
- Login again to get a new token
- Check `JWT_SECRET` matches between generation and verification

### Node Modules Issues

**Problem:** Dependencies not installing correctly

**Solution:**

```bash
# Delete node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

---

## MongoDB Atlas Setup (Free)

If you don't have MongoDB locally:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a free M0 cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
5. Add your IP to whitelist (or allow from anywhere for testing)
6. Update `MONGODB_URI` in `.env`

---

## Next Steps

1. **Read the full documentation:** See `README.md`
2. **Check the API reference:** See `API_DOCUMENTATION.md`
3. **Understand the code:** Review files in `src/` folder
4. **Run tests:** `npm test`
5. **Deploy with Docker:** Use `docker-compose up` or push to Docker Hub
6. **Integrate with other services:** Registration Service will call this service

---

## Need Help?

- Check API documentation: `API_DOCUMENTATION.md`
- Review example requests above
- Check console logs for error messages
- Verify environment variables are set correctly
- Ensure MongoDB is accessible

Good luck with your Event Management System! 🚀
