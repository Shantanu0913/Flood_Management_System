# AegisAI - Disaster Management Platform

AegisAI is a futuristic, glassmorphism-inspired disaster management dashboard designed for high-performance monitoring and response coordination.

## 🏗 Project Structure

The project follows a modular monorepo-style architecture for scalability and ease of deployment.

### 📂 Root Folders
- `backend/`: Node.js Express server handling API logic and real-time data.
- `frontend/`: React + Vite + TypeScript application with a glassmorphism design.
- `database/`: Schema definitions and database migration scripts.

### 🖥 Backend Architecture
To ensure scalability, the backend is organized using the MVC pattern:
- `controllers/`: Contains business logic and request handlers.
- `routes/`: Defines API endpoints and maps them to controllers.
- `middleware/`: Custom Express middleware (Auth, validation, etc.).
- `models/`: Database models and schemas.

### 🎨 Frontend Structure
Focused on modular components and a hybrid styling approach:
- `src/components/`: Reusable UI components.
- `src/pages/`: Main application views/routes (CSS colocated here for component-specific styles).
- `src/styles/`: Global styles, CSS variables, resets, and utility classes.
- `src/lib/`: Shared utility functions, API services, and helper libraries.
- `src/hooks/`: Custom React hooks for shared logic.

## 🚀 Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 🛡 Technologies
- **Frontend**: React, TypeScript, Vite, Vanilla CSS.
- **Backend**: Node.js, Express, Dotenv, CORS.
- **Design**: Glassmorphism, CSS Variables, Orbitron & Inter Typography.
