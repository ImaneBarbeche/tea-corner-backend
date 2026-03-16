<h1 align="center">Tea Corner — Backend API</h1>

<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="80" alt="NestJS" /></a>
</p>

<p align="center">
  RESTful API for the Tea Corner application — a platform for tea enthusiasts to discover, catalog, and manage their personal tea libraries.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat&logo=nestjs" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeORM-0.3-FE0902?style=flat" alt="TypeORM" />
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=flat&logo=node.js" alt="Node.js" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Docker](#docker)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Scripts](#scripts)
- [License](#license)

---

## Overview

Tea Corner Backend is a NestJS REST API that powers the Tea Corner platform. It handles user authentication, a tea catalog with ingredients and flavour profiles, personal tea libraries with custom brewing parameters, and an admin management layer.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS 11 / TypeScript 5.7 |
| Runtime | Node.js 22 |
| Database | PostgreSQL 16 |
| ORM | TypeORM 0.3 |
| Auth | JWT (access + refresh tokens) + Passport.js |
| Password hashing | Argon2 |
| Email | Nodemailer |
| Validation | class-validator / class-transformer |
| API Docs | Swagger / OpenAPI |
| Rate limiting | @nestjs/throttler |
| Containerization | Docker + Docker Compose |

---

## Features

- **JWT authentication** with dual-token strategy (access token: 15 min, refresh token: 7 days), stored as HttpOnly cookies
- **Email verification** on registration and **password reset** via email
- **Role-based access control** (User / Admin)
- **Tea catalog** — system teas and user-created teas with brewing parameters (time, temperature, leaf and water amounts)
- **Ingredient management** — system and user-owned ingredients with quantity tracking per tea
- **Flavour profiles** — hierarchical flavour taxonomy (types → profiles)
- **Tea styles** — categorization of teas by style
- **Personal tea library** — per-user tea collection with custom brewing parameters and inventory
- **Soft deletes** on users and teas for data retention
- **Database seeding** for initial data (teas, styles, ingredients, flavour types/profiles, admin user)
- **Rate limiting** on sensitive endpoints

---

## Project Structure

```
src/
├── auth/               # Authentication (login, register, tokens, email verification, password reset)
├── user/               # User profile and account management
├── tea/                # Tea catalog and ingredients-per-tea
├── tea-style/          # Tea style reference data
├── ingredient/         # Ingredient catalog
├── flavour-profile/    # Flavour profiles
├── flavour-type/       # Flavour type categories
├── user-tea/           # Personal tea library (user ↔ tea)
├── entities/           # Shared token entities (refresh, email, password reset)
├── guards/             # Auth and roles guards
├── strategies/         # Passport strategies (JWT, local, refresh)
├── decorators/         # @Public(), @Roles(), @CurrentUser()
├── enums/              # Role, Status, TeaType, IngredientType enums
└── database/seeds/     # Database seed scripts
```

---

## Getting Started

### Prerequisites

- Node.js >= 22
- PostgreSQL 16
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file at the project root:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=tea_corner

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=900        # 15 minutes (seconds)
JWT_REFRESH_EXPIRES=604800    # 7 days (seconds)

# Email verification
EMAIL_VERIFY_SECRET=your_email_verify_secret

# Nodemailer (SMTP)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=noreply@example.com
MAIL_PASS=your_mail_password

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development

# Admin seed credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
ADMIN_USERNAME=admin
ADMIN_DISPLAY_NAME=Admin
```

### Database Setup

Run the seed script to populate reference data (teas, styles, ingredients, flavour types/profiles) and create the admin user:

```bash
npm run seed
```

### Running the App

```bash
# Development (watch mode)
npm run start:dev

# Debug mode
npm run start:debug

# Production
npm run start:prod
```

The API will be available at `http://localhost:3000`.
Swagger documentation is available at `http://localhost:3000/api`.

---

## Docker

A multi-stage Dockerfile and `docker-compose.yml` are provided for local development and deployment.

```bash
# Start API + PostgreSQL
docker compose up -d

# Stop services
docker compose down
```

The compose stack includes:
- **backend** — NestJS API on port `3000`
- **postgres** — PostgreSQL 16 on port `5432` with a named volume for persistence

---

## API Reference

All routes are prefixed with `/` (no global prefix).

### Auth — `/auth`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `POST` | `/auth/signup` | Register a new user | Public |
| `POST` | `/auth/signin` | Login | Public |
| `POST` | `/auth/logout` | Logout | Required |
| `POST` | `/auth/refresh-tokens` | Rotate access + refresh tokens | Refresh token |
| `GET` | `/auth/verify-email` | Verify email address | Public |
| `POST` | `/auth/forgot-password` | Send password reset email | Public |
| `POST` | `/auth/reset-password` | Reset password with token | Public |

### Users — `/user`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/user/profile` | Get current user profile | Required |
| `PATCH` | `/user/profile` | Update profile (avatar, bio, banner) | Required |
| `PATCH` | `/user/username` | Update username | Required |
| `PATCH` | `/user/email` | Update email | Required |
| `PATCH` | `/user/password` | Update password | Required |
| `DELETE` | `/user/account` | Delete account | Required |
| `GET` | `/user/:username` | Get public user profile | Required |
| `GET` | `/user/user-management/all` | List all users | Admin |

### Teas — `/tea`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/tea/system` | Get system teas | Public |
| `GET` | `/tea/public` | Get public user-created teas | Required |
| `GET` | `/tea/daily` | Get daily tea suggestion | Required |
| `GET` | `/tea/:id` | Get tea by ID | Required |
| `POST` | `/tea/create` | Create a tea | Required |
| `PATCH` | `/tea/:id` | Update a tea | Required |
| `DELETE` | `/tea/:id` | Delete a tea | Required |
| `POST` | `/tea/:teaId/ingredient` | Add ingredient to tea | Required |
| `GET` | `/tea/:teaId/ingredients` | List tea ingredients | Required |
| `PATCH` | `/tea/:teaId/ingredients/:id` | Update ingredient quantity | Required |
| `DELETE` | `/tea/:teaId/ingredients/:id` | Remove ingredient from tea | Required |
| `GET` | `/tea/all` | List all teas | Admin |

### Ingredients — `/ingredient`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/ingredient/all` | Get system + user ingredients | Required |
| `GET` | `/ingredient/:id` | Get ingredient by ID | Required |
| `POST` | `/ingredient/create` | Create ingredient | Required |
| `PATCH` | `/ingredient/:id` | Update ingredient | Required |
| `DELETE` | `/ingredient/:id` | Delete ingredient | Required |
| `GET` | `/ingredient/admin/all` | List all ingredients (paginated) | Admin |

### User Tea Library — `/user-tea`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/user-tea/library` | Get personal tea library | Required |
| `GET` | `/user-tea/:id` | Get library entry by ID | Required |
| `POST` | `/user-tea/create` | Add tea to library | Required |
| `PATCH` | `/user-tea/:id` | Update library entry | Required |
| `DELETE` | `/user-tea/:id` | Remove tea from library | Required |
| `GET` | `/user-tea/all` | List all user-tea entries | Admin |

### Tea Styles — `/tea-style`

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| `GET` | `/tea-style/all` | Get all tea styles | Public |
| `GET` | `/tea-style/:id` | Get tea style by ID | Public |

---

## Authentication

Authentication uses **JWT tokens stored in HttpOnly cookies**:

- **Access token** — short-lived (15 min), sent on every authenticated request
- **Refresh token** — long-lived (7 days), stored in the database, used to rotate both tokens

Cookie flags in production: `httpOnly`, `secure`, `sameSite=strict`.

Passwords are hashed with **Argon2**. Email verification and password reset tokens are single-use and stored hashed in the database with short expiry windows.

---

## Scripts

```bash
npm run start:dev     # Start in watch mode
npm run start:prod    # Start production build
npm run build         # Compile TypeScript
npm run seed          # Seed the database
npm run lint          # Lint and auto-fix
npm run format        # Format with Prettier
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run test:cov      # Generate coverage report
```

---

## License

This project is [MIT licensed](LICENSE).
