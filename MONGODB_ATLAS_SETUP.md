# MongoDB Atlas Free Tier Setup Guide

## Creating 4 Databases for Microservices

This guide walks you through setting up a free MongoDB Atlas account and creating 4 databases for your Event Management System microservices.

---

## 📋 Prerequisites

- Email address (Gmail recommended)
- Phone number (optional, for verification)
- No credit card required for free tier

---

## ✅ Step 1: Create MongoDB Atlas Account

### Step 1.1: Visit MongoDB Atlas

1. Go to: **https://www.mongodb.com/cloud/atlas**
2. Click **"Try Free"** (green button on top right)

### Step 1.2: Sign Up

1. Choose how to sign up:
   - ✅ **Email & Password** (easiest)
   - Google Account
   - GitHub Account
2. Fill in the form:
   ```
   Email: your-email@gmail.com
   Password: Strong password (mix of uppercase, numbers, symbols)
   First Name: Your Name
   Last Name: Your Last Name
   ```
3. Check the box: **"I want to receive product updates and marketing emails"** (optional)
4. Click **"Create your Atlas account"**

### Step 1.3: Verify Email

1. Check your email inbox
2. Click the verification link from MongoDB
3. You'll be redirected to set up your organization

---

## 🏢 Step 2: Set Up Organization & Project

### Step 2.1: Organization Setup

1. **Organization Name**: Enter something like `Event-Management`
2. Click **"Continue"**

### Step 2.2: Create Project

1. **Project Name**: Enter `Event-Management-Project`
2. Click **"Create Project"**

---

## 🗄️ Step 3: Create a Free Tier Cluster

### Step 3.1: Create Cluster

1. You'll see the **Deployment** page
2. Click **"+ Create"** button (or "Build a Cluster")

### Step 3.2: Choose Cluster Type

1. You'll see **three options**:
   - Serverless
   - Dedicated Cluster
   - Shared Cluster ✅ **SELECT THIS (Free Tier)**
2. Click **"Create"** under Shared Cluster

### Step 3.3: Configure Free Cluster

1. **Cloud Provider**: AWS (or your preference)
2. **Region**: Select closest to you:
   - For India: `ap-south-1 (Mumbai)` ✅ Recommended
   - For USA: `us-east-1` (N. Virginia)
3. **Cluster Tier**:
   - Should show **M0 (Free)** automatically
   - Storage: 512 MB
4. **Cluster Name**:
   - Change to: `event-management-cluster`
5. Click **"Create Deployment"**

### Step 3.4: Security Quick Start

1. **Create a database user:**
   ```
   Username: admin
   Password: GenerateSecurePassword (or enter your own)
   ```

   - Click **"Generate Secure Password"** button
   - Copy the password somewhere safe! ⚠️
2. Click **"Create Database User"**

### Step 3.5: Add IP Address Whitelist

1. **Security → Network Access** (left sidebar)
2. Click **"+ Add IP Address"**
3. Choose:
   - **Option A (Development):**
     - Click **"Allow Access from Anywhere"**
     - Enter: `0.0.0.0/0`
   - **Option B (Secure):**
     - Enter your current IP: Click **"Add Current IP Address"**
4. Click **"Confirm"**

⏳ Wait for cluster to be created (usually 1-2 minutes)

---

## 📦 Step 4: Create Your First Database

### Step 4.1: Access Database

1. Click **"Database"** in left sidebar
2. You should see your cluster `event-management-cluster`
3. Click **"Browse Collections"** button

### Step 4.2: Create Database 1 (User Service)

1. Click **"+ Create Database"** button
2. Enter details:
   ```
   Database Name: user-service
   Collection Name: users
   ```
3. Click **"Create"**

You now have:

```
event-management-cluster
  └── user-service (Database)
      └── users (Collection)
```

### Step 4.3: Create Database 2 (Event Service)

1. From the cluster view, click **"+ Create Database"**
2. Enter:
   ```
   Database Name: event-service
   Collection Name: events
   ```
3. Click **"Create"**

### Step 4.4: Create Database 3 (Registration Service)

1. Click **"+ Create Database"**
2. Enter:
   ```
   Database Name: registration-service
   Collection Name: registrations
   ```
3. Click **"Create"**

### Step 4.5: Create Database 4 (Notification Service)

