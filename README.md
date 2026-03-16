# Event Management System - Microservices Architecture

A comprehensive microservices-based Event Management System with inter-service communication, asynchronous messaging, and a modern React frontend.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                    Port: 80 (via Nginx)                        │
└───────────────────────────────────────┬─────────────────────────┘
                                        │
                    ┌───────────────────┘
                    │
        ┌───────────▼──────────────┐
        │    API GATEWAY           │
        │    (Express)             │
        │    Port: 3000            │
        └───────────┬───────────────┘
                    │
        ┌───────────┼────────────────────────────────────────┐
        │           │                                        │
┌───────▼──┐  ┌────▼──────┐  ┌──────────┐  ┌──────────┐   │
│   USER   │  │   EVENT   │  │REGIST-   │  │NOTIF-    │   │
│  SERVICE │  │  SERVICE  │  │RATION    │  │ICATION   │   │
│Ports:   │  │Ports:     │  │SERVICE   │  │SERVICE   │   │
│3001     │  │3002       │  │Port:3003 │  │Port:3004 │   │
└─────┬───┘  └────┬──────┘  └────┬─────┘  └─────┬────┘   │
      │           │               │              │         │
      └─────────┬─┴────────────────┴──────────────┴─────────┘
                │
        ┌───────▼────────────────────┐
        │     MONGODB (Database)     │
        │     Port: 27017            │
        │   - user-service           │
        │   - event-service          │
        │   - registration-service   │
        │   - notification-service   │
        └────────────────────────────┘

            MESSAGE BROKER (Kafka)
       ┌──────────────────────────────┐
       │  Topic: registration-events  │
       │  Events:                     │
       │  - USER_REGISTERED           │
       │  - REGISTRATION_CANCELLED    │
       └──────────────────────────────┘
```

## 🚀 Services Overview

### 1. **User Service** (Port: 3001)

- User authentication and registration
- JWT token management
- User profile management
- Database: MongoDB (user-service)

**Endpoints:**

- `POST /api/auth/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/users/:userId` - Get user details

### 2. **Event Service** (Port: 3002)

- Event creation and management
- Event availability tracking
- Event filtering and search
- Database: MongoDB (event-service)

**Endpoints:**

- `GET /api/events` - Get all events (paginated)
- `GET /api/events/:eventId` - Get event details
- `POST /api/events` - Create event
- `PUT /api/events/:eventId` - Update event
- `DELETE /api/events/:eventId` - Delete event
- `GET /api/events/:eventId/availability` - Check event availability

### 3. **Registration Service** (Port: 3003)

- Handles user event registrations
- Coordinates with User and Event services
- Publishes Kafka events for notifications
- Database: MongoDB (registration-service)
- **Communication Pattern:** Service Choreography

**Endpoints:**

- `POST /api/registrations` - Register for event
- `GET /api/registrations/user/:userId` - Get user registrations
- `GET /api/registrations/event/:eventId` - Get event registrations
- `DELETE /api/registrations/:registrationId` - Cancel registration

**Registration Flow:**

1. Verify user exists (calls User Service)
2. Check event availability (calls Event Service)
3. Register user for event (calls Event Service)
4. Save registration record in database
5. Publish USER_REGISTERED event to Kafka

### 4. **Notification Service** (Port: 3004)

- Consumes Kafka messages
- Manages user notifications
- Simulates email sending
- Database: MongoDB (notification-service)

**Endpoints:**

- `GET /api/notifications/user/:userId` - Get user notifications
- `PUT /api/notifications/:notificationId/mark-read` - Mark as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `GET /api/notifications/user/:userId/unread-count` - Get unread count

**Kafka Consumer:**

- Topic: `registration-events`
- Listens for: USER_REGISTERED, REGISTRATION_CANCELLED events
- Creates notification records and simulates email notifications

### 5. **API Gateway** (Port: 3000)

- Single entry point for all client requests
- Request routing to microservices
- Rate limiting and logging
- CORS handling

### 6. **Frontend** (Port: 80)

- React-based single-page application
- User authentication and management
- Event browsing and search
- Event registration management
- Real-time notification display
- Responsive design

## 🛠️ Technology Stack

### Backend Services

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** Bcrypt
- **Message Broker:** Apache Kafka
- **HTTP Client:** Axios

### Frontend

- **Framework:** React 18
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** CSS3
- **Notifications:** React Toastify
- **Server:** Nginx

### DevOps

- **Containerization:** Docker
- **Orchestration:** Docker Compose
- **Container Registry:** Docker Hub (optional)

## 📋 Prerequisites

Before running the system, ensure you have installed:

- [Docker](https://www.docker.com/products/docker-desktop) (v20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (v1.29 or higher)
- [Node.js](https://nodejs.org/) 18 LTS (for local development)
- [npm](https://www.npmjs.com/) (v8 or higher)

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Event-Management-System-CTSE-SE4010
   ```

