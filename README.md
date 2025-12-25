## 🎮 Online Game Store – Unified Dockerized Project

This project is a fully Dockerized full-stack application that can be launched in **3 simple steps**.  
It includes both the backend and frontend source code inside the Docker images for transparency and reference.  
Recruiters and developers can inspect the architecture, logic, and implementation directly from the repository.

## 📁 Project Structure

Full-stack-online-games-marketplace-Django-REST-React/
- backend/
- frontend_app/
- docker-compose.yml
- README.md

## 🚀 Quickstart (30 Seconds)

1. **Clone the repository and enter the folder**:
   - git clone git@github.com:filkin1912/Full-stack-online-games-marketplace-Django-REST-React-.git
   - cd Full-stack-online-games-marketplace-Django-REST-React-

2. **Start the full stack with one command**:
   docker-compose up -d

3. **Create a Django superuser (required for Admin Panel)**:
   docker exec -it gamesplay-backend python manage.py createsuperuser

4. **Access the application in your browser**:
   - Frontend → http://localhost:3001
   - Backend → http://localhost:8001
   - Admin Panel → http://localhost:8001/admin


## 🌐 Overview

A full-stack online marketplace for video games, combining:

- **Backend**: Django + Django REST Framework, containerized with Docker and PostgreSQL.
- **Frontend**: ReactJS application providing a modern interface for browsing, buying, and managing games.

Features include:
- Public storefront for browsing and searching games.
- Private user area with authentication, wallet management, and ownership tracking.
- REST API with JWT authentication for programmatic access.

## 🔗 Access Points

- **Frontend Storefront (React):** http://localhost:3001  
- **Backend Storefront (Django):** http://localhost:8001  
- **Admin Panel:** http://localhost:8001/admin  

**REST API:**  
- Games API  
• http://localhost:8001/api/games/  
- Accounts API  
• http://localhost:8001/api/accounts/  
- Common API  
• http://localhost:8001/api/common/  
- Authentication (JWT)  
• http://localhost:8001/api/auth/token/  
• http://localhost:8001/api/auth/token/refresh/  
• http://localhost:8001/api/auth/token/verify/  


## 🔄 Core Functionalities

Backend (Django + DRF)
----------------------
- User Management: Registration, login/logout, profile editing, profile image support.
- Wallet System: Add funds, spend on purchases, seller credits.
- Game Catalog: Add, edit, delete games; search and sort by newest, oldest, or price.
- Ownership Tracking: Prevent duplicate purchases, ensure unique ownership per user–game pair.
- REST API: JWT-secured endpoints for listing, creating, and buying games.

Frontend (ReactJS)
------------------
- Public Storefront: Browse games, search, view details.
- Private User Area: Manage profile, wallet, and owned games.
- Game Management: Create, edit, and delete games.
- Purchases: Buy games and view purchased list.
- Routing: Protected routes via RouteGuard (login required).
- State Management: Context providers for auth, games, and purchases.
- Persistence: LocalStorage for user and game data across sessions.


## 🔐 JWT Authentication (Backend API)

Authentication endpoints:
- Obtain tokens: POST /api/auth/token/
- Refresh token: POST /api/auth/token/refresh/
- Verify token: POST /api/auth/token/verify/

Include in headers:
Authorization: Bearer <access_token>


## 📦 Tech Stack

- Backend: Django, Django REST Framework, PostgreSQL, Gunicorn  
- Frontend: ReactJS, react-router-dom, Context API, custom hooks  
- Containerization: Docker, Docker Compose  
- Authentication: JWT (SimpleJWT)  


## 🚀 Summary

This unified project demonstrates a modern full-stack application:
- Dockerized backend for easy deployment and reproducibility.
- React frontend for a responsive, user-friendly interface.
- JWT-secured API for programmatic access.
- Game marketplace features: browsing, buying, selling, wallet management, secured urls and ownership tracking.
