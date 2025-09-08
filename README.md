# 🎟️ EventHub

EventHub is a **full-stack MERN application** that allows users to browse and RSVP for events, download calendar invites, and use **QR-coded tickets** for check-ins.  
Built with **React (Vite)** on the frontend and **Node.js + Express + MongoDB** on the backend.

---

## 🚀 Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (>= 18)
- [pnpm](https://pnpm.io/) (>= 9)
- [MongoDB](https://www.mongodb.com/) (local or Atlas cluster)

Install pnpm globally:

```bash
npm install -g pnpm
```

---

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/event-hub.git
cd event-hub
```

---

### 3. Install Dependencies

```bash
pnpm install
```

---

### 4. Configure Environment Variables

**Backend (`apps/server/.env`):**

```
PORT=4000
MONGODB_URI=yourmongodburl
JWT_SECRET=supersecretkey
QR_SECRET=qrsecretkey
```

**Frontend (`apps/client/.env`):**

```
VITE_API_BASE_URL=http://localhost:4000/api
```

---

### 5. Seed Demo Data

Populate the database with demo users and events:

```bash
pnpm -C apps/server run seed
```

Demo login credentials:

- **Student:** `student@demo.com / Student123!`

---

### 6. Run the Project

**Run backend:**

```bash
pnpm -C apps/server run dev
```

**Run frontend:**

```bash
pnpm -C apps/client run dev
```

- Backend runs at: [http://localhost:4000](http://localhost:4000)
- Frontend runs at: [http://localhost:5173](http://localhost:5173)

---

## 🐞 Troubleshooting

- **Blank screen?** Check frontend `.env` file for correct API URL.
- **MongoDB error?** Ensure MongoDB is running locally or replace the URI with your Atlas cluster string.
- **401 Unauthorized?** Log in using the demo credentials before accessing protected routes.

---

## 📜 License

MIT License © 2025 Sudip Sharma