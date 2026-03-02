<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<div align="center">
<h3 align="center">Get Campwood</h3>

  <p align="center">
    A microservice-based firewood finder that helps users locate, post, and manage firewood listings for camping or home use.
    Users can manage accounts, search via interactive maps, and perform CRUD operations on firewood locations.
    <br />
    <a href="https://github.com/cdavisv/getcampwood/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/cdavisv/getcampwood/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

---

## Table of Contents

- [About The Project](#about-the-project)
- [Architecture](#architecture)
- [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Project Structure](#project-structure)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Services](#running-the-services)
- [API Documentation](#api-documentation)
  - [Backend API](#backend-api-port-5000)
  - [Locations Service](#locations-service-port-5001)
  - [Geolocation Service](#geolocation-service-port-5002)
  - [Map UI Service](#map-ui-service-port-5174)
- [Database Schemas](#database-schemas)
- [Authentication](#authentication)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

Get Campwood is a distributed Node.js application built with a microservices architecture. It allows users to find and share firewood locations through an interactive map interface. Users can create accounts, post firewood listings with GPS coordinates, search by address, and manage their listings.

The application consists of five independent services that communicate over REST APIs:

| Service | Description | Port |
|---------|-------------|------|
| **Backend API** | Main API server handling authentication, user management, and location CRUD operations | `5000` |
| **Frontend** | React single-page application providing the user interface | `5173` |
| **Locations Service** | Standalone microservice for firewood location CRUD operations with its own data model | `5001` |
| **Geolocation Service** | Geocoding and reverse geocoding via OpenStreetMap Nominatim, plus IP-based location detection | `5002` |
| **Map UI Service** | Standalone Leaflet-based map interface with CSP-safe tile proxying and security headers | `5174` |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Architecture

```
                    ┌──────────────────┐
                    │   Frontend       │
                    │  React + Vite    │
                    │  Port: 5173      │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   Backend API    │
                    │  Express + Mongo │
                    │  Port: 5000      │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
┌─────────▼────────┐ ┌──────▼──────────┐ ┌─────▼──────────┐
│ Locations Service│ │ Geolocation Svc │ │   Map UI Svc   │
│ Express + Mongo  │ │    Express      │ │ Express+Leaflet│
│ Port: 5001       │ │ Port: 5002      │ │ Port: 5174     │
└──────────────────┘ └─────────────────┘ └────────────────┘
```

- **Frontend** communicates with the **Backend API** for authentication, user management, and location data.
- **Frontend** calls the **Geolocation Service** directly for address search and IP-based location.
- **Map UI Service** is a standalone map interface that consumes the **Locations Service** and **Geolocation Service** APIs.
- All services share the same MongoDB database and JWT secret for consistent authentication.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Built With

* **Runtime**: Node.js (v18+)
* **Backend Framework**: Express.js
* **Frontend**: React 18 + Vite
* **Database**: MongoDB (via Mongoose)
* **Authentication**: JSON Web Tokens (JWT) + bcryptjs
* **Maps**: Leaflet.js
* **Icons**: Lucide React
* **Security**: Helmet.js (CSP headers)
* **Logging**: Morgan
* **Validation**: express-validator

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Getting Started

### Prerequisites

* **Node.js** version 18 or higher
* **npm** (comes with Node.js)
* **MongoDB** — either a local MongoDB Community Edition instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud connection string

Verify your Node.js installation:

```sh
node -v
npm -v
```

### Project Structure

```
getcampwood/
├── backend/                    # Main API server (auth, users, locations)
│   ├── config/
│   │   └── database.js         # MongoDB connection setup
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── models/
│   │   ├── User.js             # User data model
│   │   └── Location.js         # Firewood location data model
│   ├── routes/
│   │   ├── auth.js             # Registration, login, logout endpoints
│   │   ├── user.js             # Profile management, account deletion
│   │   └── Locations.js        # Location CRUD + proximity search
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
│
├── frontend/
│   └── getcampwood/            # React + Vite SPA
│       ├── src/
│       │   ├── components/
│       │   │   ├── GetCampWoodHomepage.jsx  # Landing page
│       │   │   ├── LoginPage.jsx           # User login
│       │   │   ├── RegistrationPage.jsx    # User registration
│       │   │   ├── AccountPage.jsx         # Profile & listing management
│       │   │   ├── MapPage.jsx             # Interactive map with markers
│       │   │   ├── Header.jsx              # Navigation header
│       │   │   ├── Footer.jsx              # Page footer
│       │   │   └── MapPage.css             # Map page styles
│       │   ├── services/
│       │   │   └── api.js                  # API client service
│       │   ├── App.jsx                     # Main router & auth state
│       │   ├── App.css                     # App styles
│       │   ├── main.jsx                    # React entry point
│       │   └── index.css                   # Global styles
│       ├── public/                         # Static assets (logos, banner)
│       ├── vite.config.js                  # Vite build configuration
│       └── package.json
│
├── locations-service/          # Firewood locations CRUD microservice
│   ├── middleware/
│   │   └── auth.js             # JWT authentication
│   ├── models/
│   │   └── FirewoodLocation.js # Firewood location model
│   ├── server.js               # Express app with inline routes
│   ├── .env.example
│   └── package.json
│
├── geolocation-service/        # Geocoding microservice
│   ├── server.js               # Geocode, reverse geocode, IP location
│   ├── .env.example
│   └── package.json
│
├── map-ui/                     # Standalone map UI microservice
│   ├── public/
│   │   ├── index.html          # Map HTML page
│   │   └── app.js              # Map client-side JavaScript
│   ├── server.js               # Express app with CSP, tile proxy
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── LICENSE.md
└── README.md
```

### Installation

1. **Clone the repository**

```sh
git clone https://github.com/cdavisv/getcampwood.git
cd getcampwood
```

2. **Install dependencies for each service**

```sh
# Backend API
cd backend
npm install

# Frontend
cd ../frontend/getcampwood
npm install

# Locations Service
cd ../../locations-service
npm install

# Geolocation Service
cd ../geolocation-service
npm install

# Map UI Service
cd ../map-ui
npm install
```

### Environment Configuration

Each service that needs configuration has a `.env.example` file. Copy it to `.env` and fill in your values:

```sh
cp backend/.env.example backend/.env
cp locations-service/.env.example locations-service/.env
cp geolocation-service/.env.example geolocation-service/.env
cp map-ui/.env.example map-ui/.env
```

#### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | — | MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/dbname`) |
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens. Use a long random string. |
| `PORT` | No | `5000` | Port the backend API listens on |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |

#### Locations Service (`locations-service/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | Yes | — | MongoDB connection string (should be the same as the backend) |
| `JWT_SECRET` | Yes | — | JWT secret (must match the backend for shared authentication) |
| `PORT` | No | `5001` | Port the locations service listens on |
| `MONGODB_DB` | No | `getcampwood` | MongoDB database name |

#### Geolocation Service (`geolocation-service/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5002` | Port the geolocation service listens on |
| `IP_GEO_URL` | No | `https://ipapi.co/json/` | URL for IP-based geolocation API |

#### Map UI Service (`map-ui/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5174` | Port the map UI service listens on |
| `GEO_URL` | No | `http://localhost:5002/api` | Geolocation service URL |
| `LOC_URL` | No | `http://localhost:5001/api` | Locations service URL |

#### Frontend

The frontend uses Vite environment variables (prefixed with `VITE_`). These can be set in `frontend/getcampwood/.env`:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:5000/api` | Backend API base URL |

### Running the Services

Run each service in its own terminal window:

```sh
# Terminal 1: Backend API
cd backend
npm run dev          # http://localhost:5000

# Terminal 2: Frontend
cd frontend/getcampwood
npm run dev          # http://localhost:5173

# Terminal 3: Locations Service
cd locations-service
npm run dev          # http://localhost:5001

# Terminal 4: Geolocation Service
cd geolocation-service
npm start            # http://localhost:5002

# Terminal 5: Map UI Service
cd map-ui
npm start            # http://localhost:5174
```

> **Note:** The backend and frontend are the core services. The other microservices provide supplementary functionality (standalone map, geocoding, separate locations API).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## API Documentation

### Backend API (Port 5000)

#### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user. Body: `{ name, email, password }` |
| `POST` | `/api/auth/login` | Public | Login. Body: `{ email, password }`. Returns JWT token. |
| `GET` | `/api/auth/me` | Bearer | Get current authenticated user |
| `POST` | `/api/auth/logout` | Bearer | Logout (server acknowledgement; client removes token) |

#### User Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PUT` | `/api/user/profile` | Bearer | Update profile. Body: `{ name, email, currentPassword?, newPassword? }` |
| `DELETE` | `/api/user/account` | Bearer | Delete account and all associated locations |
| `GET` | `/api/user/stats` | Bearer | Get user stats (total/active/pending location counts) |

#### Locations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/locations` | Public | List active locations. Query params: `lat`, `lng`, `radius` (km), `limit` (max 100, default 50) |
| `GET` | `/api/locations/:id` | Public | Get a single active location by ID |
| `POST` | `/api/locations` | Bearer | Create a location. Body: `{ name, description?, price?, latitude, longitude }`. Rejects duplicates within ~100m. |
| `PUT` | `/api/locations/:id` | Bearer | Update a location (owner or admin only). Body: any subset of `{ name, description, price, latitude, longitude }` |
| `DELETE` | `/api/locations/:id` | Bearer | Delete a location (owner or admin only) |
| `GET` | `/api/locations/user/mine` | Bearer | Get current user's locations |

#### System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | Public | Health check — returns service status and timestamp |
| `GET` | `/api/test-db` | Public | Database connection status |

### Locations Service (Port 5001)

This is a standalone microservice with a simplified firewood location model.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | Public | Health check |
| `GET` | `/api/locations` | Public | List all locations (newest first) |
| `GET` | `/api/locations/:id` | Public | Get a single location by ID |
| `POST` | `/api/locations` | Bearer | Create a location. Body: `{ name, description?, latitude, longitude }` |
| `PUT` | `/api/locations/:id` | Bearer | Update a location (owner or admin only) |
| `DELETE` | `/api/locations/:id` | Bearer | Delete a location (owner or admin only) |

### Geolocation Service (Port 5002)

All endpoints are public. Uses OpenStreetMap Nominatim for geocoding.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/geocode?q=<address>` | Forward geocode — converts address text to `{ lat, lon, label }` |
| `GET` | `/api/reverse?lat=<lat>&lon=<lon>` | Reverse geocode — converts coordinates to `{ label, lat, lon }` |
| `GET` | `/api/me` | IP-based geolocation — returns `{ lat, lon, city, region }` |

### Map UI Service (Port 5174)

A standalone map interface served as static HTML/JS with an Express backend for configuration and tile proxying.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/config.js` | Returns runtime configuration (geolocation and locations API URLs) as JavaScript |
| `GET` | `/vendor/leaflet/*` | Serves Leaflet library assets from node_modules |
| `GET` | `/tiles/:z/:x/:y.png` | Proxies OpenStreetMap tiles (CSP-compliant same-origin access) |
| `GET` | `/*` | Serves the static map UI (SPA fallback) |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Database Schemas

All services connect to the same MongoDB instance.

### User (`backend/models/User.js`)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | String | Required, 2-50 chars | User's display name |
| `email` | String | Required, unique, validated | User's email address |
| `password` | String | Required, min 6 chars, hashed (bcrypt, cost 12) | User's password (excluded from queries by default) |
| `role` | String | Enum: `user`, `admin`. Default: `user` | User role for authorization |
| `isActive` | Boolean | Default: `true` | Whether the account is active |
| `lastLogin` | Date | — | Timestamp of last login |
| `createdAt` | Date | Auto | Account creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Location (`backend/models/Location.js`)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | String | Required, 1-100 chars | Location name |
| `description` | String | Max 500 chars | Location description |
| `price` | Number | Min 0 | Price per bundle/cord |
| `latitude` | Number | Required, -90 to 90 | GPS latitude |
| `longitude` | Number | Required, -180 to 180 | GPS longitude |
| `createdBy` | ObjectId | Required, ref: User | User who created this location |
| `status` | String | Enum: `active`, `pending`, `rejected`. Default: `active` | Moderation status |
| `verified` | Boolean | Default: `false` | Whether the location has been verified |
| `reportCount` | Number | Default: `0` | Number of reports against this location |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

**Indexes:** Geospatial index on lat/lng, text index on name + description.

### FirewoodLocation (`locations-service/models/FirewoodLocation.js`)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `name` | String | Required | Location name |
| `description` | String | — | Location description |
| `latitude` | Number | Required | GPS latitude |
| `longitude` | Number | Required | GPS longitude |
| `addedBy` | String | — | User email or ID of the creator |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Authentication

The application uses **JSON Web Tokens (JWT)** for authentication:

1. **Registration/Login** — The backend creates a JWT signed with `JWT_SECRET` containing the user's ID. The token expires after **7 days**.
2. **Token Storage** — The frontend stores the token in `localStorage` and includes it in API requests as a `Bearer` token in the `Authorization` header.
3. **Middleware** — Protected endpoints use authentication middleware that verifies the JWT, looks up the user in the database, and confirms the account is active.
4. **Authorization** — Location update/delete operations check that the requesting user is either the **owner** of the location or has an **admin** role.
5. **Cross-Tab Sync** — The frontend listens for `storage` events to synchronize auth state across browser tabs.

> **Important:** The `JWT_SECRET` must be the same across all services that verify tokens (backend and locations-service) so that tokens are interchangeable.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Usage

Once all services are running:

1. Visit **http://localhost:5173** in your browser
2. **Create an account** using the registration page
3. **Log in** with your credentials
4. **View the map** to see existing firewood locations
5. **Click on the map** to add a new firewood listing (or use the + button)
6. **Search by address** using the search bar on the map page
7. **Use "My Location"** to center the map on your current position
8. **Manage your listings** from the Account page
9. **Delete your own listings** by clicking on a marker and using the delete button

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Roadmap

- [ ] User messaging system
- [ ] Image uploads for listings
- [ ] Mobile app client
- [ ] Admin dashboard
- [ ] AI-based location quality scoring
- [ ] Offline caching (PWA)

See the [open issues](https://github.com/cdavisv/getcampwood/issues) for more.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Contributing

Contributions are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Added my feature"`)
4. Push to your branch (`git push origin feature/my-feature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## License

Distributed under a custom proprietary "Look but Do Not Touch" License. See [LICENSE.md](LICENSE.md) for details.

Copyright (c) 2025 Charles Davis

---

## Contact

**Charles Davis**

Project Link: [https://github.com/cdavisv/getcampwood](https://github.com/cdavisv/getcampwood)

[![LinkedIn][linkedin-shield]][linkedin-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/cdavisv/getcampwood.svg?style=for-the-badge
[contributors-url]: https://github.com/cdavisv/getcampwood/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/cdavisv/getcampwood.svg?style=for-the-badge
[forks-url]: https://github.com/cdavisv/getcampwood/network/members
[stars-shield]: https://img.shields.io/github/stars/cdavisv/getcampwood.svg?style=for-the-badge
[stars-url]: https://github.com/cdavisv/getcampwood/stargazers
[issues-shield]: https://img.shields.io/github/issues/cdavisv/getcampwood.svg?style=for-the-badge
[issues-url]: https://github.com/cdavisv/getcampwood/issues
[license-shield]: https://img.shields.io/badge/License-Custom-blue.svg?style=for-the-badge
[license-url]: https://github.com/cdavisv/getcampwood/blob/main/LICENSE.md
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/charles-a-davis-v/
