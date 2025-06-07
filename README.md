# 🎫 Helpdesk Ticketing System

A modern, full-stack helpdesk ticketing system with real-time updates, built with React, Node.js, PostgreSQL, and deployed with Docker.

## 🏗️ Architecture

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Real-time**: WebSocket/Socket.IO with JWT authentication
- **Deployment**: Docker & Docker Compose
- **Infrastructure**: Terraform for cloud deployment (optional)

## 🚀 Features

### User Features

- ✅ User registration and authentication (JWT)
- ✅ Create support tickets with priority levels
- ✅ View personal ticket history
- ✅ Responsive web interface

### Admin Features

- ✅ View all tickets with filtering options
- ✅ Update ticket status (open, in_progress, resolved)
- ✅ User management capabilities
- ✅ Delete tickets (cleanup)

### Technical Features

- ✅ REST API with proper error handling
- ✅ JWT-based authentication with 256-bit secrets
- ✅ Input validation and SQL injection prevention
- ✅ HTTPS ready with security headers
- ✅ Automated deployment pipeline
- ✅ Infrastructure as Code (Terraform)

### 🔒 Security Features

- ✅ **Enterprise-grade Authentication**: JWT with secure 256-bit secrets
- ✅ **Password Security**: OWASP-compliant validation (12+ chars, complexity requirements)
- ✅ **Rate Limiting**: Configurable limits to prevent brute force attacks
- ✅ **Account Protection**: Automatic lockout after failed login attempts
- ✅ **Session Management**: Secure session tracking with blacklisting
- ✅ **Input Sanitization**: XSS and injection attack prevention
- ✅ **Security Headers**: Comprehensive HTTP security headers via Helmet.js
- ✅ **CSRF Protection**: Cross-Site Request Forgery protection
- ✅ **Secure Environment**: All secrets properly protected and gitignored

## 📁 Project Structure

```
helpdesk-ticketing-system/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── index.js           # Entry point
│   │   ├── db.js              # Database connection
│   │   ├── routes/
│   │   │   ├── auth.js        # Authentication routes
│   │   │   └── tickets.js     # Ticket API routes
│   │   └── middleware/
│   │       └── auth.js        # JWT middleware
│   ├── .env                   # Environment variables
│   ├── package.json           # Node.js dependencies
│   └── nginx.conf             # NGINX configuration
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── components/
│   │   │   ├── Login.js       # Login form
│   │   │   ├── Register.js    # Registration form
│   │   │   ├── TicketForm.js  # Ticket creation form
│   │   │   └── TicketList.js  # Ticket dashboard
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Tailwind CSS
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind configuration
│
├── terraform/                  # GCP Infrastructure
│   ├── main.tf                # Main Terraform config
│   ├── variables.tf           # Terraform variables
│   ├── outputs.tf             # Terraform outputs
│   └── terraform.tfvars.example # Example variables
│
├── .github/workflows/          # CI/CD Pipeline
│   └── deploy.yml             # GitHub Actions workflow
│
└── README.md                  # This file
```

## 🛠️ Local Development Setup

### Prerequisites

- Node.js 20.11.1 or later
- PostgreSQL 16 or later
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd helpdesk-ticketing-system
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Start the backend server
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install

# Start the development server
npm start
```

### 4. Setup Database

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE helpdesk_db;
CREATE USER helpdesk_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE helpdesk_db TO helpdesk_user;

-- The backend will automatically create tables on first run
```

### 5. Create Demo Accounts

```bash
# Use the registration endpoint or insert directly:
curl -X POST http://localhost:3001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@example.com","password":"admin123","role":"admin"}'

curl -X POST http://localhost:3001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"user123"}'
```

## 🌐 Production Deployment

### 1. GCP Setup

1. Create a GCP project
2. Enable required APIs:
   - Compute Engine API
   - Cloud SQL API
   - VPC API
3. Create a service account with necessary permissions
4. Download service account key as `terraform/credentials.json`

### 2. Terraform Deployment

```bash
cd terraform

# Copy and edit variables
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply infrastructure
terraform apply
```

### 3. GitHub Actions Setup

Configure these secrets in your GitHub repository:

```
GCP_SSH_KEY=<private-ssh-key>
GCP_VM_IP=<vm-external-ip>
DB_HOST=<cloud-sql-ip>
DB_NAME=helpdesk_db
DB_USER=helpdesk_user
DB_PASSWORD=<your-db-password>
JWT_SECRET=<your-jwt-secret>
```

### 4. Deploy Application

Push to main branch to trigger automated deployment:

```bash
git push origin main
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Ticket Endpoints

#### Create Ticket

```http
POST /api/tickets
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "subject": "Login Issue",
  "message": "Cannot access my account",
  "priority": "high"
}
```

#### Get Tickets

```http
GET /api/tickets?page=1&limit=10
Authorization: Bearer <jwt-token>
```

#### Update Ticket Status (Admin Only)

```http
PATCH /api/tickets/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "resolved"
}
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=production
PORT=3001
DB_HOST=<database-host>
DB_PORT=5432
DB_NAME=helpdesk_db
DB_USER=helpdesk_user
DB_PASSWORD=<secure-password>
JWT_SECRET=<secure-jwt-secret>
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES users(email),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚨 Troubleshooting

### Common Issues

1. **Backend won't start**

   - Check database connection
   - Verify environment variables
   - Ensure PostgreSQL is running

2. **Frontend build fails**

   - Clear node_modules and reinstall
   - Check for syntax errors
   - Verify all dependencies are installed

3. **Deployment fails**

   - Check GitHub secrets configuration
   - Verify SSH key permissions
   - Check VM accessibility

4. **Database connection errors**
   - Verify Cloud SQL instance is running
   - Check firewall rules
   - Confirm credentials are correct

### Health Checks

- Backend: `curl http://localhost:3001/health`
- Frontend: Access `http://localhost:3000`
- Production: `curl http://<vm-ip>/health`

## 📚 Technology Stack

- **Frontend**: React 18.2.0, Tailwind CSS 3.4.1, Axios 1.6.8
- **Backend**: Node.js 20.11.1, Express.js 4.18.2, PostgreSQL 16
- **Security**: JWT, bcrypt, helmet, CORS
- **Infrastructure**: GCP Compute Engine, Cloud SQL, VPC
- **DevOps**: Terraform 1.7.5, GitHub Actions, NGINX
- **Process Management**: PM2

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Live Demo](http://your-vm-ip) (replace with actual IP)
- [API Documentation](http://your-vm-ip/api/docs)
- [GitHub Repository](https://github.com/your-username/helpdesk-ticketing-system)

---
  
  
  
"Testing deployment after secrets configuration"  
"Testing deployment after secrets configuration"  
"?? Secrets configured - deploying now!"  
"?? SSH key fixed - testing deployment"  
"?? SSH key synchronized - testing authentication"  
"?? Fresh SSH keys generated - testing deployment"  