2. **Start all services:**

   ```bash
   docker-compose up --build
   ```

   This will start:
   - Zookeeper (port 2181)
   - Kafka (port 9092)
   - MongoDB (port 27017)
   - User Service (port 3001)
   - Event Service (port 3002)
   - Registration Service (port 3003)
   - Notification Service (port 3004)
   - API Gateway (port 3000)
   - Frontend (port 80)

3. **Access the application:**
   - Frontend: http://localhost
   - API Gateway: http://localhost:3000/api
   - Health checks available at each service `/health` endpoint

### Option 2: Local Development Setup

#### Start Infrastructure Services

1. **Start Kafka with Docker:**
   ```bash
   docker run -d --name zookeeper -p 2181:2181 confluentinc/cp-zookeeper:latest
   docker run -d --name kafka -p 9092:9092 confluentinc/cp-kafka:latest
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```

#### Setup Each Microservice

1. **User Service:**

   ```bash
   cd user-service
   npm install
   cp .env.example .env
   npm run dev
   ```

2. **Event Service:**

   ```bash
   cd event-service
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Registration Service:**

   ```bash
   cd registration-service
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Notification Service:**

   ```bash
   cd notification-service
   npm install
   cp .env.example .env
   npm run dev
   ```

5. **API Gateway:**

   ```bash
   cd api-gateway
   npm install
   cp .env.example .env
   npm run dev
   ```

6. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📚 API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Sample API Calls

#### User Registration

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### User Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get Events

```bash
curl -X GET http://localhost:3000/api/events?page=1&limit=10 \
  -H "Authorization: Bearer <TOKEN>"
```

#### Register for Event

```bash
curl -X POST http://localhost:3000/api/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "userId": "user_id_here",
    "eventId": "event_id_here"
  }'
```

## 🔄 Inter-Service Communication Patterns

### Synchronous (HTTP/REST)

The Registration Service communicates synchronously with:

- **User Service**: Verify user exists
- **Event Service**: Check availability and register user

**Example Flow:**

```
Client → Registration Service
         ↓ (verify user)
         User Service
         ↓ (response)
         Registration Service
         ↓ (check availability)
         Event Service
         ↓ (response)
         Registration Service → Kafka (publish)
         ↓
         Client
```

### Asynchronous (Message Queue)

Kafka topics used:

- **registration-events**: Published by Registration Service, consumed by Notification Service

**Event Schema:**

```json
{
  "type": "USER_REGISTERED",
  "userId": "user123",
  "eventId": "event456",
  "registrationId": "reg789",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "correlationId": "correlation123",
  "timestamp": "2024-03-16T10:00:00Z"
}
```

## 🗄️ Database Models

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  date: Date,
  time: String,
  location: String,
  capacity: Number,
  registeredCount: Number,
  status: String (enum: upcoming, ongoing, completed, cancelled),
  organizer: String,
  agenda: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Registration Collection

