# Contributing to Helpdesk Ticketing System

Thank you for your interest in contributing to the Helpdesk Ticketing System! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose
- Git

### Setting Up Development Environment

1. **Fork the repository**:

   - Click the "Fork" button at the top right of [the repository](https://github.com/kovendhan5/Helpdesk-Ticketing-System)

2. **Clone your fork**:

   ```bash
   git clone https://github.com/YOUR-USERNAME/Helpdesk-Ticketing-System.git
   cd Helpdesk-Ticketing-System
   ```

3. **Set up environment**:

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Install dependencies**:

   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

5. **Run the development environment**:

   ```bash
   # Using Docker
   docker-compose up -d

   # Or run services separately
   # Backend
   cd backend
   npm run dev

   # Frontend (in another terminal)
   cd frontend
   npm start
   ```

## Development Workflow

1. **Create a branch**:

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-fix-name
   ```

2. **Make your changes**:

   - Write clean, well-documented code
   - Follow the existing code style
   - Add appropriate tests for your changes

3. **Run tests**:

   ```bash
   # Backend tests
   cd backend
   npm test

   # Frontend tests
   cd frontend
   npm test
   ```

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   ```

   Follow the commit message format:

   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding/modifying tests
   - `chore:` for build process or tooling changes

5. **Keep your branch updated**:

   ```bash
   git fetch origin
   git rebase origin/main
   ```

6. **Push your changes**:

   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a pull request**:
   - Go to the [repository](https://github.com/kovendhan5/Helpdesk-Ticketing-System)
   - Click "Compare & pull request"
   - Provide a clear description of your changes
   - Reference any related issues

## Code Guidelines

### General Guidelines

- Write clean, readable, and well-documented code
- Keep functions small and focused on a single responsibility
- Use meaningful variable and function names
- Add comments for complex logic

### Backend Guidelines

- Follow ES6+ JavaScript standards
- Document API endpoints with clear descriptions
- Include input validation for all user inputs
- Write unit tests for new functionality
- Handle errors properly with appropriate status codes

### Frontend Guidelines

- Use functional components with hooks
- Keep components small and reusable
- Use proper semantic HTML elements
- Ensure responsive design works on all screen sizes
- Follow accessibility best practices

## Testing

- Write unit tests for new functionality
- Ensure existing tests continue to pass
- Consider edge cases in your tests
- Test for both success and failure scenarios

## Documentation

- Update the README.md if your changes affect the setup or usage
- Document new API endpoints
- Add comments to explain complex logic
- Update any relevant documentation in the /docs folder

## Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists in the [issue tracker](https://github.com/kovendhan5/Helpdesk-Ticketing-System/issues)
2. If not, create a new issue using the appropriate issue template
3. Include detailed steps to reproduce the issue
4. Include screenshots if applicable
5. Mention your environment details (OS, browser, etc.)

## Pull Request Process

1. Ensure your code passes all tests
2. Update documentation as needed
3. The PR should work on all supported platforms
4. At least one maintainer must review and approve your PR
5. Address any review comments

## Questions?

If you have any questions, feel free to create an issue labeled "question" or reach out to the project maintainers.

Thank you for contributing to the Helpdesk Ticketing System!
