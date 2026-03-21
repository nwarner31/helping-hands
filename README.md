# Helping Hands

Helping Hands is a full-stack web application designed as an internal management tool for coordinating 
clients, employees, houses, and scheduled events within a care-focused organization.

This project demonstrates production-style architecture, strong testing practices, and a focus on 
maintainability and scalability.

## 🚀 Live Demo

* Frontend: https://helping-hands-seven.vercel.app/
* Backend: Hosted on Railway
* Database: PostgreSQL (Supabase)

## 🧠 Features

* 🔐 Authentication (JWT-based with refresh tokens)

* 👥 Client management (create, edit, view)

* 🏠 House management with client and manager assignment

* 📅 Event scheduling with conflict detection

* 📄 Pagination for large datasets

* 🔔 Toast notifications for user feedback

* 🧪 Extensive automated testing (unit, integration, and E2E)

## 🛠 Tech Stack

### Frontend

* React (TypeScript)

* Tailwind CSS

* Custom hooks for data fetching and state management

* React Toastify

### Backend

* Node.js + Express

* Prisma ORM

* PostgreSQL

### Testing

* Jest (unit + integration tests)

* Supertest (API testing)

* Cypress (end-to-end testing)

## 📊 Test Coverage

* Backend: 
  * ~98% coverage
  * 251 unit and endpoint tests

* Frontend: 
  * ~98% coverage
  * 357 unit tests for components, and hooks

* E2E: Core user flows covered with Cypress
  * 14 end-to-end tests simulating real user interactions

This project emphasizes reliability and correctness through comprehensive testing.

## 🗂 Project Structure
```
src/
├── components/        # Reusable UI components
├── pages/             # Route-level pages
├── hooks/             # Custom React hooks
├── context/           # Global state (Auth, etc.)
├── models/            # TypeScript models/types
├── utility/           # Helpers & formatting
├── assets/            # Icons, logos
└── App.tsx

backend/
├── controllers/       # Route handlers
├── services/          # Business logic
├── routes/            # Express routes
├── middlewares/       # Auth & error handling
├── validation/        # Zod schemas
├── utility/           # Shared helpers
└── app.ts

prisma/
└── schema.prisma
```
## ⚙️ Installation 
This project needs node and and npm to run. You can download them from [here](https://nodejs.org/en/download/).

The database that I am using is PostgeSQL. You can download it from [here](https://www.postgresql.org/download/).

The steps to get the project running are as follows (based upon the database I am using):
1. Clone the repository
2. Create a database named "helping_hands" in PostgreSQL
3. Create a user with the necessary permissions to access the "helping_hands" database and note down the 
username and password for later use in the .env file.
4. Run the following commands in the terminal to install the dependencies:
```
# Install frontend dependencies
cd ./hh-frontend/
npm install
```
```
# Install backend dependencies
cd ../hh-backend/
npm install
```
5. Create a .env file in the root of the hh-backend directory with the following variables:
```
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/helping_hands
SESSION_TOKEN_SECRET=<your_secret_key>
REFRESH_TOKEN_SECRET=<your_secret_key>
CORS_ORIGIN=http://localhost:5173
```
6. Create a .env file in the root of the hh-frontend directory with the following variable:
```
VITE_API_URL=http://localhost:3000/api
```
7. Run the following command in the root of the hh-backend to migrate the database:
```
npx prisma migrate deploy
```
8. You can now start the development servers for both the frontend and backend using concurrently 
in the base folder of the project:
```
npm run start
```

## 🧩 Architecture Highlights

* Layered backend structure (controllers → services → data access)

* Separation of concerns with reusable hooks on the frontend

* Centralized error handling and validation

* Token-based authentication with refresh flow

* Background job (cron) for token cleanup

## 📌 Current Status (v0.1)

This version is functional but still evolving. It is designed as an internal tool rather than a production-ready SaaS product.

### Planned Improvements

* Enhanced UI/UX polish

* Expanded admin functionality (employee management)

* Email notifications (e.g., user registration)

* Additional pagination and filtering features

* Logging and monitoring improvements

## 🎯 Purpose

This project was built to:

* Demonstrate full-stack development skills

* Showcase production-style architecture and testing

* Serve as a portfolio piece for software engineering roles

## 📄 License

MIT License