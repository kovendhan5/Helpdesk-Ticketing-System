# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do not** create a public GitHub issue for security vulnerabilities
2. Email the project maintainers directly
3. Include a detailed description of the vulnerability
4. Provide steps to reproduce the issue if possible

## Security Measures

This project implements several security measures:

- JWT-based authentication with secure token generation
- Password hashing using bcrypt
- Rate limiting to prevent brute force attacks
- Input validation and sanitization
- Environment variable protection for sensitive data
- SSH key-based authentication for deployment

## Secure Configuration

- All sensitive data is stored in environment variables
- Database credentials are properly secured
- JWT secrets use strong random generation
- Production environment isolation

## Dependencies

We regularly update dependencies to address security vulnerabilities. If you notice any outdated dependencies with known security issues, please report them.

## Supported Versions

Only the latest version of this project is actively supported with security updates.
