# 🌱 Urban Farming Platform — Backend API

A production-ready RESTful API backend for an **Interactive Urban Farming Platform** that connects urban farmers, gardening enthusiasts, and customers in metropolitan areas. The platform supports garden space rental, organic produce marketplace, community forums, and sustainability certification management.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Vendor Profiles](#vendor-profiles)
  - [Produce (Marketplace)](#produce-marketplace)
  - [Rental Spaces](#rental-spaces)
  - [Orders](#orders)
  - [Community Posts](#community-posts)
  - [Sustainability Certifications](#sustainability-certifications)
- [Roles & Permissions](#roles--permissions)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination & Filtering](#pagination--filtering)

---

## Overview

The Urban Farming Platform backend provides a secure, scalable API built with **Node.js**, **Express**, **TypeScript**, and **PostgreSQL** via **Prisma ORM**. It supports three user roles — Admin, Vendor, and Customer — each with distinct permissions across all platform modules.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcrypt |
| Validation | Zod |
| Rate Limiting | express-rate-limit |
| HTTP Status | http-status-codes |

---

## Features

- ✅ JWT-based authentication with role-based access control (RBAC)
- ✅ Vendor approval workflow managed by Admin
- ✅ Organic produce marketplace with stock management
- ✅ Location-based farm rental space search
- ✅ Order management with atomic stock decrement via DB transactions
- ✅ Community forum for gardening tips and eco-friendly practices
- ✅ Sustainability certification submission and verification
- ✅ Standardized JSON API responses across all endpoints
- ✅ Pagination, filtering, and sorting on all list endpoints
- ✅ Centralized error handling with proper HTTP status codes
- ✅ Rate limiting on sensitive routes (register, login)

---

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.route.ts
│   ├── user/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── user.route.ts
│   ├── vendorProfile/
│   │   ├── vendorProfile.controller.ts
│   │   ├── vendorProfile.service.ts
│   │   └── vendorProfile.route.ts
│   ├── produce/
│   │   ├── produce.controller.ts
│   │   ├── produce.service.ts
│   │   └── produce.route.ts
│   ├── rentalSpace/
│   │   ├── rentalSpace.controller.ts
│   │   ├── rentalSpace.service.ts
│   │   └── rentalSpace.route.ts
│   ├── order/
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   └── order.route.ts
│   ├── communityPost/
│   │   ├── communityPost.controller.ts
│   │   ├── communityPost.service.ts
│   │   └── communityPost.route.ts
│   └── sustainabilityCert/
│       ├── sustainabilityCert.controller.ts
│       ├── sustainabilityCert.service.ts
│       └── sustainabilityCert.route.ts
├── middleware/
│   ├── checkAuth.ts
│   ├── globalErrorHandler.ts
│   └── rateLimiter.ts
├── helper/
│   └── paginationHelper.ts
├── utils/
│   ├── catchAsync.ts
│   ├── sendResponse.ts
│   ├── pick.ts
│   └── prisma.ts
├── errors/
│   └── AppError.ts
├── routes/
│   └── index.ts
└── app.ts
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/urban-farming-api.git
cd urban-farming-api

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Generate Prisma client
npx prisma generate

# 6. Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev        # Start development server with ts-node-dev
npm run build      # Compile TypeScript to JavaScript
npm run start      # Start production server
npm run lint       # Run ESLint
npx prisma studio  # Open Prisma database GUI
```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/urban_farming_db

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=30d

# Bcrypt
BCRYPT_SALT_ROUNDS=10
```

---

## Database Schema

```
User ────────────── VendorProfile ──── Produce
  │                       │            │
  │                       ├────────── RentalSpace
  │                       ├────────── SustainabilityCert
  ├── Order ──────────────┘
  └── CommunityPost
```

### Entities

| Model | Key Fields |
|---|---|
| `User` | id, name, email, password, role, status, createdAt |
| `VendorProfile` | id, userId, farmName, certificationStatus, farmLocation |
| `Produce` | id, vendorId, name, description, price, category, certificationStatus, availableQuantity |
| `RentalSpace` | id, vendorId, location, size, price, availability |
| `Order` | id, userId, produceId, vendorId, status, orderDate |
| `CommunityPost` | id, userId, postContent, postDate |
| `SustainabilityCert` | id, vendorId, certifyingAgency, certificationDate |

---

## API Reference

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

All protected routes require the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and receive JWT tokens |
| `POST` | `/auth/refresh-token` | Public | Refresh access token |
| `POST` | `/auth/change-password` | 🔒 All Roles | Change own password |

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "CUSTOMER"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/users` | Public | Create a new user |
| `GET` | `/users` | 🔒 Admin | Get all users (paginated) |
| `GET` | `/users/me` | 🔒 All Roles | Get own profile |
| `PATCH` | `/users/:id` | 🔒 All Roles | Update user by ID |
| `DELETE` | `/users/:id` | 🔒 Admin | Delete user by ID |

#### Query Parameters (GET /users)

| Param | Type | Description |
|---|---|---|
| `searchTerm` | string | Search by name or email |
| `role` | string | Filter by role: `ADMIN`, `VENDOR`, `CUSTOMER` |
| `status` | string | Filter by status: `ACTIVE`, `INACTIVE` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `sortBy` | string | Sort field (e.g., `createdAt`) |
| `sortOrder` | string | `asc` or `desc` |

---

### Vendor Profiles

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/vendors` | 🔒 Vendor | Create own vendor profile |
| `GET` | `/vendors` | Public | Get all vendor profiles (paginated) |
| `GET` | `/vendors/:id` | Public | Get single vendor profile |
| `GET` | `/vendors/my/profile` | 🔒 Vendor | Get own vendor profile |
| `PATCH` | `/vendors/:id` | 🔒 Admin, Vendor | Update vendor profile |
| `PATCH` | `/vendors/:id/approve` | 🔒 Admin | Approve a vendor |
| `DELETE` | `/vendors/:id` | 🔒 Admin | Delete vendor profile |

#### Create Vendor Profile

```http
POST /api/v1/vendors
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "farmName": "Green Roots Farm",
  "farmLocation": "Dhaka, Mirpur",
  "certificationStatus": "PENDING"
}
```

#### Query Parameters (GET /vendors)

| Param | Type | Description |
|---|---|---|
| `searchTerm` | string | Search by farmName or farmLocation |
| `certificationStatus` | string | Filter by status: `PENDING`, `APPROVED` |
| `farmLocation` | string | Filter by location |

---

### Produce (Marketplace)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/produce` | 🔒 Vendor | List a new produce item |
| `GET` | `/produce` | Public | Browse all produce (paginated) |
| `GET` | `/produce/:id` | Public | Get single produce details |
| `GET` | `/produce/my/listings` | 🔒 Vendor | Get own produce listings |
| `PATCH` | `/produce/:id` | 🔒 Admin, Vendor | Update produce details |
| `DELETE` | `/produce/:id` | 🔒 Admin, Vendor | Delete a produce listing |

#### Create Produce

```http
POST /api/v1/produce
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "name": "Organic Tomatoes",
  "description": "Fresh, pesticide-free tomatoes grown in Dhaka",
  "price": 120.00,
  "category": "Vegetables",
  "certificationStatus": "ORGANIC",
  "availableQuantity": 50
}
```

#### Query Parameters (GET /produce)

| Param | Type | Description |
|---|---|---|
| `searchTerm` | string | Search by name, description, or category |
| `category` | string | Filter by category |
| `certificationStatus` | string | Filter by certification |
| `page` | number | Page number |
| `limit` | number | Items per page |
| `sortBy` | string | Sort field (e.g., `price`, `name`) |
| `sortOrder` | string | `asc` or `desc` |

> **Note:** Only produce with `availableQuantity > 0` is shown by default.

---

### Rental Spaces

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/rental-spaces` | 🔒 Vendor | Create a rental space listing |
| `GET` | `/rental-spaces` | Public | Browse all rental spaces |
| `GET` | `/rental-spaces/:id` | Public | Get single rental space |
| `GET` | `/rental-spaces/my/spaces` | 🔒 Vendor | Get own rental spaces |
| `PATCH` | `/rental-spaces/:id` | 🔒 Admin, Vendor | Update rental space |
| `DELETE` | `/rental-spaces/:id` | 🔒 Admin, Vendor | Delete rental space |

#### Create Rental Space

```http
POST /api/v1/rental-spaces
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "location": "Dhaka, Uttara Sector 7",
  "size": "20 sqft",
  "price": 1500.00,
  "availability": true
}
```

#### Query Parameters (GET /rental-spaces)

| Param | Type | Description |
|---|---|---|
| `searchTerm` | string | Search by location or size |
| `location` | string | Filter by exact location |
| `availability` | boolean | `true` for available spaces only |
| `size` | string | Filter by plot size |

---

### Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/orders` | 🔒 Customer | Place a new order |
| `GET` | `/orders` | 🔒 Admin | Get all orders (paginated) |
| `GET` | `/orders/my/orders` | 🔒 Customer | Get own orders |
| `GET` | `/orders/vendor/orders` | 🔒 Vendor | Get incoming orders |
| `GET` | `/orders/:id` | 🔒 All Roles | Get order by ID |
| `PATCH` | `/orders/:id/status` | 🔒 Admin, Vendor | Update order status |
| `PATCH` | `/orders/:id/cancel` | 🔒 Customer | Cancel own order |

#### Place an Order

```http
POST /api/v1/orders
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "produceId": "uuid-of-produce",
  "quantity": 2
}
```

#### Order Status Flow

```
PENDING → PROCESSING → SHIPPED → DELIVERED
    └──────────────────────────→ CANCELLED
```

| Status | Who Can Set |
|---|---|
| `PENDING` | System (auto on order creation) |
| `PROCESSING` | Vendor, Admin |
| `SHIPPED` | Vendor, Admin |
| `DELIVERED` | Vendor, Admin |
| `CANCELLED` | Customer (if not SHIPPED/DELIVERED), Admin |

> **Note:** Order creation uses a **database transaction** to atomically decrement produce stock. Cancellations restore stock automatically.

---

### Community Posts

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/community` | 🔒 All Roles | Create a forum post |
| `GET` | `/community` | Public | Browse all forum posts |
| `GET` | `/community/:id` | Public | Get single post |
| `GET` | `/community/my/posts` | 🔒 All Roles | Get own posts |
| `PATCH` | `/community/:id` | 🔒 Author, Admin | Update post |
| `DELETE` | `/community/:id` | 🔒 Author, Admin | Delete post |

#### Create Post

```http
POST /api/v1/community
Authorization: Bearer <any_token>
Content-Type: application/json

{
  "postContent": "Best time to plant tomatoes in Dhaka is March-April. Use compost instead of chemical fertilizer for best results!"
}
```

---

### Sustainability Certifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/certifications` | 🔒 Vendor | Submit a certification |
| `GET` | `/certifications` | 🔒 Admin | View all certifications |
| `GET` | `/certifications/my/certs` | 🔒 Vendor | View own certifications |
| `GET` | `/certifications/:id` | 🔒 Admin, Vendor | Get single certification |
| `PATCH` | `/certifications/:id` | 🔒 Admin, Vendor | Update certification |
| `DELETE` | `/certifications/:id` | 🔒 Admin, Vendor | Delete certification |

#### Submit Certification

```http
POST /api/v1/certifications
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "certifyingAgency": "Bangladesh Organic Certification Agency",
  "certificationDate": "2024-06-01"
}
```

---

## Roles & Permissions

| Action | Admin | Vendor | Customer |
|---|:---:|:---:|:---:|
| Manage all users | ✅ | ❌ | ❌ |
| Approve vendors | ✅ | ❌ | ❌ |
| View all orders | ✅ | ❌ | ❌ |
| View all certifications | ✅ | ❌ | ❌ |
| Create vendor profile | ❌ | ✅ | ❌ |
| List produce / rental space | ❌ | ✅ | ❌ |
| Manage own orders (incoming) | ❌ | ✅ | ❌ |
| Submit certifications | ❌ | ✅ | ❌ |
| Place orders | ❌ | ❌ | ✅ |
| Cancel own orders | ❌ | ❌ | ✅ |
| Create community posts | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |

---

## Response Format

All API responses follow a consistent JSON structure:

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data fetched successfully",
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Data fetched successfully",
  "data": {
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10
    },
    "data": [ ... ]
  }
}
```

---

## Error Handling

All errors are handled globally and return a consistent structure:

### Error Response

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "errorDetails": { ... }
}
```

### Common HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK — Request successful |
| `201` | Created — Resource created |
| `400` | Bad Request — Invalid input |
| `401` | Unauthorized — Missing or invalid token |
| `403` | Forbidden — Insufficient role permissions |
| `404` | Not Found — Resource doesn't exist |
| `409` | Conflict — Duplicate resource (e.g., email, vendor profile) |
| `429` | Too Many Requests — Rate limit exceeded |
| `500` | Internal Server Error |

---

## Rate Limiting

Sensitive routes are protected with rate limiting to prevent abuse:

| Route | Limit | Window |
|---|---|---|
| `POST /auth/register` | 10 requests | 15 minutes |
| `POST /auth/login` | 10 requests | 15 minutes |

When the limit is exceeded, the API responds with:

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests. Please try again later."
}
```

---

## Pagination & Filtering

All `GET` list endpoints support the following query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | `1` | Current page number |
| `limit` | number | `10` | Number of results per page |
| `sortBy` | string | varies | Field to sort by |
| `sortOrder` | string | `desc` | Sort direction: `asc` or `desc` |
| `searchTerm` | string | — | Full-text keyword search |

#### Example Request

```
GET /api/v1/produce?searchTerm=tomato&category=Vegetables&page=1&limit=5&sortBy=price&sortOrder=asc
```

---

## License

This project is licensed under the [MIT License](LICENSE).

---

> Built with ❤️ for sustainable urban agriculture.