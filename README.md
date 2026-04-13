# 📝 Todo App — Full-Stack

Full-stack to-do list application built as a final project for Web Programming.

**Stack:** HTML · CSS · JavaScript · Bootstrap 5 · Node.js · Express.js · MySQL (TiDB Cloud)

---

## 📁 Project Structure

```
todo-app/
├── frontend/                  # Static user interface
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── backend/                   # REST API with Express
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   ├── routes/tasks.js
│   └── db/
│       ├── connection.js
│       └── schema.sql
├── docs/
│   ├── architecture.md
│   └── diagrams/
│       ├── architecture.png
│       └── deployment-flow.png
├── .gitignore
├── README.md
└── .git
```

---

## ⚙️ Local Setup

### 1. Database (TiDB Cloud)
- Create a free cluster at https://tidbcloud.com
- Go to Connect → General and copy your credentials
- Open the SQL Editor and paste the contents of backend/db/schema.sql

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your TiDB Cloud credentials
npm install
npm run dev or node index.js
```

### 3. Frontend

Open `frontend/index.html` with Live Server (VS Code) or run:

```bash
npx serve frontend/
```

Make sure `API_URL` in `js/app.js` points to your local backend:

```js
const API_URL = "http://localhost:3000/api";
```

---

## 🌐 Production URLs

| Component  | Platform   | URL                                    |
|------------|------------|----------------------------------------|
| Frontend   | Vercel     | https://todo-app-[username].vercel.app |
| Backend    | Render     | https://todo-app-api.onrender.com      |
| Database   | TiDB Cloud | Internal (env variables)               |

---

## 🔌 API Endpoints

| Method | Route                  | Description                |
|--------|------------------------|----------------------------|
| GET    | /api/tasks             | List all tasks             |
| GET    | /api/tasks/:id         | Get a single task          |
| POST   | /api/tasks             | Create a new task          |
| PUT    | /api/tasks/:id         | Update title / description |
| PATCH  | /api/tasks/:id/toggle  | Toggle completed status    |
| DELETE | /api/tasks/:id         | Delete a task              |
| GET    | /health                | Server health check        |