-- ══════════════════════════════════════
--  SCHEMA — Todo App
--  Ejecutar en Railway / PlanetScale /
--  tu instancia MySQL antes de iniciar.
-- ══════════════════════════════════════

CREATE DATABASE IF NOT EXISTS todo_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE todo_db;

CREATE TABLE IF NOT EXISTS tasks (
  id          INT           NOT NULL AUTO_INCREMENT,
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  completed   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de ejemplo (opcional, eliminar en producción)
INSERT INTO tasks (title, description, completed) VALUES
  ('Configurar el entorno local',  'Instalar Node.js, npm y MySQL', 1),
  ('Crear el esquema de la BD',    'Ejecutar schema.sql en la base de datos', 1),
  ('Desplegar el backend',         'Usar Render con variables de entorno', 0),
  ('Desplegar la base de datos',   'Crear instancia MySQL en Railway', 0),
  ('Desplegar el frontend',        'Conectar repositorio a Vercel', 0),
  ('Pruebas de integración CRUD',  'Verificar que todas las rutas funcionen', 0);
