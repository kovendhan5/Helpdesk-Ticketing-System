# 🧾 Product Requirements Document (PRD) – Helpdesk Ticketing System

## 🧠 Project Description
A full-stack **Helpdesk Ticketing System** web application for users to submit support tickets and admins to manage them. The system includes:

- A **React frontend** with a form for ticket submission and a dashboard for viewing tickets.
- A **Node.js backend** with an Express.js API for ticket management.
- A **PostgreSQL database** for persistent storage.
- Deployment on **Google Cloud Platform (GCP)** using **Terraform** for infrastructure provisioning.
- CI/CD pipeline using **GitHub Actions** for automated builds and deployments.

The project emphasizes clean code, modularity, and Copilot-friendly development practices for efficient implementation in VS Code.

---

## 🧱 Directory Structure

```
helpdesk-ticketing-system/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── index.js           # Entry point
│   │   ├── db.js              # Database connection
│   │   ├── routes/
│   │   │   └── tickets.js     # Ticket API routes
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT authentication middleware
│   ├── .env                   # Environment variables
│   ├── package.json           # Node.js dependencies
│   └── nginx.conf             # NGINX configuration for reverse proxy
│
├── frontend/                   # React app
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── components/
│   │   │   ├── TicketForm.js  # Form for ticket submission
│   │   │   └── TicketList.js  # Dashboard for ticket viewing
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Tailwind CSS setup
│   ├── package.json           # Frontend dependencies
│   └── tailwind.config.js     # Tailwind configuration
│
├── terraform/                  # GCP Terraform code
│   ├── main.tf                # Main Terraform configuration
│   ├── variables.tf           # Terraform variables
│   └── outputs.tf             # Terraform outputs
│
├── .github/workflows/          # GitHub Actions CI/CD
│   └── deploy.yml             # Deployment workflow
│
└── README.md                  # Project documentation
```

---

## 🔧 Technologies to Use

### 💻 Frontend
- **React.js**: v18.2.0 (use functional components, hooks, and JSX)
- **Tailwind CSS**: v3.4.1 for styling
- **Axios**: v1.6.8 for API requests
- **React Router**: v6.22.3 for navigation

### 🔧 Backend
- **Node.js**: v20.11.1 (LTS) with Express.js v4.18.2
- **PostgreSQL**: v16.2 for database
- **pg (node-postgres)**: v8.11.3 for database connectivity
- **jsonwebtoken**: v9.0.2 for JWT authentication
- **dotenv**: v16.4.5 for environment variables
- **helmet**: v7.1.0 for security headers
- **cors**: v2.8.5 for cross-origin requests

### ☁️ Infrastructure
- **Google Cloud Platform (GCP)**:
  - **Compute Engine**: VM instance for backend and frontend
  - **Cloud SQL**: Managed PostgreSQL instance
  - **VPC Network**: Custom VPC with firewall rules
  - **IAM**: Service account for Terraform and GitHub Actions
- **NGINX**: v1.24.0 as a reverse proxy for backend and static file server for frontend

### 🛠 IaC & CI/CD
- **Terraform**: v1.7.5 (GCP provider v5.20.0)
- **GitHub Actions**: For CI/CD pipeline
- **Docker**: For containerizing backend (optional for Copilot suggestions)

---

## 🎯 Functional Requirements

### ✅ User Functionality
- **Authentication**:
  - Users log in with email and password (JWT-based).
  - Register with email and password.
- **Ticket Submission**:
  - Form to submit tickets with `subject`, `message`, and `priority` (low, medium, high).
  - Validation: All fields required, priority must be valid.
- **Ticket Viewing**:
  - Dashboard to view user’s submitted tickets with `id`, `subject`, `priority`, `status`, and `created_at`.

### ✅ Admin Functionality
- **Authentication**:
  - Admins log in with email and password (JWT-based, separate role).
- **Ticket Management**:
  - View all tickets (paginated, filterable by `user_email` or `status`).
  - Update ticket status: `open`, `in_progress`, `resolved`.
  - Delete tickets (optional, for cleanup).

### ✅ Non-Functional Requirements
- **Performance**: API response time < 500ms for 95% of requests.
- **Security**: JWT authentication, HTTPS, input validation, and SQL injection prevention.
- **Scalability**: Support up to 1,000 concurrent users.
- **Reliability**: 99.9% uptime for GCP deployment.

---

## 🧩 API Endpoints

### `POST /api/auth/register`
Register a new user.  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "message": "User registered successfully"
}
```

### `POST /api/auth/login`
Log in and receive a JWT.  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "token": "jwt_token_here"
}
```

