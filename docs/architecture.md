# Documentación Técnica — Todo App

## 1. Justificación de plataformas

### Frontend → Vercel
- Deploy automático al hacer push a GitHub (rama `main`).
- Optimizado para sitios estáticos (HTML/CSS/JS).
- Tier gratuito sin límite de tiempo.
- CDN global incluido.

### Backend → Render
- Soporte nativo para Node.js / Express.
- Lee variables de entorno desde su panel sin configuración extra.
- Deploy automático desde GitHub.
- Tier gratuito disponible (el servicio puede tardar ~30s en despertar).

### Base de datos → Railway
- MySQL administrado, sin configurar servidores.
- Se conecta directamente al backend de Render mediante variables de entorno.
- Incluye interfaz gráfica para importar el schema `.sql`.
- Tier gratuito de $5 USD/mes en créditos.

---

## 2. Diagrama de arquitectura

```
  Usuario (navegador)
        │
        │  HTTP/HTTPS
        ▼
┌─────────────────┐
│    FRONTEND      │  Vercel CDN
│  HTML/CSS/JS    │  (todo-app.vercel.app)
│  Bootstrap 5    │
└────────┬────────┘
         │  fetch() → JSON
         │  REST API
         ▼
┌─────────────────┐
│    BACKEND       │  Render
│  Node.js 18+    │  (todo-api.onrender.com)
│  Express 4      │
│  CORS / dotenv  │
└────────┬────────┘
         │  mysql2 (pool)
         ▼
┌─────────────────┐
│   BASE DE DATOS  │  Railway
│   MySQL 8        │
│   tabla: tasks   │
└─────────────────┘
```

---

## 3. Esquema de la base de datos

```sql
tasks
├── id          INT PK AUTO_INCREMENT
├── title       VARCHAR(255) NOT NULL
├── description TEXT
├── completed   TINYINT(1) DEFAULT 0
├── created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
└── updated_at  TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

---

## 4. Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `FRONTEND_URL` | URL del frontend (CORS) | `https://todo-app.vercel.app` |
| `DB_HOST` | Host de MySQL | `containers-us.railway.app` |
| `DB_PORT` | Puerto MySQL | `3306` |
| `DB_USER` | Usuario MySQL | `root` |
| `DB_PASSWORD` | Contraseña MySQL | `••••••••` |
| `DB_NAME` | Nombre de la base | `todo_db` |

---

## 5. Pasos de despliegue seguidos

### Fase 1 — Preparación local
1. Separar proyecto en `/frontend` y `/backend`.
2. Verificar que la API y BD funcionan localmente.
3. Agregar soporte `dotenv` y eliminar valores hardcodeados.

### Fase 2 — Despliegue del backend (Render)
1. Crear cuenta en render.com.
2. New → Web Service → conectar repositorio GitHub.
3. Build command: `npm install` | Start command: `npm start`.
4. Agregar variables de entorno en el panel de Render.
5. Copiar la URL pública del servicio.

### Fase 3 — Despliegue de la BD (Railway)
1. Crear cuenta en railway.app.
2. New Project → Database → MySQL.
3. Copiar credenciales a las variables de Render.
4. Importar `backend/db/schema.sql` desde la consola de Railway.

### Fase 4 — Conectar backend con BD
1. Confirmar que las variables de entorno en Render son correctas.
2. Revisar logs de Render: debe aparecer `✅ Conexión a MySQL establecida`.

### Fase 5 — Despliegue del frontend (Vercel)
1. Crear cuenta en vercel.com.
2. Import Git Repository → seleccionar el repo.
3. Root directory: `frontend`.
4. Actualizar `API_URL` en `js/app.js` con la URL de Render.
5. Verificar que la UI carga y las llamadas a la API funcionan.

### Fase 6 — Pruebas de integración
- Crear tarea ✅
- Leer lista ✅
- Editar título/descripción ✅
- Marcar como completada ✅
- Eliminar ✅
- Sin errores CORS ✅
- Sin errores en consola ✅

---

## 6. Problemas encontrados y soluciones

| Problema | Causa | Solución |
|---|---|---|
| CORS error en producción | `FRONTEND_URL` mal configurado | Actualizar variable en Render con URL exacta de Vercel |
| Backend no arranca en Render | `PORT` hardcodeado | Usar `process.env.PORT` |
| BD no conecta | Credenciales incorrectas | Verificar variables de entorno en Render |
| Frontend llama al API local | `API_URL` apunta a `localhost` | Actualizar con URL pública de Render antes del deploy |
| Render "duerme" el servicio | Tier gratuito | Primera request tarda ~30s; el health check lo mantiene activo |