1. Click **"+ Create Database"**
2. Enter:
   ```
   Database Name: notification-service
   Collection Name: notifications
   ```
3. Click **"Create"**

---

## 🔗 Step 5: Get Connection String

### Step 5.1: Navigate to Cluster

1. Click **"Database"** in left sidebar
2. Find your cluster: `event-management-cluster`
3. Click **"Connect"** button

### Step 5.2: Get Connection String

1. Click **"Drivers"** option
2. Choose:
   - **Driver**: Node.js
   - **Version**: Latest
3. You'll see your connection string:
   ```
   mongodb+srv://admin:<password>@event-management-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5.3: Copy Connection String

1. Click the **copy icon** (📋)
2. Save it safely

---

## 🔐 Step 6: Create Environment Variables

Now create a `.env` file for each service with the connection string.

### For User Service

Create file: `user-service/.env`

```env
MONGODB_URI=mongodb+srv://admin:<YOUR_PASSWORD>@event-management-cluster.xxxxx.mongodb.net/user-service?retryWrites=true&w=majority
DB_NAME=user-service
PORT=3001
JWT_SECRET=your-secret-key-here
```

### For Event Service

Create file: `event-service/.env`

```env
MONGODB_URI=mongodb+srv://admin:<YOUR_PASSWORD>@event-management-cluster.xxxxx.mongodb.net/event-service?retryWrites=true&w=majority
DB_NAME=event-service
PORT=3002
```

### For Registration Service

Create file: `registration-service/.env`

```env
MONGODB_URI=mongodb+srv://admin:<YOUR_PASSWORD>@event-management-cluster.xxxxx.mongodb.net/registration-service?retryWrites=true&w=majority
DB_NAME=registration-service
PORT=3003
KAFKA_BROKERS=localhost:9092
```

### For Notification Service

Create file: `notification-service/.env`

```env
MONGODB_URI=mongodb+srv://admin:<YOUR_PASSWORD>@event-management-cluster.xxxxx.mongodb.net/notification-service?retryWrites=true&w=majority
DB_NAME=notification-service
PORT=3004
KAFKA_BROKERS=localhost:9092
```

### Important: Replace Placeholders

- Replace `<YOUR_PASSWORD>` with your database password
- Replace `xxxxx` with your cluster ID (from connection string)

---

## 🧪 Step 7: Test Connection

### Using MongoDB Compass (GUI Tool)

1. Download: **https://www.mongodb.com/products/compass**
2. Install and open
3. Click **"New Connection"**
4. Paste your connection string:
   ```
   mongodb+srv://admin:<password>@event-management-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Click **"Connect"**
6. You should see your 4 databases! ✅

### Using MongoDB Shell (Command Line)

```bash
# Install MongoDB Shell if needed
# https://www.mongodb.com/try/download/shell

mongosh "mongodb+srv://admin:<password>@event-management-cluster.xxxxx.mongodb.net/"

# In shell, list databases:
show databases

# You should see:
# user-service
# event-service
# registration-service
# notification-service
```

---

## 🚀 Step 8: Connect Your Services

Update each service's connection code:

### Node.js Connection Example

```javascript
const mongoose = require("mongoose");

const mongoURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:<password>@event-management-cluster.xxxxx.mongodb.net/user-service?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));
```

### Environment Configuration

Each service connects to its own database by simply changing the database name in the connection string:

```
/user-service        (for User Service)
/event-service       (for Event Service)
/registration-service (for Registration Service)
/notification-service (for Notification Service)
```

---

## 📊 Verify Setup

### Check Atlas Dashboard

1. Login to MongoDB Atlas: **https://cloud.mongodb.com**
2. Click **"Deployments"** → **"Database"**
3. Click your cluster name
4. Click **"Browse Collections"**
5. Verify you see all 4 databases:
   - ✅ user-service
   - ✅ event-service
   - ✅ registration-service
   - ✅ notification-service

### Check Storage Usage

1. Go to **"Deployments"** → **"Database"**
2. Click your cluster
3. Check **"Storage"** tab
4. Should show usage (will be minimal initially)
5. Free tier limit: **512 MB**

---

## ⚙️ Monitoring & Management

### View Database Stats

1. Click **"Metrics"** tab to see:
   - Storage usage
   - Document count
   - Performance metrics
   - Memory usage

