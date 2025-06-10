# Helpdesk Ticketing System

A modern, full-stack helpdesk ticketing system built with React, Node.js, PostgreSQL, and Docker. This system provides comprehensive ticket management, user authentication, real-time updates, and admin functionality.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-%5E18.0.0-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-%3E%3D13.0-blue.svg)

## 🚀 Features

- **User Management**: Registration, authentication, and role-based access control
- **Ticket Management**: Create, view, update, and manage support tickets
- **Real-time Updates**: WebSocket integration for live ticket status updates
- **Admin Dashboard**: Comprehensive admin panel for system management
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Security**: JWT authentication, input validation, and security middleware
- **Containerized**: Full Docker support for easy deployment
- **Database**: PostgreSQL with proper schema and relationships

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  React Frontend │────│  Node.js API    │────│  PostgreSQL DB  │
│  (Port 8080)    │    │  (Port 3001)    │    │  (Port 5432)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend

- **React 18** - Modern JavaScript framework
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Router** - Client-side routing
- **WebSocket** - Real-time communication

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **WebSocket** - Real-time features
- **bcrypt** - Password hashing

### Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server (production)
- **GitHub Actions** - CI/CD pipeline

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/kovendhan5/Helpdesk-Ticketing-System.git
cd Helpdesk-Ticketing-System
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
FRONTEND_PORT=8080
API_URL=http://localhost:3001
```

### 3. Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🔧 Development Setup

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Ticket Endpoints

- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get specific ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Admin Endpoints

- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)

## 🐳 Docker Commands

```bash
# Build services
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove everything including volumes
docker-compose down -v --remove-orphans
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

## 📦 Deployment

### Production Deployment

1. Set up your production server
2. Configure environment variables
3. Run the deployment script:

```bash
# Using GitHub Actions (automated)
git push origin main

# Manual deployment
docker-compose -f docker-compose.yml up -d --build
```

### Environment Variables for Production

```env
DB_PASSWORD=strong_production_password
JWT_SECRET=secure_jwt_secret_at_least_32_chars
FRONTEND_PORT=8080
API_URL=https://your-domain.com:3001
NODE_ENV=production
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Security headers
- SQL injection prevention

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues and Support

If you encounter any issues or have questions:

1. Check the [existing issues](https://github.com/kovendhan5/Helpdesk-Ticketing-System/issues)
2. Create a new issue with detailed information
3. Use the appropriate issue template

## 📊 Project Status

- ✅ Core functionality complete
- ✅ Docker containerization
- ✅ CI/CD pipeline
- ✅ Security implementation
- 🚧 Advanced features in development

## 🙏 Acknowledgments

- React community for excellent documentation
- Node.js ecosystem for robust backend tools
- Docker for simplifying deployment
- PostgreSQL for reliable data storage

---

**Made with ❤️ by the Helpdesk Team**
