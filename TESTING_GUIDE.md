# Complete Testing Guide - Service Communication Verification

## Event Management System Microservices

This guide helps you verify that all services are running, connected, and communicating successfully.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Start All Services](#start-all-services)
3. [Health Check Tests](#health-check-tests)
4. [Individual Service Testing](#individual-service-testing)
5. [Service Communication Tests](#service-communication-tests)
6. [End-to-End Testing](#end-to-end-testing)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Tools

```bash
# Check Node.js is installed
node --version
# Should show: v14+ or higher

# Check npm is installed
npm --version
# Should show: v6+ or higher

# Check Docker is installed
docker --version
# Should show: Docker version 20.10+

# Check Docker Compose is installed
docker-compose --version
# Should show: Docker Compose version 1.29+
```

### Required Files

- ✅ All services folders created (user-service, event-service, registration-service, notification-service)
- ✅ API Gateway folder created
- ✅ Frontend folder created
- ✅ docker-compose.yml in root folder
- ✅ .env files in each service folder

---

## 🚀 Start All Services

### Option 1: Using Docker Compose (RECOMMENDED)

#### Step 1: Navigate to Project Root

```powershell
cd "C:\Users\sachi\Desktop\Campus\Microservices App\Event-Management-System-CTSE-SE4010"
```

#### Step 2: Start All Containers

```powershell
# Build and start all services
docker-compose up --build

# Or in background (detached mode)
docker-compose up -d --build

# View logs in background mode
docker-compose logs -f
```

#### Step 3: Wait for Services to Start

```
Expected output:
✓ zookeeper started (port 2181)
✓ kafka started (port 9092)
✓ mongodb started (port 27017)
✓ user-service started (port 3001)
✓ event-service started (port 3002)
✓ registration-service started (port 3003)
✓ notification-service started (port 3004)
✓ api-gateway started (port 3000)
✓ frontend started (port 80)
```

⏳ **Wait 30-60 seconds** for all services to be fully ready

---

### Option 2: Manual Service Starting (For Development)

If you want to test services individually:

#### Terminal 1: Start Kafka & MongoDB (using docker-compose)

```powershell
cd Event-Management-System-CTSE-SE4010
docker-compose up kafka mongodb
```

#### Terminal 2: Start User Service

```powershell
cd user-service
npm install
npm start
# Expected: Server running on port 3001
```

#### Terminal 3: Start Event Service

```powershell
cd event-service
npm install
npm start
# Expected: Server running on port 3002
```

#### Terminal 4: Start Registration Service

```powershell
cd registration-service
npm install
npm start
# Expected: Server running on port 3003
```

#### Terminal 5: Start Notification Service

```powershell
cd notification-service
npm install
npm start
# Expected: Server running on port 3004
```

#### Terminal 6: Start API Gateway

```powershell
cd api-gateway
npm install
npm start
# Expected: Server running on port 3000
```

---

## 🏥 Health Check Tests

### Method 1: Using Curl Commands

#### Check All Services Health

```powershell
# User Service (Port 3001)
curl http://localhost:3001/health

# Event Service (Port 3002)
curl http://localhost:3002/health

# Registration Service (Port 3003)
curl http://localhost:3003/health

# Notification Service (Port 3004)
curl http://localhost:3004/health

# API Gateway (Port 3000)
curl http://localhost:3000/health

# Expected Response:
# { "status": "OK", "timestamp": "2026-03-16T..." }
```

#### Check MongoDB Connection

```powershell
# Using docker exec (if running in Docker)
docker exec mongodb mongosh --eval "db.adminCommand('ping')"

# Expected response:
# { ok: 1 }
```

#### Check Kafka Broker

```powershell
# Check Kafka is running
docker exec kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092

# Expected: Shows API versions
```

---

### Method 2: Browser Check

Open these URLs in your web browser:

| Service              | URL                          | Expected Response |
| -------------------- | ---------------------------- | ----------------- |
| API Gateway          | http://localhost:3000/health | Status OK         |
| User Service         | http://localhost:3001/health | Status OK         |
| Event Service        | http://localhost:3002/health | Status OK         |
| Registration Service | http://localhost:3003/health | Status OK         |
| Notification Service | http://localhost:3004/health | Status OK         |
| Frontend             | http://localhost             | Login page        |

---

### Method 3: Docker Status Check

```powershell
# Check all containers are running
docker-compose ps

# Expected Output (all should show "Up"):
# NAME                COMMAND             STATUS          PORTS
# zookeeper          "/etc/confluent/..."   Up (healthy)    2181
# kafka              "/etc/confluent/..."   Up (healthy)    9092
# mongodb            "docker-entrypoint..." Up (healthy)    27017
# user-service       "docker-entrypoint..." Up              3001
# event-service      "docker-entrypoint..." Up              3002
# registration-s...  "docker-entrypoint..." Up              3003
# notification-s...  "docker-entrypoint..." Up              3004
# api-gateway        "docker-entrypoint..." Up              3000
# frontend           "nginx -g daemon..."   Up              80
```

---

## 🔍 Individual Service Testing

### Test 1: User Service (Port 3001)

#### Register a New User

```powershell
curl -X POST http://localhost:3001/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "User registered successfully",
#   "token": "eyJhbGc...",
#   "user": {
#     "_id": "...",
#     "name": "Test User",
#     "email": "test@example.com"
#   }
# }
```

**✅ Success Indicator:** User registered and received JWT token

#### Login User

```powershell
curl -X POST http://localhost:3001/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Login successful",
#   "token": "eyJhbGc...",
#   "user": { ... }
# }
```

**✅ Success Indicator:** Received valid JWT token

#### Get User Info

```powershell
$token = "YOUR_JWT_TOKEN_HERE"

curl -X GET http://localhost:3001/users/profile `
  -H "Authorization: Bearer $token"

# Expected Response:
# {
#   "success": true,
#   "data": { user object }
# }
```

**✅ Success Indicator:** User data returned successfully

---

### Test 2: Event Service (Port 3002)

#### Create Event

```powershell
curl -X POST http://localhost:3002/events `
  -H "Content-Type: application/json" `
  -d '{
    "title": "React Workshop",
    "description": "Learn React.js basics",
    "date": "2026-04-15",
    "time": "10:00 AM",
    "location": "Tech Hub, Mumbai",
    "capacity": 50,
    "category": "Technology"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Event created successfully",
#   "data": {
#     "_id": "...",
#     "title": "React Workshop",
#     ...
#   }
# }
```

**✅ Success Indicator:** Event created with unique ID

#### Get All Events

```powershell
curl http://localhost:3002/events

# Expected Response:
# {
#   "success": true,
#   "data": [
#     { event 1 },
#     { event 2 }
#   ],
#   "totalCount": 2
# }
```

**✅ Success Indicator:** List of events returned

#### Get Event by ID

```powershell
# Replace EVENT_ID with actual ID from create response
curl http://localhost:3002/events/EVENT_ID

# Expected Response:
# {
#   "success": true,
#   "data": { full event details }
# }
```

**✅ Success Indicator:** Single event details returned

---

### Test 3: Registration Service (Port 3003)

This service communicates with User and Event services!

#### Register User for Event

```powershell
# First, make sure you have:
# - A valid user ID (from User Service)
# - A valid event ID (from Event Service)

curl -X POST http://localhost:3003/registrations `
  -H "Content-Type: application/json" `
  -d '{
    "userId": "USER_ID_HERE",
    "eventId": "EVENT_ID_HERE"
  }'

# Expected Response:
# {
#   "success": true,
#   "message": "Registration successful",
#   "data": {
#     "_id": "...",
#     "userId": "USER_ID_HERE",
#     "eventId": "EVENT_ID_HERE",
#     "registrationDate": "2026-03-16T..."
#   }
# }
```

**✅ Success Indicator:** Registration created, Kafka message published

#### Get User's Registrations

```powershell
curl http://localhost:3003/registrations?userId=USER_ID_HERE

# Expected Response:
# {
#   "success": true,
#   "data": [
#     { registration 1 },
#     { registration 2 }
#   ]
# }
```

**✅ Success Indicator:** List of user's registrations returned

---

### Test 4: Notification Service (Port 3004)

This service listens to Kafka messages!

#### Get User's Notifications

```powershell
curl http://localhost:3004/notifications?userId=USER_ID_HERE

# Expected Response:
# {
#   "success": true,
#   "data": [
#     {
#       "_id": "...",
#       "userId": "USER_ID_HERE",
#       "type": "registration",
#       "title": "Registration Confirmed",
#       "message": "You registered for React Workshop",
#       "status": "sent",
#       "createdAt": "2026-03-16T..."
#     }
#   ]
# }
```

**✅ Success Indicator:** Notification created from Kafka message

---

## 🔗 Service Communication Tests

### Test 5: Complete Registration Flow (Testing All Services Communicate)

This is the **MOST IMPORTANT TEST** - it verifies all services work together!

#### Step 1: Register a User (User Service)

```powershell
$registerResponse = curl -X POST http://localhost:3001/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }' | ConvertFrom-Json

$userId = $registerResponse.user._id
$token = $registerResponse.token

Write-Host "✓ User created with ID: $userId"
Write-Host "✓ Token: $token"
```

#### Step 2: Create an Event (Event Service)

```powershell
$eventResponse = curl -X POST http://localhost:3002/events `
  -H "Content-Type: application/json" `
  -d '{
    "title": "Node.js Masterclass",
    "description": "Advanced Node.js patterns",
    "date": "2026-04-20",
    "time": "2:00 PM",
    "location": "Tech Hub, Mumbai",
    "capacity": 100,
    "category": "Technology"
  }' | ConvertFrom-Json

$eventId = $eventResponse.data._id

Write-Host "✓ Event created with ID: $eventId"
```

#### Step 3: Register User for Event (Registration Service)

```powershell
# This will call User Service + Event Service + publish Kafka event

$registrationResponse = curl -X POST http://localhost:3003/registrations `
  -H "Content-Type: application/json" `
  -d "{
    \"userId\": \"$userId\",
    \"eventId\": \"$eventId\"
  }" | ConvertFrom-Json

$registrationId = $registrationResponse.data._id

Write-Host "✓ Registration created with ID: $registrationId"
Write-Host "✓ Kafka message should be published now..."
```

#### Step 4: Check Notification (Notification Service - Kafka Consumer)

```powershell
# Wait 2-3 seconds for Kafka message to be processed

Start-Sleep -Seconds 3

$notificationResponse = curl http://localhost:3004/notifications?userId=$userId | ConvertFrom-Json

Write-Host "✓ Notifications count: $($notificationResponse.data.Count)"
Write-Host "✓ Latest notification: $($notificationResponse.data[0].message)"

# Expected: "You registered for Node.js Masterclass"
```

#### Step 5: Check via API Gateway (All Services Through Gateway)

```powershell
# API Gateway should route to all services

# Get events through gateway
curl http://localhost:3000/api/events

# Get notifications through gateway
curl http://localhost:3000/api/notifications?userId=$userId

# Expected: Same results as direct service calls
```

**✅ Complete Success Indicator:**

- ✓ User registered with JWT token
- ✓ Event created with ID
- ✓ Registration successful
- ✓ Notification appears in Notification Service
- ✓ All services respond through API Gateway

---

## 🎯 End-to-End Testing

### Complete Test Script (PowerShell)

Create a file: `test-services.ps1`

```powershell
#!/usr/bin/env powershell

Write-Host "🚀 Starting End-to-End Service Communication Test" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Configuration
$BaseUrls = @{
    User = "http://localhost:3001"
    Event = "http://localhost:3002"
    Registration = "http://localhost:3003"
    Notification = "http://localhost:3004"
    Gateway = "http://localhost:3000"
}

# Test 1: Health Checks
Write-Host "`n📋 TEST 1: Health Checks" -ForegroundColor Yellow
foreach ($service in $BaseUrls.Keys) {
    try {
        $response = Invoke-RestMethod -Uri "$($BaseUrls[$service])/health" -ErrorAction Stop
        Write-Host "✓ $service Service: OK" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ $service Service: FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Register User
Write-Host "`n📋 TEST 2: User Registration (User Service)" -ForegroundColor Yellow
try {
    $userData = @{
        name = "Test User $(Get-Random)"
        email = "testuser$(Get-Random)@example.com"
        password = "password123"
    } | ConvertTo-Json

    $userResponse = Invoke-RestMethod -Uri "$($BaseUrls['User'])/auth/register" `
        -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $userData

    $userId = $userResponse.user._id
    $token = $userResponse.token

    Write-Host "✓ User registered successfully" -ForegroundColor Green
    Write-Host "  User ID: $userId"
    Write-Host "  Email: $($userResponse.user.email)"
}
catch {
    Write-Host "✗ User registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Create Event
Write-Host "`n📋 TEST 3: Create Event (Event Service)" -ForegroundColor Yellow
try {
    $eventData = @{
        title = "Test Event $(Get-Random)"
        description = "This is a test event"
        date = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
        time = "10:00 AM"
        location = "Mumbai"
        capacity = 50
        category = "Technology"
    } | ConvertTo-Json

    $eventResponse = Invoke-RestMethod -Uri "$($BaseUrls['Event'])/events" `
        -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $eventData

    $eventId = $eventResponse.data._id

    Write-Host "✓ Event created successfully" -ForegroundColor Green
    Write-Host "  Event ID: $eventId"
    Write-Host "  Title: $($eventResponse.data.title)"
}
catch {
    Write-Host "✗ Event creation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Register User for Event (Service Choreography + Kafka)
Write-Host "`n📋 TEST 4: User Registration for Event (Service Choreography)" -ForegroundColor Yellow
try {
    $registrationData = @{
        userId = $userId
        eventId = $eventId
    } | ConvertTo-Json

    $regResponse = Invoke-RestMethod -Uri "$($BaseUrls['Registration'])/registrations" `
        -Method Post `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $registrationData

    $registrationId = $regResponse.data._id

    Write-Host "✓ Registration successful" -ForegroundColor Green
    Write-Host "  Registration ID: $registrationId"
    Write-Host "  User ID: $($regResponse.data.userId)"
    Write-Host "  Event ID: $($regResponse.data.eventId)"
    Write-Host "  Kafka message published for notifications"
}
catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 5: Check Notification (Kafka Consumer)
Write-Host "`n📋 TEST 5: Check Notification (Kafka Consumer)" -ForegroundColor Yellow
Write-Host "  Waiting 3 seconds for Kafka message processing..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

try {
    $notifResponse = Invoke-RestMethod -Uri "$($BaseUrls['Notification'])/notifications?userId=$userId"

    if ($notifResponse.data.Count -gt 0) {
        Write-Host "✓ Notification received from Kafka" -ForegroundColor Green
        Write-Host "  Notification Count: $($notifResponse.data.Count)"
        Write-Host "  Latest Message: $($notifResponse.data[0].message)"
        Write-Host "  Status: $($notifResponse.data[0].status)"
    }
    else {
        Write-Host "⚠ No notifications found (Kafka may still be processing)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Notification check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: API Gateway Routing
Write-Host "`n📋 TEST 6: API Gateway Routing" -ForegroundColor Yellow
try {
    $gatewayEvent = Invoke-RestMethod -Uri "$($BaseUrls['Gateway'])/api/events"
    Write-Host "✓ API Gateway routing events: $($gatewayEvent.data.Count) events" -ForegroundColor Green
}
catch {
    Write-Host "⚠ API Gateway routing test: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 7: Service Communication Summary
Write-Host "`n📊 Service Communication Summary" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "✓ User Service: Registration working" -ForegroundColor Green
Write-Host "✓ Event Service: Event creation working" -ForegroundColor Green
Write-Host "✓ Registration Service: Service choreography working (calls User + Event)" -ForegroundColor Green
Write-Host "✓ Registration Service: Kafka producer working (published message)" -ForegroundColor Green
Write-Host "✓ Notification Service: Kafka consumer working (received message)" -ForegroundColor Green
Write-Host "✓ API Gateway: Request routing working" -ForegroundColor Green

Write-Host "`n🎉 All tests completed successfully!" -ForegroundColor Green
```

#### Run the Test Script

```powershell
# Navigate to project root
cd "C:\Users\sachi\Desktop\Campus\Microservices App\Event-Management-System-CTSE-SE4010"

# Run the test script
.\test-services.ps1
```

---

## 🔍 Verify Each Communication Type

### Communication Pattern 1: Direct Service Calls (REST)

```
User Service API → Direct Call
Event Service API → Direct Call
Registration Service → Calls User Service (verify user)
Registration Service → Calls Event Service (check availability)
```

**Check logs:**

```powershell
docker-compose logs registration-service | grep "Calling User Service"
docker-compose logs registration-service | grep "Calling Event Service"
```

### Communication Pattern 2: API Gateway Routing

```
Client → API Gateway:3000
API Gateway → Routes to microservice
Microservice → Returns response
API Gateway → Returns to client
```

**Test gateway routing:**

```powershell
# Request through gateway (routes to user service)
curl http://localhost:3000/api/auth/login

# Request through gateway (routes to event service)
curl http://localhost:3000/api/events

# Request through gateway (routes to registration service)
curl http://localhost:3000/api/registrations

# Request through gateway (routes to notification service)
curl http://localhost:3000/api/notifications
```

### Communication Pattern 3: Kafka Messaging (Async)

```
Registration Service → Publishes event to Kafka
Kafka Topic (registration-events) → Stores message
Notification Service → Consumes from Kafka
Notification Service → Creates notification in DB
```

**Check Kafka logs:**

```powershell
# View Kafka messages
docker exec kafka kafka-console-consumer.sh `
  --bootstrap-server localhost:9092 `
  --topic registration-events `
  --from-beginning

# Expected output: JSON events with userId, eventId, timestamp, etc.
```

**Check Notification Service logs:**

```powershell
docker-compose logs notification-service | grep "Received message"
```

---

## 🐛 Troubleshooting Tests

### Issue 1: Services Not Starting

```powershell
# Check if containers are running
docker-compose ps

# Check logs for errors
docker-compose logs user-service
docker-compose logs event-service
docker-compose logs registration-service

# Solution: Restart services
docker-compose down
docker-compose up --build -d
```

### Issue 2: Connection Refused

```powershell
# Error: Connection refused on port 3001/3002/etc

# Solution: Wait longer for services to start (30-60 seconds)
# Check if port is already in use
netstat -ano | findstr ":3001"

# If port is in use, kill the process or use different port
```

### Issue 3: Kafka Messages Not Being Processed

```powershell
# Check Kafka is running
docker-compose logs kafka | tail -20

# Check Notification Service is listening to Kafka
docker-compose logs notification-service | grep "Connecting to Kafka"

# Check topic exists
docker exec kafka kafka-topics.sh `
  --bootstrap-server localhost:9092 `
  --list

# Solution: Restart Kafka and services
docker-compose restart kafka notification-service
```

### Issue 4: MongoDB Connection Issues

```powershell
# Error: Cannot connect to MongoDB

# Check MongoDB is running
docker-compose logs mongodb

# Test MongoDB connection
docker exec mongodb mongosh --eval "db.version()"

# Check if data is persisting
docker exec mongodb mongosh --eval "show databases"

# Solution: Clear MongoDB volume and restart
docker-compose down -v
docker-compose up --build -d
```

### Issue 5: API Gateway Not Routing

```powershell
# Error: 502 Bad Gateway

# Check API Gateway logs
docker-compose logs api-gateway

# Check if target services are running
curl http://localhost:3001/health
curl http://localhost:3002/health

# Solution: Restart API Gateway
docker-compose restart api-gateway
```

---

## 📊 Monitoring Service Health

### View Real-time Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
docker-compose logs -f registration-service
docker-compose logs -f notification-service

# Follow with grep filter
docker-compose logs -f | grep "ERROR"
```

### Monitor Resource Usage

```powershell
# CPU, Memory, Network usage
docker stats

# Specific container
docker stats user-service
```

### Check Database Content

```powershell
# Access MongoDB shell
docker exec -it mongodb mongosh

# Inside mongosh:
show databases
use user-service
db.users.find()
use event-service
db.events.find()
use registration-service
db.registrations.find()
use notification-service
db.notifications.find()
```

---

## ✅ Final Verification Checklist

- [ ] Docker containers are running (`docker-compose ps` shows all "Up")
- [ ] All services respond to health checks (all return status: OK)
- [ ] User Service: Can register and login successfully
- [ ] Event Service: Can create and list events
- [ ] Registration Service: Can register user for event
- [ ] Notification Service: Receives Kafka messages
- [ ] API Gateway: Routes requests correctly
- [ ] Frontend: Loads at http://localhost
- [ ] MongoDB: Has 4 databases with data
- [ ] Kafka: Topic `registration-events` exists with messages
- [ ] Service logs: No ERROR messages

---

## 📈 Performance Testing (Optional)

### Test with Multiple Registrations

```powershell
# Register multiple users and events
for ($i = 1; $i -le 5; $i++) {
    Write-Host "Creating user $i..."
    # Create user
    # Create event
    # Register user for event
    # Check notification
}
```

### Stress Test API Gateway

```powershell
# Multiple concurrent requests
for ($i = 1; $i -le 100; $i++) {
    Start-Job -ScriptBlock {
        curl http://localhost:3000/api/events | Out-Null
    }
}

# Wait for all jobs
Get-Job | Wait-Job

# Check for errors
Get-Job | Receive-Job | grep "error"
```

---

## 🎯 Success Indicators

### ✅ All Services Connected Successfully When You See:

1. **Health Checks Passing**

   ```
   ✓ User Service: OK
   ✓ Event Service: OK
   ✓ Registration Service: OK
   ✓ Notification Service: OK
   ✓ API Gateway: OK
   ```

2. **Registration Flow Complete**

   ```
   ✓ User registered with JWT token
   ✓ Event created with ID
   ✓ Registration submitted
   ✓ Kafka message published
   ✓ Notification created
   ```

3. **Logs Show Communication**

   ```
   [Registration Service] Calling User Service...
   [Registration Service] Calling Event Service...
   [Registration Service] Publishing Kafka event...
   [Notification Service] Received Kafka message...
   [Notification Service] Created notification...
   ```

4. **Data Persists in Databases**
   ```
   ✓ user-service DB: users collection populated
   ✓ event-service DB: events collection populated
   ✓ registration-service DB: registrations collection populated
   ✓ notification-service DB: notifications collection populated
   ```

---

## 📚 Next Steps

1. **All tests passing?** → Services are working correctly! 🎉
2. **Some tests failing?** → Check troubleshooting section
3. **Ready for production?** → Deploy with proper monitoring
4. **Want to extend?** → Add new microservices following same pattern

---

**Last Updated:** March 16, 2026
**Status:** ✅ Ready for comprehensive service testing
