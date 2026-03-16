# User Service - Event Management System

A microservice for user management in the Event Management System. Handles user registration, authentication, and profile management.

## Features

- ✅ User Registration with password hashing
- ✅ User Login with JWT authentication
- ✅ User Profile Management
- ✅ Password security with bcrypt
- ✅ JWT token-based authorization
- ✅ Input validation with Joi
- ✅ Error handling
- ✅ Docker containerization
- ✅ MongoDB integration
- ✅ CORS support

## Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Docker and Docker Compose (optional)
- npm or yarn

## Installation

### Option 1: Local Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd user-service
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure secret key
   - `PORT`: Service port (default: 3001)

4. **Start the service**
   ```bash
   npm start
   ```

### Option 2: Docker Setup

1. **Build and run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

   The service will be available at `http://localhost:3001`

## API Endpoints

### Public Routes

#### Register User

```http
POST /users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "123456"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@email.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User

```http
POST /users/login
Content-Type: application/json

{
  "email": "john@email.com",
  "password": "123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@email.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Protected Routes (Requires JWT Token)

Add the token to request headers:

```
Authorization: Bearer <token>
```

#### Get Current User Profile

```http
GET /users/profile/me
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@email.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "role": "user",
      "isActive": true,
      "createdAt": "2026-03-16T10:00:00Z",
      "updatedAt": "2026-03-16T10:00:00Z"
    }
  }
}
```

#### Get User by ID

```http
GET /users/{id}
Authorization: Bearer <token>
```

#### Update User Profile

```http
PUT /users/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890",
  "address": "456 Oak Ave"
}
```

#### Delete User Account

```http
DELETE /users/{id}
Authorization: Bearer <token>
```

#### Get All Users (Admin Only)

```http
GET /users?page=1&limit=10
Authorization: Bearer <admin-token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@email.com",
        "role": "user",
        "isActive": true,
        "createdAt": "2026-03-16T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### Health Check

```http
GET /health
```

**Response (200):**

```json
{
  "success": true,
  "message": "User Service is running",
  "service": "user-service",
  "timestamp": "2026-03-16T10:00:00.000Z"
}
```

## Project Structure

```
user-service/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── userController.js    # Business logic
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   └── User.js              # User schema and model
│   ├── routes/
│   │   └── userRoutes.js        # API routes
│   ├── utils/
│   │   └── jwt.js               # JWT token generation
│   └── validators/
│       └── userValidator.js     # Input validation schemas
├── app.js                        # Express application setup
├── package.json                  # Dependencies
├── Dockerfile                    # Docker image definition
├── docker-compose.yml            # Multi-container setup
├── .env.example                  # Environment variables template
└── README.md                     # This file
```

## Environment Variables

| Variable       | Description                          | Default      |
| -------------- | ------------------------------------ | ------------ |
| `MONGODB_URI`  | MongoDB connection string            | -            |
| `PORT`         | Service port                         | 3001         |
| `NODE_ENV`     | Environment (development/production) | development  |
| `JWT_SECRET`   | Secret key for JWT signing           | -            |
| `JWT_EXPIRE`   | JWT token expiration time            | 7d           |
| `SERVICE_NAME` | Service name                         | user-service |

## Security Features

- **Password Hashing**: Bcrypt with salt rounds (10)
- **JWT Authentication**: Token-based authorization
- **Input Validation**: Joi schema validation
- **Error Handling**: Secure error messages in production
- **CORS**: Configurable cross-origin requests
- **Environment Variables**: Sensitive data management

## Development

### Run in Development Mode

```bash
npm run dev
```

This uses `nodemon` to automatically restart on file changes.

### Run Tests

```bash
npm test
```

## Deployment

### Build Docker Image

```bash
docker build -t user-service:1.0.0 .
```

### Push to Docker Hub

```bash
docker tag user-service:1.0.0 your-username/user-service:1.0.0
docker push your-username/user-service:1.0.0
```

### Deploy to AWS ECS

Refer to AWS documentation for ECS deployment using the Docker image.

## Integration with Other Services

The User Service provides authentication verification for other microservices:

### Example: Registration Service calling User Service

```javascript
// Verify user exists
const userResponse = await fetch("http://user-service:3001/users/{userId}", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Error Handling

Common error responses:

| Status | Message                   | Reason                    |
| ------ | ------------------------- | ------------------------- |
| 400    | Validation failed         | Invalid input data        |
| 400    | User already exists       | Email duplicate           |
| 401    | Invalid email or password | Login failed              |
| 401    | No token provided         | Missing JWT token         |
| 403    | Invalid or expired token  | Token verification failed |
| 404    | User not found            | User ID doesn't exist     |
| 500    | Internal Server Error     | Server error              |

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, whitelist your IP

### JWT Token Errors

- Ensure token is properly formatted in Authorization header
- Token format: `Bearer <token>`
- Check if token has expired

### CORS Issues

- Verify CORS middleware is enabled
- Check allowed origins

## Performance Considerations

- JWT tokens are stateless (no database lookup needed)
- Passwords are never returned in responses
- Database indexes on email field for quick lookups
- Pagination support for user listing

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting
- [ ] Audit logging
- [ ] User roles and permissions system
- [ ] Social login integration

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
