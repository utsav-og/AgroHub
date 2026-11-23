# AgroHub

**AgroHub** is a modern agricultural management and marketplace platform designed to empower farmers and consumers through technology.

* **Academic Project:** B.Tech Information Technology (Semester 5)
* **Architecture:** Decoupled Client-Server Full-Stack Web Application

---

## Tech Stack

* **Frontend:** React.js (v19) with Vite, JavaScript, CSS3
* **Routing & HTTP:** React Router DOM (v7), Axios
* **Icons:** Lucide React
* **Backend:** Node.js, Express.js
* **Security & Middleware:** CORS, Dotenv, Bcrypt.js, JSON Web Tokens (JWT)
* **Database (Upcoming in Phase 2):** MongoDB with Mongoose

---

## Project Structure

```text
AgroHub/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images and design assets
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React context for global state
│   │   ├── pages/              # Screen components (Home, etc.)
│   │   ├── services/           # API service layer (Axios)
│   │   ├── App.jsx             # React routing setup
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Global stylesheet
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies and scripts
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend API Server (Node + Express)
│   ├── config/                 # Database configuration (MongoDB)
│   ├── controllers/            # Route business logic handlers
│   ├── middleware/             # Express middlewares (Auth, error handlers)
│   ├── models/                 # Mongoose data models
│   ├── routes/                 # API route declarations
│   ├── .env                    # Local environment variables
│   ├── .env.example            # Environment variables template
│   ├── package.json            # Backend dependencies and scripts
│   └── server.js               # Express server entry point
│
├── .gitignore                  # Git ignore rules for client and server
└── README.md                   # Project documentation and setup guide
```

---

## Getting Started (How to Run the Project)

### Prerequisites

Make sure you have installed on your system:
* **Node.js**: `v18+` or higher (Tested on `v24.19.0`)
* **npm**: `v9+` or higher (Tested on `v11.17.0`)
* **MongoDB**: Local MongoDB community service running at `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string in `server/.env`)

---

### Step 1: Install Dependencies

After downloading or cloning the repository, install the packages for both the backend and the frontend:

```bash
# In the AgroHub root directory:
npm run install:all
```
*Or install manually in each folder:*
```bash
cd server && npm install
cd ../client && npm install
cd ..
```

---

### Step 2: (Optional) Seed the Database with Sample Data

Run the automatic seeder to instantly populate demo accounts, crop listings, rental machinery, and agricultural workers:

```bash
cd server
npm run seed
cd ..
```

---

### Step 3: Start the Backend Server

1. Open a terminal and navigate to `server`:
   ```bash
   cd server
   npm start
   ```
   *(Or run `npm run dev` for auto-reloading development mode).*
2. The backend API is now running at: **`http://localhost:5000`**
3. Verify status: **`http://localhost:5000/api/health`**

---

### Step 4: Start the Frontend Client

1. Open a second terminal window and navigate to `client`:
   ```bash
   cd client
   npm run dev
   ```
2. Open your web browser and go to: **`http://localhost:5173`**

---

## Default Demo Accounts for Evaluation

You can register any new account or use the pre-configured accounts:

| Role | Email | Password | Privileges & Redirection Target |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer@agrohub.com` | `Farmer@123` | Redirects to `/farmer-dashboard` (crops, expenses, inventory, income reports) |
| **Buyer** | `buyer@agrohub.com` | `Buyer@123` | Redirects to `/buyer-dashboard` (crop marketplace, machinery rental, worker hiring) |
| **Admin** | `admin@agrohub.com` | `Admin@123` | Redirects to `/admin` (platform analytics, user roster, listing moderation) |

---

## Phase Status

* [x] **Phase 1: Project Initialization** (Vite + React + Express + nodemon + health check)
* [x] **Phase 2: Database Connection & Schemas** (MongoDB connected + User and Product Mongoose schemas)
* [x] **Phase 3: REST API Endpoints & Security** (Authentication, Products CRUD, JWT middleware, Role checks)
* [x] **Phase 4: Frontend Development** (Main website layout, Forest/Sage/Off-white styling, Responsive Navbar, Hero, 3 Core Services, Footer, Login & Register views connected to Backend)
* [x] **Phase 5: Machinery Rental Backend & Frontend** (Machinery schema, CRUD REST APIs, live MongoDB React integration, Add Machinery form, search & category filtering, owner deletion)
* [x] **Phase 6: Worker Hiring Backend & Frontend** (Worker schema, CRUD REST APIs, live MongoDB React integration, Add Worker form, skill & location filtering, owner deletion)
* [x] **Phase 7: Farm Expense Tracker & Inventory Management** (Expense & Inventory schemas, CRUD APIs with strict user isolation, summary metrics, low stock alerts, edit/delete actions, responsive React views)
* [x] **Phase 8: Weather Integration, Income/Profit Reports, Admin Dashboard & Final Integration** (Live Open-Meteo & OpenWeather weather service with farming advisories, Income schema & financial aggregation engine, Admin dashboard with user analytics and safe moderation, complete system integration, responsive UI polish, 100% build verification)