### `POST /api/tickets`
Create a new ticket (user only, requires JWT).  
**Request Body**:
```json
{
  "subject": "Login Issue",
  "message": "Cannot log in to portal",
  "priority": "high"
}
```
**Response**:
```json
{
  "id": 1,
  "user_email": "user@example.com",
  "subject": "Login Issue",
  "message": "Cannot log in to portal",
  "priority": "high",
  "status": "open",
  "created_at": "2025-05-27T22:44:00Z"
}
```

### `GET /api/tickets`
Get tickets (admin: all tickets, user: own tickets, requires JWT).  
**Query Parameters** (optional, admin only):
- `user_email`: Filter by user email.
- `status`: Filter by status (`open`, `in_progress`, `resolved`).
- `page`: Pagination (default 1).
- `limit`: Results per page (default 10).  
**Response**:
```json
[
  {
    "id": 1,
    "user_email": "user@example.com",
    "subject": "Login Issue",
    "message": "Cannot log in to portal",
    "priority": "high",
    "status": "open",
    "created_at": "2025-05-27T22:44:00Z"
  }
]
```

### `PATCH /api/tickets/:id`
Update ticket status (admin only, requires JWT).  
**Request Body**:
```json
{
  "status": "resolved"
}
```
**Response**:
```json
{
  "id": 1,
  "status": "resolved"
}
```

### Error Handling
- **400 Bad Request**: Invalid input (e.g., missing fields, invalid priority).
- **401 Unauthorized**: Missing or invalid JWT.
- **403 Forbidden**: User lacks permission (e.g., non-admin updating status).
- **404 Not Found**: Ticket not found.
- **500 Internal Server Error**: Server-side issues.

---

## 🧱 PostgreSQL Table Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- Hashed with bcrypt
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

---

## ⚙️ GitHub Actions CI/CD

**Trigger**: On push to `main` branch.

**Steps**:
1. **Checkout Code**: Use `actions/checkout@v4`.
2. **Set up Node.js**: Use `actions/setup-node@v4` with Node.js v20.11.1.
3. **Build Frontend**:
   - Install dependencies (`npm ci`).
   - Build React app (`npm run build`).
4. **Build Backend**:
   - Install dependencies (`npm ci`).
   - Run tests (if any).
5. **Deploy to GCP**:
   - SSH into Compute Engine VM using `appleboy/ssh-action`.
   - Pull latest code.
   - Copy frontend build to NGINX directory (`/var/www/html`).
   - Restart backend (`pm2 restart` or `node src/index.js`).
   - Restart NGINX (`sudo systemctl restart nginx`).
6. **Notify on Success/Failure**:
   - Use Slack or email notification (optional, via secrets).

**Secrets**:
- `GCP_SSH_KEY`: SSH private key for Compute Engine.
- `GCP_VM_IP`: Public IP of Compute Engine VM.
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Cloud SQL credentials.

---

## ☁️ Terraform – Expected Resources

- **google_compute_instance**: VM for backend and frontend (Ubuntu 22.04, e2-medium).
- **google_sql_database_instance**: Cloud SQL PostgreSQL instance (db-f1-micro, v16).
- **google_sql_database**: Database for tickets.
- **google_sql_user**: User for database access.
- **google_compute_firewall**: Allow HTTP (80), HTTPS (443), and SSH (22).
- **google_project_iam_member**: Service account permissions for Terraform and GitHub Actions.

---

## ✅ Completion Criteria
- **App Accessibility**: Deployed on GCP with a public IP/domain, accessible via HTTPS.
- **Functionality**: Users can register, log in, submit tickets, and view their tickets; admins can view all tickets and update statuses.
- **Infrastructure**: Fully provisioned via Terraform (VM, Cloud SQL, firewall, IAM).
- **CI/CD**: GitHub Actions deploys frontend and backend on push to `main`.
- **Documentation**: `README.md` includes setup, deployment, and API usage instructions.
- **Code Quality**: Modular, commented code with error handling and validation.

---

## 🛠 Implementation Notes for Copilot
- **VS Code Setup**:
  - Install GitHub Copilot extension.
  - Use `.js` files with ES modules (`import`/`export`) for better Copilot suggestions.
  - Add comments in code (e.g., `// Fetch tickets from API`) to guide Copilot.
- **Backend**:
  - Use `async/await` for database queries and API calls.
  - Implement JWT middleware in `backend/src/middleware/auth.js`.
  - Use `bcrypt` for password hashing in `users` table.
- **Frontend**:
  - Use React hooks (`useState`, `useEffect`) for state management.
  - Implement Axios interceptors for JWT handling.
  - Use Tailwind classes for responsive design (e.g., `flex`, `grid`, `mx-auto`).
- **Terraform**:
  - Store GCP credentials in `terraform/credentials.json` (not in Git).
  - Use variables for sensitive data (`project_id`, `db_password`).
- **GitHub Actions**:
  - Store secrets in GitHub repository settings.
  - Test SSH commands locally before adding to workflow.

---

*Generated on May 27, 2025, at 10:46 PM IST*