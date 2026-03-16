# API Documentation for User Service

## Overview

This document provides comprehensive API documentation for the User Service microservice in the Event Management System.

## Base URL

```
http://localhost:3001
```

## Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow a consistent JSON format:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data varies by endpoint
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Endpoints

### 1. Register User

**Endpoint:** `POST /users/register`

**Authentication:** No

**Description:** Create a new user account with email and password.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "securePassword123"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | User's full name (min: 2, max: 100 chars) |
| email | string | Yes | Valid email address (must be unique) |
| password | string | Yes | Password (min: 6 chars) |

**Response (201 Created):**

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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTYxNjM5MTAyNSwiZXhwIjoxNjE2OTk1ODI1fQ.qH6KyAqq0jQ2gGj5kpZbJgNVwJkWpEz6H6Q1P1x5nVE"
  }
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 400 | Validation error | Invalid input data |
| 400 | Email already exists | User with email already registered |

---

### 2. Login User

**Endpoint:** `POST /users/login`

**Authentication:** No

**Description:** Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "john@email.com",
  "password": "securePassword123"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

**Response (200 OK):**

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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTYxNjM5MTAyNSwiZXhwIjoxNjE2OTk1ODI1fQ.qH6KyAqq0jQ2gGj5kpZbJgNVwJkWpEz6H6Q1P1x5nVE"
  }
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 401 | Invalid email or password | Login credentials incorrect |
| 403 | User account is inactive | Account has been deactivated |

---

### 3. Get Current User Profile

**Endpoint:** `GET /users/profile/me`

**Authentication:** Yes (Required)

**Description:** Get the profile of the currently logged-in user.

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@email.com",
      "phone": "+1234567890",
      "address": "123 Main Street, City, State 12345",
      "role": "user",
      "isActive": true,
      "createdAt": "2026-03-16T10:00:00.000Z",
      "updatedAt": "2026-03-16T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 401 | No token provided | Missing JWT token |
| 403 | Invalid or expired token | Token verification failed |
| 404 | User not found | User ID not found |

---

### 4. Get User by ID

**Endpoint:** `GET /users/{id}`

**Authentication:** Yes (Required)

**Description:** Get profile information of a specific user by ID.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User's MongoDB ObjectId |

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@email.com",
      "phone": "+1234567890",
      "address": "123 Main Street",
      "role": "user",
      "isActive": true,
      "createdAt": "2026-03-16T10:00:00.000Z",
      "updatedAt": "2026-03-16T10:30:00.000Z"
    }
  }
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 401 | No token provided | Missing JWT token |
| 404 | User not found | User ID doesn't exist |

---

### 5. Update User Profile

**Endpoint:** `PUT /users/{id}`

**Authentication:** Yes (Required)

**Description:** Update user profile information. Users can only update their own profile unless they are admin.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User's MongoDB ObjectId |

**Request Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Updated",
  "phone": "+1234567890",
  "address": "456 Oak Avenue, City, State"
}
```

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | User's full name |
| phone | string | No | Phone number |
| address | string | No | Physical address |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Updated",
      "email": "john@email.com",
      "phone": "+1234567890",
      "address": "456 Oak Avenue",
      "role": "user",
      "isActive": true,
      "createdAt": "2026-03-16T10:00:00.000Z",
      "updatedAt": "2026-03-16T11:00:00.000Z"
    }
  }
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 400 | Validation error | Invalid input data |
| 403 | No permission | Cannot update another user's profile |
| 404 | User not found | User ID doesn't exist |

---

### 6. Delete User Account

**Endpoint:** `DELETE /users/{id}`

**Authentication:** Yes (Required)

**Description:** Delete a user account. Users can only delete their own account unless they are admin.

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User's MongoDB ObjectId |

**Request Headers:**

```
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 403 | No permission | Cannot delete another user's account |
| 404 | User not found | User ID doesn't exist |

---

### 7. Get All Users (Admin Only)

**Endpoint:** `GET /users?page=1&limit=10`

**Authentication:** Yes (Required - Admin only)

**Description:** Retrieve a paginated list of all users. Only accessible to admin users.

**Request Headers:**

```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (starts at 1) |
| limit | integer | 10 | Number of results per page |

**Response (200 OK):**

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
        "createdAt": "2026-03-16T10:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Jane Smith",
        "email": "jane@email.com",
        "role": "user",
        "isActive": true,
        "createdAt": "2026-03-15T15:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 10,
      "pages": 3
    }
  }
}
```

**Error Responses:**
| Status | Error | Reason |
|--------|-------|--------|
| 403 | No permission | User is not admin |

---

### 8. Health Check

**Endpoint:** `GET /health`

**Authentication:** No

**Description:** Check if the User Service is running and healthy.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User Service is running",
  "service": "user-service",
  "timestamp": "2026-03-16T10:30:00.000Z"
}
```

---

## Status Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid request data      |
| 401  | Unauthorized - Authentication failed    |
| 403  | Forbidden - Permission denied           |
| 404  | Not Found - Resource not found          |
| 500  | Internal Server Error - Server error    |

---

## Example Usage

### cURL

**Register:**

```bash
curl -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@email.com",
    "password": "123456"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3001/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@email.com",
    "password": "123456"
  }'
```

**Get Profile:**

```bash
curl -X GET http://localhost:3001/users/profile/me \
  -H "Authorization: Bearer <token>"
```

### JavaScript/Fetch

**Register:**

```javascript
const response = await fetch("http://localhost:3001/users/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@email.com",
    password: "123456",
  }),
});
const data = await response.json();
console.log(data);
```

**Login:**

```javascript
const response = await fetch("http://localhost:3001/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "john@email.com",
    password: "123456",
  }),
});
const data = await response.json();
const token = data.data.token;
```

---

## Error Handling

The API uses standard HTTP status codes and returns descriptive error messages:

```json
{
  "success": false,
  "message": "Error description here"
}
```

In development mode, additional error details are included:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "name": "Error",
    "message": "Full error details..."
  }
}
```

---

## Rate Limiting

Currently, the User Service does not implement rate limiting. For production deployment, consider adding rate limiting middleware to prevent abuse.

## CORS

The service is configured with CORS enabled. Default allowed origins are all (`*`).

---

## Troubleshooting

### Common Issues

**"No token provided" error**

- Ensure you're including the Authorization header
- Format: `Authorization: Bearer <token>`

**"Invalid or expired token" error**

- Token has expired (default expiry: 7 days)
- Re-authenticate by logging in again

**"User already exists" error**

- Email is already registered
- Use a different email or login with existing account

**MongoDB Connection Error**

- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- For MongoDB Atlas, verify IP whitelist

---

## Support

For issues or questions, please contact the development team or create an issue in the repository.
