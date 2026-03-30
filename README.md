# Helping Hands

Helping Hands is a full-stack web application designed as an internal management tool for coordinating 
clients, employees, houses, and scheduled events within a care-focused organization.

This project demonstrates production-style architecture, strong testing practices, and a focus on 
maintainability and scalability.

## 🚀 Live Demo

* Frontend: https://helping-hands-seven.vercel.app/
* Backend: Hosted on Railway
* Database: PostgreSQL (Supabase)

## 📌 Overview

This application allows administrators and managers to:

* Manage clients, employees, and houses
* Schedule and track events (including medical events)
* Assign managers and clients to houses
* Enforce role-based access control
* Validate and handle complex business rules

The project emphasizes real-world backend structure, 
robust validation, and high test coverage, making it 
representative of production-grade systems.

## 🛠 Tech Stack

### Frontend

* React (TypeScript)

* Tailwind CSS

* Context API for state management

* Custom reusable component system

### Backend

* Node.js + Express

* Prisma ORM

* PostgreSQL
* Zod validation

### Testing
* Jest + Supertest (backend unit and integration tests)
* React Testing Library (frontend component tests)
* Cypress (end-to-end tests)

## ✨ Key Features
### 🔐 Authentication & Security
* JWT-based authentication
* Hybrid token strategy:
  * Access token (in-memory)
  * Refresh token (HTTP-only cookie)
* Role-based route protection (Admin / Manager)
### 🧩 Modular Backend Architecture
* Controller → Service → Data layer separation
* Centralized error handling middleware
* Reusable validation schemas (Zod)
### 📊 Advanced Validation
* Frontend + backend validation coverage
* Conditional validation (e.g., Medical Events)
* Protection against duplicate records
### 🧑‍💼 Admin Capabilities
* Full CRUD for employees, clients, houses, events
* Assign/remove managers and clients from houses
* Edit employee roles and information


## 🧪 Testing Strategy

This project uses a layered testing approach:

### Unit / Integration Tests
* Business logic tested via service and controller layers
* API endpoints tested with Supertest
* Validation and edge cases covered extensively
### Frontend Tests
* Component behavior testing with React Testing Library
* Form validation and user interaction coverage
### End-to-End Tests (Cypress)

Covers critical user flows:

* Authentication (login/register)
* Creating and editing entities
* Assigning relationships (e.g., house managers)
* Validation failure scenarios

## 📊 Test Coverage

* Backend: 
  * ~99% statements coverage
  * ~92% branches coverage
  * 251 unit and endpoint tests

* Frontend: 
  * ~99% statements coverage
  * ~92% branches coverage
  * 357 unit tests for components, and hooks

* E2E: Core user flows covered with Cypress
  * 20 end-to-end tests simulating real user interactions

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

## 📌 Current Status (Pre v0.1)

This version is functional but still evolving. It is designed as an internal tool rather than a production-ready SaaS product.

### Planned Improvements

#### Short-term (v0.1)

* Enhanced UI/UX polish

* Expanded admin functionality (employee management)

* Email notifications (e.g., user registration)

* Additional pagination and filtering features

* Logging and monitoring improvements

#### Long-term (v1.0+)
* Auth
  * Add rehydration of user sessions on app load
  * Refactor frontend page for role based access control
  * Implement password reset functionality
* Scheduling
  * Allow managers to manage house schedules and assign employees to houses
  * Allow managers to view and manage employee schedules
  * Allow managers to put up open shifts for employees to pick up
  * Allow employees to view their schedules and request time off
  * Allow employees to view and pick up open shifts
  * Implement calendar view for schedules
  * Allow managers and employees to communicate about shift requests
* Financial
  * Allow managers to view client financial information
  * Allow employees to put in for client money requests (e.g., for supplies, activities, etc.)
  * Allow managers to view and approve/deny client money requests
  * Allow managers to view house bills and view payment information for each client (amount, check number, etc.)

#### Future Enhancements (v2.0+)
* Medical
  * Allow employees to log client medication information (e.g., times meds were administered, results for giving PRN (as needed) medications,  etc.)
  * Allow employees to log regular medical events (e.g., taking blood pressure, blood sugar. etc.)
  * Allow manager to view client medical information and generate reports (e.g., medication administration history, blood pressure trends, etc.)
  * Allow managers to perform data analysis on medical information to identify trends and make informed decisions about client care (e.g., 
  does a client take PRNs more often at specific times of day or specific days, trends in blood pressure; blood sugar based on day of week; time 
  of day; etc., etc.)
* Employee Management
  * Allow mangers to put employee pay and PTO availability information available
  * Allow employees to view their pay and PTO information
  * Allow employees to change their availability for scheduling purposes
  * Allow managers to view employee availability and use it for scheduling purposes
  * Allow managers to view employee performance information (e.g., shift attendance, manager feedback, etc.)
* Documentation
  * Allow employees to log client notes and important information about their care (e.g., changes in behavior, health concerns, etc.)
  * Allow managers to view client notes and important information about their care
  * Allow employees to log information about client daily activity (eg., showering, brushing teeth, client goals, etc.)

## 👤 Author

### Nathan Warner

* Full-stack developer focused on building production-ready applications
* Strong emphasis on testing, architecture, and real-world problem solving

## 💼 Why This Project Matters

This project demonstrates:

* Ability to design and build a full-stack system from scratch
* Strong understanding of backend architecture and API design
* Real-world testing practices (unit, integration, and E2E)
* Attention to scalability, validation, and security

## FAQ

### Why did you implement these features first?
I chose to implement these feature first because they provide the foundation 
for the other features. For example the schedules feature is dependent on the
events functionality because events will change the scheduling needs for a house.
The financials features are dependent on the client, house, and events functions. A client
financial request could be tied to a particular event. The bill functionality which 
will be reflected in both the house and client financial information.
