# GetCampWood Frontend

React single-page application for the GetCampWood firewood marketplace.

## Tech Stack

- **React** 18.2 with JSX
- **Vite** 4.4 (dev server & build tool)
- **Leaflet** 1.9 (interactive maps)
- **Lucide React** (icons)
- **ESLint** (code quality)

## Available Scripts

```sh
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Build for production (output: dist/)
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

Create a `.env` file in this directory to override:

```sh
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
src/
├── components/
│   ├── GetCampWoodHomepage.jsx   # Landing page with hero and features
│   ├── LoginPage.jsx             # Login form with validation
│   ├── RegistrationPage.jsx      # Registration form with validation
│   ├── AccountPage.jsx           # Profile management and listing cards
│   ├── MapPage.jsx               # Interactive Leaflet map with markers
│   ├── Header.jsx                # Navigation with responsive hamburger menu
│   ├── Footer.jsx                # Footer with links and newsletter section
│   └── MapPage.css               # Map page styles
├── services/
│   └── api.js                    # API client (auth, locations, user management)
├── App.jsx                       # Main router and auth state management
├── App.css                       # App-level styles
├── main.jsx                      # React entry point
└── index.css                     # Global styles
```

## Pages

- **Home** — Landing page with feature highlights and call-to-action buttons
- **Login** — Email/password login with client-side validation
- **Register** — Account creation with password confirmation
- **Account** — Profile editing, password changes, listing management cards, account deletion
- **Map** — Interactive map with location markers, address search, geolocation, and add/delete locations
