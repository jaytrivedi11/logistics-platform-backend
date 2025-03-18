# Logistics and Transportation Platform API

A robust Node.js backend API for managing logistics and transportation operations.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/logistics-platform.git
cd logistics-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=logistics_platform
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

4. Set up the database:
```bash
# Create the database
mysql -u root -p
CREATE DATABASE logistics_platform;

# Run migrations
npm run migrate
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

### Running Tests
```bash
npm test
```

### Production Deployment
1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Table of Contents
- [Authentication](#authentication)
- [Users](#users)
- [Vehicles](#vehicles)
- [Bookings](#bookings)
- [Payments](#payments)
- [Admin](#admin)
- [Notifications](#notifications)

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Register User
```http
POST /auth/register
```

Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }
}
```

Response:
```json
{
  "status": "success",
  "token": "jwt_token",
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "zipCode": "10001"
      }
    }
  }
}
```

### Login
```http
POST /auth/login
```

Request Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "status": "success",
  "token": "jwt_token",
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```
