🎮 Online Game Store – Dockerized Django Backend

## 🌐 Application Overview

A self-contained Django web application for buying and selling computer games. Features include user authentication, 
wallet management, game ownership tracking, and a REST API for programmatic access. Fully containerized with Docker and 
PostgreSQL for easy setup and deployment.

The application features:

 **Public Storefront**
  – “All Games” page accessible to all visitors
  – Game browsing with detailed views
  – Search functionality by game title
  – Sorting options: newest, oldest, and price-based ordering

 **Private User Area (authentication required)**
  – View owned and purchased games
  – Manage user profile and wallet balance
  – Add, edit, and delete games offered for sale

 **REST API (Django REST Framework)**
  – Authenticated endpoints for listing, creating, and buying games
  – Automatic ownership assignment to the logged-in user
  – JWT-based authentication


## 🔄 Core Functionalities

• `User Management` → Registration, login/logout, profile editing, profile image support
• `Wallet System` → Users can add funds and spend them on game purchases
• `Selling Model` → Sale price is credited to the seller’s wallet
• `Purchase Flow` → Funds are deducted from the buyer’s wallet and ownership is recorded
• `Ownership Tracking` → Ensures unique ownership per user–game pair
• `Game Sorting` → Homepage supports sorting by newest, oldest, and price
• `Games API` → /api/games/ (list and create), /api/games/buy/ (purchase)


## ⚙️ Getting Started with Docker

🐳 1. **Build and Start Containers**
```bash
docker-compose up --build
```

🗄️ 2. **Apply Database Migrations**
```bash
docker-compose exec backend python manage.py migrate
```

👤 3. **Create Superuser (Admin Access)**
```bash
docker-compose exec backend python manage.py createsuperuser
```

📦 4. **Collect Static Files**
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

🎮 5. **Seed Game Objects**
```bash
Log in with your user profile.
Visit the URL: http://localhost:8001/seed_games
This will generate initial game objects in the database.
```

⏹️ 6. **Stop Containers**
```bash
docker-compose down
```


## 🔗 Access Points

• Storefront (Games App)
  http://localhost:8001/
• Admin Panel
  http://localhost:8001/admin
• REST API
  http://localhost:8001/api/games/
  http://localhost:8001/api/games/buy/


## 🔐 JWT Authentication (API)

The REST API uses JWT authentication provided by djangorestframework-simplejwt.

Authentication endpoints:

• Obtain access and refresh tokens
  ```bash
  POST /api/auth/token/
  ````

• Refresh access token
  ```bash
  POST /api/auth/token/refresh/
  ```

• Verify token validity
  ```bash
  POST /api/auth/token/verify/
  ```

All authenticated API requests must include the header:
  ```bash
  Authorization: Bearer <access_token>
  ```


## 🧩 App: accounts – User and Wallet Management

### Models
• AppUser → wallet balance, profile picture, full name, display name

### Views
• SignUpView, SignInView, SignOutView → authentication flow
• ProfileDetailsView → user information and owned games count
• ProfileEditView, ProfileDeleteView → profile management


## 🎮 App: games – Game Catalog and Transactions

### Models
• GameModel → title, image, summary, price, category, seller

### Views
• IndexView → public listing with search and pagination
• my_games → user-owned and listed games
• game_add, game_details, game_buy, game_edit, game_delete

### API (DRF)
• GamesListCreateApiView → list and create games
• GameBuyApiView → purchase games


## 🧩 App: common – Purchase Tracking

### Models
• BoughtGame → links user and game, ensures unique purchase per user

### Views
• bought_games → list of purchased games per user
• delete_comment → allows users to delete their own comments


## 🔁 Data Flow Summary

• User registers → AppUser profile is created
• User lists games → games become visible in the storefront
• Visitors browse → search, sort, and paginate games
• Purchases → wallet balance deducted and ownership recorded
• Sellers → receive credited funds after successful sale
• Comments → limited to one per game, deletable by the author
• API → authenticated users interact programmatically via JWT


## 🔐 Security and UX Considerations

• Wallet, profile, and game management restricted to authenticated users
• Minimum game price enforced
• Duplicate purchases prevented
• Purchased games visible only to their owner
• User data is not exposed through public endpoints


## 🧪 Running Tests

```bash
docker-compose exec backend python manage.py test
```
