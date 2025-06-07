# 🔑 SSH Private Key Format Example

## ✅ **What Your SSH Private Key Should Look Like**

When you run `cat ~/.ssh/id_rsa` on your VM, you should get output that looks EXACTLY like this:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtcn
NhAAAAAwEAAQAAAQEA2Z3QK5qJ1k8pP0w6ZJ9L0tZvYxJjT5mK9nL2eR8vW4qF3aB7C9
dE5fG6hI7jK8lM9nO0pQ1rS2tU3vW4xY5zA6bC7dE8fF9gH0iJ1kL2mN3oP4qR5sT6
uV7wX8yZ9A0bB1cC2dD3eE4fF5gG6hH7iI8jJ9kK0lL1mM2nN3oO4pP5qQ6rR7sS8t
T9uU0vV1wW2xX3yY4zA5aB6bC7cD8dE9eF0fG1gH2hI3iJ4jK5kL6lM7mN8nO9oP0p
Q1qR2rS3sT4tU5uV6vW7wX8xY9yZ0zA1aB2bC3cD4dE5eF6fG7gH8hI9iJ0jK1kL2l
M3mN4nO5oP6pQ7qR8rS9sT0tU1uV2vW3wX4xY5yZ6zA7aB8bC9cD0dE1eF2fG3gH4h
I5iJ6jK7kL8lM9mN0nO1oP2pQ3qR4rS5sT6tU7uV8vW9wX0xY1yZ2zA3aB4bC5cD6d
E7eF8fG9gH0hI1iJ2jK3kL4lM5mN6nO7oP8pQ9qR0rS1sT2tU3uV4vW5wX6xY7yZ8z
A9aB0bC1cD2dE3eF4fG5gH6hI7iJ8jK9kL0lM1mN2nO3oP4pQ5qR6rS7sT8tU9uV0v
W1wX2xY3yZ4zA5aB6bC7cD8dE9eF0fG1gH2hI3iJ4jK5kL6lM7mN8nO9oP0pQ1qR2r
S3sT4tU5uV6vW7wX8xY9yZ0zA1aB2bC3cD4dE5eF6fG7gH8hI9iJ0jK1kL2lM3mN4n
O5oP6pQ7qR8rS9sT0tU1uV2vW3wX4xY5yZ6zA7aB8bC9cD0dE1eF2fG3gH4hI5iJ6j
-----END OPENSSH PRIVATE KEY-----
```

## 📋 **Key Points:**

✅ **Must start with**: `-----BEGIN OPENSSH PRIVATE KEY-----`  
✅ **Must end with**: `-----END OPENSSH PRIVATE KEY-----`  
✅ **Multiple lines**: Usually 25-40 lines of random characters  
✅ **No extra spaces**: Copy exactly as shown

## ❌ **Common Mistakes:**

❌ **Missing BEGIN line**: Key won't work  
❌ **Missing END line**: Key won't work  
❌ **Only copying part**: Key won't work  
❌ **Adding extra newlines**: May cause issues

## 🎯 **How to Copy Correctly:**

1. **Select ALL** the text from BEGIN to END
2. **Copy** with Ctrl+A then Ctrl+C
3. **Paste** directly into GitHub Secrets
4. **Don't modify** or add anything

## 🔍 **Verification:**

After pasting into GitHub Secrets:

- Secret should show as "Set" or "Configured"
- Length should be several hundred characters
- GitHub will hide the actual value for security

**Once this key is set correctly, SSH authentication will work immediately!**
