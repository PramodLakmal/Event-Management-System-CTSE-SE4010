# 🚀 Quick Start Guide - Event Management System

## Prerequisites

- Docker & Docker Compose installed
- Git installed
- Basic understanding of microservices

## 5-Minute Setup

### Step 1: Clone & Navigate

```bash
cd Event-Management-System-CTSE-SE4010
```

### Step 2: Start Everything

```bash
docker-compose up --build
```

Wait for all services to be healthy (look for "Listening on port" messages).

### Step 3: Access the Application

- **Frontend:** http://localhost
- **API Gateway:** http://localhost:3000
- **Services:**
  - User Service: http://localhost:3001/health
  - Event Service: http://localhost:3002/health
  - Registration Service: http://localhost:3003/health
  - Notification Service: http://localhost:3004/health

## 🧪 Quick Test Flow

### 1. Register a User (Frontend)

- Navigate to http://localhost
- Click "Register"
- Fill in: Name, Email, Password
- Submit

### 2. Login

- Use registered credentials to login
- You'll be redirected to Events page

### 3. Browse Events

- View list of available events
- Click "View Details" on any event

### 4. Register for Event

- Click "Register for Event" button
- Confirmation will appear
- Event count will increment

### 5. Check Notifications

- Click "Notifications" in navbar
- You should see registration confirmation (after Kafka processes it)
- Check "My Registrations" to see your registrations

## 📊 System Architecture at a Glance

```
Frontend (React) → API Gateway → Microservices → MongoDB
                                      ↓
                                   Kafka
                                      ↓
                              Notification Service
```

## 🛑 Stopping the System

```bash
# Stop all services
docker-compose down

# Stop and remove data
docker-compose down -v
```

## 📱 Frontend Features

### Pages

- **Login/Register:** Authentication
- **Events:** Browse all events with search
- **Event Details:** View event info and register
- **My Registrations:** Manage your event registrations
- **Notifications:** View system notifications

### Real-time Features

- Notification badge showing unread count
- Automatic registration confirmation
- Event availability tracking

## 🔍 API Gateway Routes

All requests go through: `http://localhost:3000/api/`

```
/auth/login              → User Service
/users/register          → User Service
/events                  → Event Service
/registrations           → Registration Service
/notifications           → Notification Service
```

## 🐛 Common Issues & Solutions

### "Connection refused" errors

→ Wait 30 seconds for services to initialize

### Kafka "not reachable"

→ Check: `docker-compose logs kafka`

### "Cannot find module" errors

→ Try: `docker-compose down -v && docker-compose up --build`

### Port already in use

→ Check running containers: `docker ps`
→ Stop them: `docker stop <container_id>`

## 📚 Example Workflows

### Workflow 1: Event Registration Journey

1. Register new user via frontend
2. Browse events
3. Click event → View details → Register
4. Check My Registrations
5. Receive notification via Kafka

### Workflow 2: Test Service Communication

1. Register user (User Service called)
2. Register for event (Event Service called for availability)
3. Check notification created (Kafka event processed)

### Workflow 3: Test Microservices

1. Each service has `/health` endpoint
2. Each service is on separate port (3001-3004)
3. They communicate via HTTP and Kafka

## 🔐 Test Credentials (if seeded)

```
Email: test@example.com
Password: Test@123
```

## 📦 Services Included

| Service       | Port  | Purpose          |
| ------------- | ----- | ---------------- |
| API Gateway   | 3000  | Request routing  |
| User Service  | 3001  | Authentication   |
| Event Service | 3002  | Event management |
| Registration  | 3003  | Registrations    |
| Notification  | 3004  | Notifications    |
| Frontend      | 80    | Web interface    |
| MongoDB       | 27017 | Database         |
| Kafka         | 9092  | Message broker   |

## 🚀 Next Steps

1. **Explore the codebase:**
   - Check `user-service/`, `event-service/`, etc.
   - Review `docker-compose.yml` for configuration

2. **Run integration tests:**
   - Test registration flow end-to-end
   - Verify Kafka messaging

3. **Monitor services:**
   - Check logs: `docker-compose logs -f <service>`
   - Monitor performance

4. **Customize:**
   - Add more event types/categories
   - Extend notification channels (email, SMS)
   - Add admin panel

## 📖 Full Documentation

See `README.md` for comprehensive documentation covering:

- Architecture details
- API documentation
- Database schemas
- Deployment instructions
- Production checklist

## 💡 Tips

- Use frontend for user-friendly testing
- Use curl/Postman for API testing
- Monitor logs for debugging: `docker-compose logs -f`
- Services auto-restart on failure
- Data persists in Docker volumes

## 🆘 Need Help?

1. Check logs: `docker-compose logs service-name`
2. Verify services are running: `docker-compose ps`
3. Test health endpoints: `curl http://localhost:3001/health`
4. Review README.md for troubleshooting

---

**Happy testing! 🎉**

For more details, see the full README.md file.
