const express = require("express");
const router  = express.Router();
const db      = require("../db/connection");

/* ══════════════════════════════════════
   GET /api/tasks
   Devuelve todas las tareas, más recientes primero.
══════════════════════════════════════ */
router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tasks ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

/* ══════════════════════════════════════
   GET /api/tasks/:id
   Devuelve una tarea por id.
══════════════════════════════════════ */
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/* ══════════════════════════════════════
   POST /api/tasks
   Crea una nueva tarea.
   Body: { title: string, description?: string }
══════════════════════════════════════ */
router.post("/", async (req, res, next) => {
  try {
    const { title, description = "" } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "El campo 'title' es obligatorio." });
    }

    const [result] = await db.query(
      "INSERT INTO tasks (title, description) VALUES (?, ?)",
      [title.trim(), description.trim()]
    );

    // Devolver la tarea recién creada
    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/* ══════════════════════════════════════
   PUT /api/tasks/:id
   Actualiza título y descripción de una tarea.
   Body: { title: string, description?: string }
══════════════════════════════════════ */
router.put("/:id", async (req, res, next) => {
  try {
    const { title, description = "" } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "El campo 'title' es obligatorio." });
    }

    const [result] = await db.query(
      "UPDATE tasks SET title = ?, description = ? WHERE id = ?",
      [title.trim(), description.trim(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/* ══════════════════════════════════════
   PATCH /api/tasks/:id/toggle
   Alterna el estado completed de una tarea.
══════════════════════════════════════ */
router.patch("/:id/toggle", async (req, res, next) => {
  try {
    // Leer estado actual
    const [rows] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    const newCompleted = rows[0].completed ? 0 : 1;

    await db.query(
      "UPDATE tasks SET completed = ? WHERE id = ?",
      [newCompleted, req.params.id]
    );

    const [updated] = await db.query(
      "SELECT * FROM tasks WHERE id = ?",
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (err) {
    next(err);
  }
});

/* ══════════════════════════════════════
   DELETE /api/tasks/:id
   Elimina una tarea permanentemente.
══════════════════════════════════════ */
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await db.query(
      "DELETE FROM tasks WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarea no encontrada." });
    }

    res.status(204).send(); // Sin contenido
  } catch (err) {
    next(err);
  }
});

module.exports = router;
