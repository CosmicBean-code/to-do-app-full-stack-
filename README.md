# 📝 Todo App — Full-Stack

Aplicación de lista de tareas desarrollada como proyecto final de Programación Web.

**Stack:** HTML · CSS · JavaScript · Bootstrap 5 · Node.js · Express.js · MySQL

---

## 🗂 Estructura del proyecto

```
todo-app/
├── frontend/          # Interfaz de usuario estática
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── backend/           # API REST con Express
│   ├── index.js
│   ├── package.json
│   ├── .env.example
│   ├── routes/tasks.js
│   └── db/
│       ├── connection.js
│       └── schema.sql
├── docs/              # Documentación técnica
│   ├── architecture.md
│   └── deployment.md
├── .gitignore
└── README.md
```

---

## ⚙️ Configuración local

### 1. Base de datos

```bash
mysql -u root -p < backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de MySQL
npm install
npm run dev        # desarrollo (nodemon)
# npm start        # producción
```

### 3. Frontend

Abre `frontend/index.html` con Live Server (VS Code) o cualquier servidor estático.

Asegúrate de que `API_URL` en `js/app.js` apunte a tu backend local:

```js
const API_URL = "http://localhost:3000/api";
```

---

## 🌐 URLs en producción

| Componente | Plataforma | URL |
|---|---|---|
| Frontend   | Vercel     | `https://todo-app-[tu-usuario].vercel.app` |
| Backend    | Render     | `https://todo-app-api.onrender.com` |
| Base de datos | Railway | Interno (acceso por variables de entorno) |

---

## 🔌 Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| GET    | `/api/tasks`          | Listar todas las tareas |
| GET    | `/api/tasks/:id`      | Obtener una tarea |
| POST   | `/api/tasks`          | Crear tarea |
| PUT    | `/api/tasks/:id`      | Editar tarea |
| PATCH  | `/api/tasks/:id/toggle` | Marcar completada/pendiente |
| DELETE | `/api/tasks/:id`      | Eliminar tarea |
| GET    | `/health`             | Estado del servidor |

---

## 👤 Autor

Proyecto académico — Programación Web
