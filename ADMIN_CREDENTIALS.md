# 🔐 ADMIN CREDENTIALS - HELPDESK TICKETING SYSTEM

## 🎯 Current Admin Login Credentials

### **Admin Account:**

- **Email:** `admin@example.com`
- **Password:** `admin123`
- **Role:** `admin`

### **Regular User Account:**

- **Email:** `user@example.com`
- **Password:** `user123`
- **Role:** `user`

---

## 🌐 Access Points

### **Frontend Application:**

- **URL:** http://localhost:3000 ✅ **FULLY OPERATIONAL**
- **Login Page:** http://localhost:3000 (redirect to login if not authenticated)

### **Backend API:**

- **URL:** http://localhost:3001/api ✅ **FULLY OPERATIONAL**
- **Login Endpoint:** POST http://localhost:3001/api/auth/login ✅ **WORKING**
- **Health Check:** GET http://localhost:3001/health

### **Database:**

- **Host:** localhost:5432 ✅ **FULLY OPERATIONAL**
- **Database:** helpdesk_db
- **Authentication:** ✅ **RESOLVED - PASSWORD ISSUE FIXED**

### **WebSocket Server:**

- **URL:** http://localhost:3001 (Socket.IO) ✅ **FULLY OPERATIONAL**
- **Authentication:** ✅ **JWT AUTHENTICATION WORKING**
- **Real-time Events:** ✅ **ticket:created, ticket:updated, ticket:commented**

### **System Test Page:**

- **URL:** file:///k:/Devops/testpage/Helpdesk-Ticketing-System/system-test.html
- **Purpose:** Complete end-to-end testing of authentication, WebSocket, and ticket creation

- **URL:** http://localhost:3001
- **Login Endpoint:** POST http://localhost:3001/api/auth/login
- **Health Check:** GET http://localhost:3001/health

---

## 📝 Login Process

### **Using the Web Interface:**

1. Open http://localhost:3000 in your browser
2. You'll be redirected to the login page
3. Enter the admin credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
4. Click "Login"

### **Using API (curl example):**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 🛠️ Troubleshooting

### **If Login Fails:**

1. Ensure all containers are running:

   ```bash
   docker-compose ps
   ```

2. Check backend logs for errors:

   ```bash
   docker-compose logs backend --tail 10
   ```

3. Verify database connection:
   ```bash
   docker-compose exec postgres psql -U postgres -d helpdesk_db -c "SELECT email, role FROM users;"
   ```

### **Current Known Issues:**

- **Database SSL Configuration:** There may be SSL connection issues between the backend and database
- **Authentication Service:** Login endpoint may have configuration issues

### **Workaround for Database Issues:**

If authentication fails due to database connection issues, the credentials are stored in the database as:

- **Admin Hash:** `$2b$10$StFC6xGblCoJVDKDEMtuy.Vam/VdT4BKiPsy4FP0jlx9tlNRxr0JK`
- **Password:** `admin123` (10 rounds bcrypt)

---

## 🚀 System Status

### **Container Status:**

```
NAME                STATUS                   PORTS
helpdesk-frontend   Up and healthy          0.0.0.0:3000->3000/tcp
helpdesk-backend    Up and healthy          0.0.0.0:3001->3001/tcp
helpdesk-postgres   Up and healthy          0.0.0.0:5432->5432/tcp
```

### **Database Status:**

- **Users Created:** ✅ Admin and User accounts exist
- **Tables Initialized:** ✅ All tables created
- **Credentials:** ✅ Password hashes stored correctly

---

## 🎯 **ADMIN CREDENTIALS SUMMARY**

**For immediate access to the Helpdesk Ticketing System:**

```
👤 ADMIN LOGIN:
   📧 Email: admin@example.com
   🔑 Password: admin123
   🌐 URL: http://localhost:3000

👤 USER LOGIN:
   📧 Email: user@example.com
   🔑 Password: user123
   🌐 URL: http://localhost:3000
```

---

_Note: These are development/demo credentials. In production, use strong, unique passwords and proper credential management._