### Manage Collections

1. Go to **"Browse Collections"**
2. Select database → collection
3. View/edit documents
4. Create indexes if needed

### Backup Settings

1. Free tier includes: **Basic backup (7 days retention)**
2. Go to **"Backup"** tab to configure

---

## 🔒 Security Best Practices

### 1. Change Default Password

1. Go to **"Database Access"**
2. Find your user `admin`
3. Click **"Edit"**
4. Set a strong password
5. Click **"Update User"**

### 2. Restrict IP Addresses

1. Go to **"Network Access"**
2. Remove **"0.0.0.0/0"** if used for development
3. Add only your IP addresses:
   - Your laptop IP
   - Your server IP
   - Your office IP

### 3. Enable Two-Factor Authentication

1. Go to **Account Settings** (top right)
2. Click **"Security"**
3. Enable **"Two-Factor Authentication"**

---

## 🐛 Troubleshooting

### Connection Timeout

**Problem:** Can't connect to MongoDB Atlas

```
Error: getaddrinfo ENOTFOUND
```

**Solution:**

1. Check IP is whitelisted: **Network Access** → Verify your IP
2. Check password is correct in connection string
3. Check internet connection
4. Wait 5-10 minutes after creating cluster

### Authentication Failed

**Problem:**

```
Error: authentication failed
```

**Solution:**

1. Verify username: Should be `admin`
2. Verify password matches what you set
3. Check password doesn't have special characters that need URL encoding
4. Reset password in "Database Access"

### Cluster Not Ready

**Problem:**

```
Error: Cluster is initializing
```

**Solution:**

- Wait 2-3 minutes for cluster to fully start
- Refresh the page
- Check status in "Deployments" → "Database"

### Free Tier Storage Full

**Problem:** Getting storage exceeded errors

```
Error: Exceeded storage limit for free tier
```

**Solution:**

- Delete old/test data
- Upgrade to paid tier
- Create new cluster (limited to 1 per free account)

---

## 📈 Scaling Up (When Needed)

### When to Upgrade

- Approaching 512 MB storage limit
- Need higher performance
- Need more than 1 cluster

### Upgrade Path

1. Go to **"Deployments"** → **"Database"**
2. Click your cluster
3. Click **"Modify"**
4. Upgrade from **M0** to **M2** or higher
5. Enter payment information
6. Click **"Confirm"**

---

## ✅ Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created free tier cluster (M0)
- [ ] Created database user with password
- [ ] Added IP whitelist
- [ ] Waited for cluster to be active
- [ ] Created 4 databases:
  - [ ] user-service
  - [ ] event-service
  - [ ] registration-service
  - [ ] notification-service
- [ ] Got connection string
- [ ] Created .env files for all services
- [ ] Tested connection with MongoDB Compass
- [ ] Verified all 4 databases appear in dashboard
- [ ] Updated service code with connection strings

---

## 🎯 Next Steps

1. **Update your services** with MongoDB Atlas connection strings
2. **Test each service** individually
3. **Run docker-compose** with your microservices
4. **Monitor storage usage** as you add data
5. **Set up backups** if using for production

---

## 📚 Useful Links

- **MongoDB Atlas Documentation:** https://docs.atlas.mongodb.com/
- **Connection String Format:** https://docs.mongodb.com/manual/reference/connection-string/
- **MongoDB Compass Download:** https://www.mongodb.com/products/compass
- **MongoDB Shell Download:** https://www.mongodb.com/try/download/shell
- **Support & Help:** https://support.mongodb.com/

---

## 💡 Pro Tips

1. **Keep credentials safe!** Never commit passwords to Git
2. **Use environment variables** for all sensitive data
3. **Monitor free tier limits** - 512 MB fills up faster than you think
4. **Create backups** before major changes
5. **Use MongoDB Compass** for easier data management
6. **Set up alerts** in "Alerts" section for quota limits

---

## 🆘 Still Stuck?

1. Check MongoDB Atlas status: https://status.mongodb.com/
2. View MongoDB Atlas logs for detailed error messages
3. Contact MongoDB Support: https://support.mongodb.com/
4. Check your email for verification or security alerts

---

**Created:** March 16, 2026
**Status:** ✅ Ready to use with your Event Management System
