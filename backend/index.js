require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const taskRoutes = require("./routes/tasks");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());

/* ── Rutas ── */
app.use("/api/tasks", taskRoutes);

/* ── Health check (útil para Render) ── */
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/* ── 404 ── */
app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada." });
});

/* ── Error handler global ── */
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ message: "Error interno del servidor." });
});

/* ── Arrancar ── */
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
