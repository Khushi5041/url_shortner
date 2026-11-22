# Shortly — URL Shortener with Click Analytics

A full-stack URL shortener with custom short links, QR code generation, fast redirects, and a dashboard for tracking link performance.

## Live Demo

**[Open Shortly](https://khushi-url-shortner.vercel.app/)**

- **Frontend:** Vercel
- **Backend API:** Render
- **Database:** MongoDB Atlas
- **Source Code:** [GitHub Repository](https://github.com/Khushi5041/url_shortner)

## Features

- Create short URLs with unique short codes
- Custom aliases, expiry, click limits, password protection, and one-time links
- Fast `GET /s/:code` redirects using HTTP 302
- QR code generation and download for short links
- Click analytics dashboard with charts and breakdowns
- Analytics for devices, browsers, referrers, and countries
- Manage links with search, enable/disable, delete, and bulk actions
- Authentication with JWT
- Security protections including rate limiting, Helmet, and destination URL validation

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React 18+, Vite, Tailwind CSS, Recharts, qrcode.react, Axios |
| Backend | Node.js, Express.js, Mongoose, JWT |
| Database | MongoDB Atlas |
| Deployment | Vercel (frontend), Render (backend) |

## Run Locally

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB local instance or a MongoDB Atlas connection string

### 1. Clone the repository

```bash
git clone https://github.com/Khushi5041/url_shortner.git
cd url_shortner
```

### 2. Set up the backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Configure the required environment variables in `server/.env` using the names and format shown in `.env.example`. Keep real secrets private and never commit your `.env` file.

Backend runs at `http://localhost:5001` (unless configured otherwise).

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Set the frontend API URL in `client/.env` as shown in `client/.env.example`.

Frontend runs at `http://localhost:5173`.

## Key API Routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `POST` | `/api/urls` | Create a short link |
| `GET` | `/api/urls` | List the authenticated user's links |
| `GET` | `/api/urls/:id/analytics` | Get link analytics |
| `POST` | `/api/urls/:code/verify` | Verify a password-protected link |
| `GET` | `/s/:code` | Redirect to the original URL |

## Implementation Highlights

- **Short codes:** 7-character Base62 codes generated with `crypto.randomBytes`, with collision handling.
- **HTTP 302 redirects:** Avoids permanent browser caching and keeps link behavior changeable.
- **Redirect performance:** A unique database index and in-memory cache help resolve short codes quickly.
- **Asynchronous analytics:** Click logging is performed after the redirect response is sent.
- **Security:** Rate limiting, Helmet, and destination URL validation help protect the service.

## Deployment

- The React/Vite frontend is deployed on **Vercel**.
- The Express backend is deployed on **Render**.
- **MongoDB Atlas** hosts the production database.

## Project Structure

```
server/
  src/       Express API, models, and redirect logic
client/
  src/       React application and dashboard
```

---

If you find this project useful, feel free to explore the repository and try the [live demo](https://khushi-url-shortner.vercel.app/).