```javascript
{
  _id: ObjectId,
  userId: String (unique with eventId),
  eventId: String (unique with userId),
  status: String (enum: pending, confirmed, cancelled),
  registrationDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Collection

```javascript
{
  _id: ObjectId,
  userId: String,
  type: String (enum: registration, cancellation, reminder, update),
  title: String,
  message: String,
  eventId: String,
  channel: String (enum: email, sms, in-app),
  status: String (enum: pending, sent, failed),
  metadata: Object,
  sentAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing the System

### 1. Test User Registration

```bash
# Register a new user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

### 2. Test User Login

```bash
# Login and get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
# Save the token from response
```

### 3. Test Event Management

```bash
# Get all events
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Inter-Service Communication

```bash
# Register user for event (triggers synchronous calls)
curl -X POST http://localhost:3000/api/registrations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "YOUR_USER_ID",
    "eventId": "YOUR_EVENT_ID"
  }'
# Watch logs to see: User Service call → Event Service call → Kafka publish
```

### 5. Test Notification System

```bash
# Get user notifications (created by Kafka consumer)
curl -X GET http://localhost:3000/api/notifications/user/YOUR_USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Monitoring and Logs

### View Service Logs

```bash
# Using Docker Compose
docker-compose logs -f user-service
docker-compose logs -f event-service
docker-compose logs -f registration-service
docker-compose logs -f notification-service
docker-compose logs -f api-gateway

# View specific error messages
docker-compose logs api-gateway | grep error
```

### Health Checks

Each service exposes a health endpoint:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3000/health
```

## 🐛 Troubleshooting

### Kafka Connection Issues

```bash
# Check Kafka is running
docker-compose logs kafka

# Verify Kafka broker
docker exec kafka kafka-broker-api-versions.sh --bootstrap-server localhost:9092
```

### MongoDB Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify MongoDB is accessible
docker exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Service Communication Failures

1. Check firewall settings
2. Verify Docker network: `docker network ls`
3. Check service environment variables
4. Review service logs for specific errors

## 🔒 Security Considerations

1. **JWT Tokens**: Change JWT_SECRET in production
2. **Password Hashing**: Using bcrypt with salt rounds = 10
3. **Rate Limiting**: API Gateway implements rate limiting
4. **CORS**: Configured per service
5. **MongoDB**: Add authentication in production
6. **Kafka**: Add SSL/TLS configuration in production

## 📈 Scaling Considerations

### Horizontal Scaling

- Services can be deployed in multiple instances
- Use load balancer (e.g., Nginx, HAProxy) in front of API Gateway
- MongoDB can be configured with replica sets

### Database Optimization

- Add indexes on frequently queried fields
- Consider sharding for large collections
- Implement query caching

### Message Queue Scaling

- Increase Kafka broker replicas
- Adjust consumer group settings
- Monitor lag with `kafka-lag-exporter`

## 🚀 Deployment

### Production Checklist

- [ ] Update JWT_SECRET with secure random value
- [ ] Enable MongoDB authentication
- [ ] Configure Kafka SSL/TLS
- [ ] Set up load balancer
- [ ] Enable HTTPS/SSL on API Gateway
- [ ] Configure proper CORS origins
- [ ] Set up centralized logging (ELK Stack)
- [ ] Configure monitoring (Prometheus + Grafana)
- [ ] Set up automated backups
- [ ] Configure health checks and auto-restart policies

### Docker Registry Push

```bash
# Tag images
docker tag event-management-system-user-service:latest your-registry/user-service:latest
docker tag event-management-system-api-gateway:latest your-registry/api-gateway:latest

# Push to registry
docker push your-registry/user-service:latest
docker push your-registry/api-gateway:latest
```

## 📖 API Reference

Full API documentation is available in the POSTMAN collection (if included).

## 🤝 Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Project Lead: [Your Name]
- Backend Developers: [Team Members]
- Frontend Developer: [Team Members]
- DevOps Engineer: [Team Members]

## 📞 Support

For support, email support@eventmanagementsystem.com or open an issue in the repository.

---

**Last Updated:** March 16, 2024
**Version:** 1.0.0
