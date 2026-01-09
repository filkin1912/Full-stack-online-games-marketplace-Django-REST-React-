## 🎮 Online Game Store – Full-Stack Django & React (Docker + Local Dev)

This project is a **full-stack online game marketplace** built with:

- **Backend:** Django + Django REST Framework + PostgreSQL
- **Frontend:** React
- **Containerization:** Docker & Docker Compose

It is designed to:

1. **Run the entire stack with one Docker command**, and
2. **Allow reviewers to also run backend and frontend locally** using the cloned source code in folders backend and frontend_app.

---

## 📦 Repository Structure

```text
Full-stack-online-games-marketplace-Django-REST-React-/
├─ backend/
├─ frontend_app/
├─ docker-compose.yml
└─ README.md
```

---

## ✅ Get started

## 🚀 Option 1: Run the entire stack with Docker

| Step | Description                                                                                                                                                      |
|------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **1️⃣ Clone the repository** | `git clone git@github.com:filkin1912/Full-stack-online-games-marketplace-Django-REST-React-.git`<br>`cd .\Full-stack-online-games-marketplace-Django-REST-React-\` |
| **2️⃣ Start Docker environment** | `docker compose up -d`                                                                                                                                           |
| **3️⃣ Create Django superuser (Docker)** | `cd .\backend\ `<br>`docker exec -it gamesplay-backend python manage.py createsuperuser`                                                                         |
| **4️⃣ Access the application** | Frontend: `http://localhost:3001`<br>Backend: `http://localhost:8001`<br>Admin: `http://localhost:8001/admin`                                                    |
| **5️⃣ API endpoints** | Games: `/api/games/`<br>Accounts: `/api/accounts/`<br>Common: `/api/common/`<br>JWT: `/api/auth/token/`, `/refresh/`, `/verify/`                                 |

---

## 🧑‍💻 Option 2: Run the project locally 
**(to use PostgreSQL database running in Docker 1st is needed 'docker compose up -d', docker container to be started and then from Docker Desktop application to stop - 1.`gamesplay-backend-1` and 2.`gamesplay-frontend-1`, only `project_dbcontainer` should be running)**

## 🐍 START Backend – Local Setup (Django on :8000)


| Step                                      | Description                                                                                                                               |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| **Go to the frontend folder**             | `...\Full-stack-online-games-marketplace-Django-REST-React-\backend`                                                                      |
| **1️⃣ Create & activate virtual environment** | `python -m venv venv`<br>`source venv/bin/activate` (Linux/macOS)<br>`venv\Scripts\Activate.ps1` or `venv\Scripts\activate.bat` (Windows) |
| **2️⃣ Install dependencies**              | `pip install -r requirements.txt`                                                                                                         |
| **3️⃣ Apply database migrations**         | `python manage.py migrate`                                                                                                                |
| **4️⃣ Create admin user**                 | `python manage.py createsuperuser`                                                                                                        |
| **5️⃣ Run backend server**                | `python manage.py runserver 8000`                                                                                                         |

- **Local backend:** `http://localhost:8000`  
- **Local admin:** `http://localhost:8000/admin`

> You can now have both:
> - Docker backend at `:8001`
> - Local backend at `:8000`  
> running simultaneously if you wish (cookies/CSRF may conflict across ports, so it's recommended to use separate browsers).

---

## ⚛️ START Frontend – Local Setup (React on :3000)

| Step                                                                             | Description                                                                                                             |
|----------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **1️⃣ Go to the frontend folder**                                                | `...\Full-stack-online-games-marketplace-Django-REST-React-\frontend_app`                                               |
| **2️⃣ Install frontend dependencies**                                            | `npm install`                                                                                                           |
| **<span style="color: orange; font-weight: bold;">Ignore these warnings</span>** | **<span style="color: red; font-weight: bold;">Don't execute:</span>**~~`npm audit fix`~~ , ~~`npm audit fix --force`~~ |
| **3️⃣ Start the local frontend**                                                 | `npm start`                                                                                                             |

This will launch the React dev server at:
- **Local frontend:** `http://localhost:3000` (development, hot reload)

---

## 🌐 Ports Summary

| Component         | Environment | Port | URL                           |
|-------------------|-------------|------|-------------------------------|
| Frontend (Docker) | Docker      | 3001 | `http://localhost:3001`       |
| Backend (Docker)  | Docker      | 8001 | `http://localhost:8001`       |
| Admin (Docker)    | Docker      | 8001 | `http://localhost:8001/admin` |
| Frontend (Local)  | Local       | 3000 | `http://localhost:3000`       |
| Backend (Local)   | Local       | 8000 | `http://localhost:8000`       |
| Admin (Local)     | Local       | 8000 | `http://localhost:8000/admin` |

---

## 🔄 Core Functionalities (Quick Overview)

| <span style="color: orange; font-weight: bold;">Backend</span> (Django + DRF)                                                             | <span style="color: orange; font-weight: bold;">Frontend</span> (React)                                                                         |
|-------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| <span style="color: orange; font-weight: bold;">User Management:</span> Register, login, logout, profile editing, avatars                 | <span style="color: orange; font-weight: bold;">Public Storefront:</span> Browse games, search, view details, pagination                        |
| <span style="color: orange; font-weight: bold;">Wallet System:</span> Add funds, spend on purchases, total spent                          | <span style="color: orange; font-weight: bold;">Private User Area:</span> Login/register, manage profile, wallet, owned games                   |
| <span style="color: orange; font-weight: bold;">Game Catalog:</span> CRUD games, search & filter, sort // add/remove comments with avatar | <span style="color: orange; font-weight: bold;">Game Management:</span> Create, edit, delete, comment games (authorized users only)             |
| <span style="color: orange; font-weight: bold;">Owner Tracking:</span> Prevent duplicate purchases, unique user–game                      | <span style="color: orange; font-weight: bold;">State & Routing:</span> Context API, protected routes (RouteGuard), LocalStorage persistence    |
| <span style="color: orange; font-weight: bold;">REST API:</span> JWT-secured endpoints (games, accounts, common), SimpleJWT               | —                                                                                                                                               |
| <span style="color: orange; font-weight: bold;">Access Limitation:</span> Login required for protected URLs (edit, delete, buy, profile)  | <span style="color: orange; font-weight: bold;">Route Protection:</span> Guarded pages require authentication (My Games, Bought Games, Profile) |
                                                                                                                                              |

---

## 🧾 Summary

This project demonstrates a **full-stack architecture** with:

- <span style="color: orange; font-weight: bold;">**Dockerized deployment**:</span> Start the entire stack with one command.
- <span style="color: orange; font-weight: bold;">**Local dev flexibility**:</span> Run the backend and frontend locally so you can review or edit the code and see the changes applied immediately.
- <span style="color: orange; font-weight: bold;">**React + Django REST**</span> integration: Clear separation of concerns, and a smooth single‑page application experience(SPA).
- <span style="color: orange; font-weight: bold;">**Game marketplace domain**</span>: Browsing, buying, selling, wallet handling, ownership tracking, leaving reviews and secure routes.

---

## 📚 Additional Backend Features & Developer Notes

### 🌐 Application Overview (Backend)

The Django backend provides a complete marketplace system with:

- **Public Storefront**
  - “All Games” page accessible to all visitors
  - Game browsing with detailed views
  - Search by title
  - Sorting: newest, oldest, price ascending/
  - Comment games

- **Private User Area (authentication required)**
  - View owned and purchased games
  - Manage profile and wallet balance
  - Add, edit, and delete owned games 

- **REST API (Django REST Framework)**
  - Authenticated endpoints for listing, creating, and buying games
  - Automatic ownership assignment to the logged‑in user
  - JWT‑based authentication (SimpleJWT)

---

## 🧩 Django Apps Overview

### **accounts – User & Wallet Management**
**Models**
- `AppUser` → wallet balance, profile picture, full name, display name

**Views**
- `SignUpView`, `SignInView`, `SignOutView`
- `ProfileDetailsView`
- `ProfileEditView`, `ProfileDeleteView`

---

### **games – Game Catalog & Transactions**
**Models**
- `GameModel` → title, image, summary, price, category, seller

**Views**
- `IndexView` → public listing with search + pagination  
- `my_games` → user-owned and listed games  
- `game_add`, `game_details`, `game_buy`, `game_edit`, `game_delete`

**API (DRF)**
- `GamesListCreateApiView` → list & create games  
- `GameBuyApiView` → purchase games  

---

### **common – Purchase Tracking**
**Models**
- `BoughtGame` → ensures unique purchase per user

**Views**
- `bought_games` → list of purchased games  
- `delete_comment` → users can delete their own comments  

---

## 🔁 Data Flow Summary

- User registers → `AppUser` profile is created  
- User lists games → visible in the storefront  
- Visitors browse → search, sort, paginate  
- Purchases → wallet deducted, ownership recorded  
- Sellers → receive credited funds  
- Comments → one per game, deletable by author  
- API → authenticated users interact via JWT  

---

## 🔐 Security & UX Considerations

- Wallet, profile, and game management restricted to authenticated users  
- Minimum game price enforced  
- Duplicate purchases prevented  
- Purchased games visible only to their owner  
- User data never exposed through public endpoints  

---

## 🎮 Preloaded Game Objects

After logging in, click “Load games” to automatically generate 20 sample games for a better user experience.
```
http://localhost:8001/seed_games
```

This automatically generates initial game objects in the database or just click on `Seed games` button on port :3001.

---

## 🧪 Running Backend Tests

```
docker-compose exec backend python manage.py test
```

