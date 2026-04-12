/* ═══════════════════════════════════════════════
   CONFIGURACIÓN
   Cambia API_URL cuando despliegues el backend.
═══════════════════════════════════════════════ */
const API_URL = "http://localhost:3000/api";

/* ═══════════════════════════════════════════════
   ESTADO DE LA APLICACIÓN
═══════════════════════════════════════════════ */
const state = {
  tasks: [],          // todas las tareas cargadas
  filter: "all",      // "all" | "pending" | "completed"
  search: "",         // texto de búsqueda
  editingId: null,    // id de la tarea en edición
  deletingId: null,   // id de la tarea a eliminar
  loading: false,
};

/* ═══════════════════════════════════════════════
   REFERENCIAS AL DOM
═══════════════════════════════════════════════ */
const $ = (id) => document.getElementById(id);

const DOM = {
  taskList:       $("taskList"),
  stateLoading:   $("stateLoading"),
  stateError:     $("stateError"),
  stateEmpty:     $("stateEmpty"),
  emptyTitle:     $("emptyTitle"),
  emptySubtext:   $("emptySubtext"),
  retryBtn:       $("retryBtn"),
  pageTitle:      $("pageTitle"),
  pageSubtitle:   $("pageSubtitle"),
  // Sidebar filtros
  filterAll:      $("filterAll"),
  filterPending:  $("filterPending"),
  filterCompleted:$("filterCompleted"),
  countAll:       $("countAll"),
  countPending:   $("countPending"),
  countCompleted: $("countCompleted"),
  progressBar:    $("progressBar"),
  progressLabel:  $("progressLabel"),
  // Modal tarea
  taskModal:      $("taskModal"),
  taskTitle:      $("taskTitle"),
  taskDesc:       $("taskDesc"),
  taskModalLabel: $("taskModalLabel"),
  saveTaskBtn:    $("saveTaskBtn"),
  saveBtnText:    $("saveBtnText"),
  saveBtnSpinner: $("saveBtnSpinner"),
  newTaskBtn:     $("newTaskBtn"),
  // Modal eliminar
  deleteModal:    $("deleteModal"),
  confirmDeleteBtn: $("confirmDeleteBtn"),
  deleteBtnText:  $("deleteBtnText"),
  deleteBtnSpinner: $("deleteBtnSpinner"),
  // Búsqueda
  searchInput:    $("searchInput"),
  searchClear:    $("searchClear"),
  // Toast
  toastContainer: $("toastContainer"),
};

// Instancias de Bootstrap
const bsTaskModal   = new bootstrap.Modal(DOM.taskModal);
const bsDeleteModal = new bootstrap.Modal(DOM.deleteModal);

/* ═══════════════════════════════════════════════
   UTILIDADES
═══════════════════════════════════════════════ */

/**
 * Muestra una notificación tipo toast en la esquina inferior derecha.
 * @param {string} message - Texto del mensaje
 * @param {"success"|"error"} type
 */
function showToast(message, type = "success") {
  const id = `toast-${Date.now()}`;
  const iconMap = { success: "bi-check-circle-fill", error: "bi-exclamation-circle-fill" };

  const html = `
    <div id="${id}" class="toast toast-${type}" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-body">
        <span class="toast-dot"></span>
        <span>${message}</span>
      </div>
    </div>
  `;

  DOM.toastContainer.insertAdjacentHTML("beforeend", html);
  const toastEl  = document.getElementById(id);
  const bsToast  = new bootstrap.Toast(toastEl, { delay: 3000 });
  bsToast.show();

  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}

/**
 * Formatea una fecha ISO a texto legible.
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Escapa HTML para prevenir XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}

/**
 * Establece el estado de carga de un botón.
 * @param {HTMLElement} btn
 * @param {HTMLElement} textEl
 * @param {HTMLElement} spinnerEl
 * @param {boolean} loading
 * @param {string} [loadingText]
 */
function setButtonLoading(btn, textEl, spinnerEl, loading, loadingText = "") {
  btn.disabled = loading;
  spinnerEl.classList.toggle("d-none", !loading);
  if (loadingText) textEl.textContent = loading ? loadingText : textEl.dataset.original;
}

/* ═══════════════════════════════════════════════
   API — PETICIONES HTTP
═══════════════════════════════════════════════ */

/**
 * Wrapper genérico para fetch con manejo de errores centralizado.
 * Siempre informa al usuario sobre el resultado de la operación.
 */
async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const msg  = body.message || `Error ${response.status}`;
    throw new Error(msg);
  }

  // 204 No Content (DELETE)
  if (response.status === 204) return null;

  return response.json();
}

/** GET /api/tasks */
async function fetchTasks() {
  return apiFetch("/tasks");
}

/** POST /api/tasks */
async function createTask(title, description) {
  return apiFetch("/tasks", {
    method: "POST",
    body: JSON.stringify({ title, description }),
  });
}

/** PUT /api/tasks/:id */
async function updateTask(id, title, description) {
  return apiFetch(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, description }),
  });
}

/** PATCH /api/tasks/:id/toggle */
async function toggleTask(id) {
  return apiFetch(`/tasks/${id}/toggle`, { method: "PATCH" });
}

/** DELETE /api/tasks/:id */
async function deleteTask(id) {
  return apiFetch(`/tasks/${id}`, { method: "DELETE" });
}

/* ═══════════════════════════════════════════════
   RENDER
═══════════════════════════════════════════════ */

/**
 * Devuelve las tareas filtradas por estado y búsqueda.
 */
function getFilteredTasks() {
  return state.tasks.filter((t) => {
    const matchFilter =
      state.filter === "all"       ? true :
      state.filter === "pending"   ? !t.completed :
      state.filter === "completed" ? t.completed : true;

    const q = state.search.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q);

    return matchFilter && matchSearch;
  });
}

/**
 * Actualiza los contadores de la barra lateral y la barra de progreso.
 */
function updateSidebar() {
  const total     = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  const pending   = total - completed;
  const pct       = total ? Math.round((completed / total) * 100) : 0;

  DOM.countAll.textContent       = total;
  DOM.countPending.textContent   = pending;
  DOM.countCompleted.textContent = completed;
  DOM.progressBar.style.width    = `${pct}%`;
  DOM.progressLabel.textContent  = `${pct}%`;
}

/**
 * Actualiza el subtítulo con el número de tareas visibles.
 */
function updateSubtitle(count) {
  const labels = {
    all:       "Todas las tareas",
    pending:   "Pendientes",
    completed: "Completadas",
  };
  DOM.pageTitle.textContent = labels[state.filter];
  DOM.pageSubtitle.textContent =
    count === 0
      ? "Sin resultados"
      : `${count} tarea${count !== 1 ? "s" : ""}`;
}

/**
 * Muestra u oculta los estados especiales (loading, error, vacío).
 */
function showState(name) {
  ["stateLoading", "stateError", "stateEmpty"].forEach((id) => {
    DOM[id].classList.add("d-none");
  });
  if (name) DOM[name].classList.remove("d-none");
}

/**
 * Renderiza la lista de tareas en el DOM.
 */
function renderTasks() {
  const filtered = getFilteredTasks();

  updateSidebar();
  updateSubtitle(filtered.length);

  // Ocultar lista siempre primero
  DOM.taskList.innerHTML = "";

  if (state.loading) {
    showState("stateLoading");
    return;
  }

  if (filtered.length === 0) {
    const isSearch = state.search.trim() !== "";
    DOM.emptyTitle.textContent   = isSearch ? "Sin resultados" : "Sin tareas";
    DOM.emptySubtext.textContent = isSearch
      ? `No hay tareas que coincidan con "${state.search}".`
      : state.filter === "completed"
        ? "Aún no has completado ninguna tarea."
        : state.filter === "pending"
          ? "¡Todo al día! No hay tareas pendientes."
          : 'Crea tu primera tarea con el botón "Nueva".';
    showState("stateEmpty");
    return;
  }

  showState(null); // oculta todos los estados

  filtered.forEach((task) => {
    const card = document.createElement("div");
    card.className = `task-card${task.completed ? " completed" : ""}`;
    card.dataset.id = task.id;

    card.innerHTML = `
      <div
        class="task-check${task.completed ? " checked" : ""}"
        role="checkbox"
        aria-checked="${task.completed}"
        aria-label="Marcar como ${task.completed ? "pendiente" : "completada"}"
        tabindex="0"
        data-action="toggle"
        data-id="${task.id}"
      ></div>
      <div class="task-body">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ""}
        <div class="task-meta">${formatDate(task.created_at)}</div>
      </div>
      <div class="task-actions">
        <button class="action-btn" aria-label="Editar tarea" data-action="edit" data-id="${task.id}">
          <i class="bi bi-pencil" aria-hidden="true"></i>
        </button>
        <button class="action-btn danger" aria-label="Eliminar tarea" data-action="delete" data-id="${task.id}">
          <i class="bi bi-trash3" aria-hidden="true"></i>
        </button>
      </div>
    `;

    DOM.taskList.appendChild(card);
  });
}

/* ═══════════════════════════════════════════════
   CARGA INICIAL
═══════════════════════════════════════════════ */
async function loadTasks() {
  state.loading = true;
  renderTasks();

  try {
    const data  = await fetchTasks();
    state.tasks = data;
    showState(null);
  } catch (err) {
    console.error("[loadTasks]", err);
    showState("stateError");
    showToast("No se pudo conectar al servidor.", "error");
  } finally {
    state.loading = false;
    renderTasks();
  }
}

/* ═══════════════════════════════════════════════
   MODAL TAREA — abrir / guardar
═══════════════════════════════════════════════ */

/** Prepara el modal para una nueva tarea. */
function openNewModal() {
  state.editingId             = null;
  DOM.taskModalLabel.textContent = "Nueva tarea";
  DOM.saveBtnText.textContent    = "Guardar";
  DOM.taskTitle.value            = "";
  DOM.taskDesc.value             = "";
  DOM.taskTitle.classList.remove("is-invalid");
  bsTaskModal.show();
}

/** Prepara el modal para editar una tarea existente. */
function openEditModal(id) {
  const task = state.tasks.find((t) => t.id == id);
  if (!task) return;

  state.editingId                = id;
  DOM.taskModalLabel.textContent = "Editar tarea";
  DOM.saveBtnText.textContent    = "Guardar cambios";
  DOM.taskTitle.value            = task.title;
  DOM.taskDesc.value             = task.description || "";
  DOM.taskTitle.classList.remove("is-invalid");
  bsTaskModal.show();
}

/** Maneja el submit del modal (crear o editar). */
async function handleSaveTask() {
  const title = DOM.taskTitle.value.trim();
  const desc  = DOM.taskDesc.value.trim();

  // Validación con feedback visual inmediato
  if (!title) {
    DOM.taskTitle.classList.add("is-invalid");
    DOM.taskTitle.focus();
    return;
  }
  DOM.taskTitle.classList.remove("is-invalid");

  // Mostrar spinner mientras se procesa
  setButtonLoading(DOM.saveTaskBtn, DOM.saveBtnText, DOM.saveBtnSpinner, true, "Guardando...");

  try {
    if (state.editingId) {
      // EDITAR
      const updated = await updateTask(state.editingId, title, desc);
      const idx     = state.tasks.findIndex((t) => t.id == state.editingId);
      if (idx !== -1) state.tasks[idx] = updated;
      showToast("Tarea actualizada correctamente.", "success");
    } else {
      // CREAR
      const created = await createTask(title, desc);
      state.tasks.unshift(created);
      showToast("Tarea creada correctamente.", "success");
    }

    bsTaskModal.hide();
    renderTasks();
  } catch (err) {
    console.error("[handleSaveTask]", err);
    showToast(`No se pudo guardar la tarea: ${err.message}`, "error");
  } finally {
    setButtonLoading(DOM.saveTaskBtn, DOM.saveBtnText, DOM.saveBtnSpinner, false);
    DOM.saveBtnText.textContent = state.editingId ? "Guardar cambios" : "Guardar";
  }
}

/* ═══════════════════════════════════════════════
   TOGGLE COMPLETADA
═══════════════════════════════════════════════ */
async function handleToggle(id) {
  // Actualización optimista: cambia el estado en UI antes de esperar la red
  const idx = state.tasks.findIndex((t) => t.id == id);
  if (idx === -1) return;

  state.tasks[idx].completed = !state.tasks[idx].completed;
  renderTasks();

  try {
    const updated = await toggleTask(id);
    state.tasks[idx] = updated;
    renderTasks();
    const msg = updated.completed ? "Tarea marcada como completada." : "Tarea marcada como pendiente.";
    showToast(msg, "success");
  } catch (err) {
    // Revertir si falla
    state.tasks[idx].completed = !state.tasks[idx].completed;
    renderTasks();
    showToast("No se pudo actualizar la tarea.", "error");
    console.error("[handleToggle]", err);
  }
}

/* ═══════════════════════════════════════════════
   ELIMINAR TAREA
═══════════════════════════════════════════════ */
function openDeleteModal(id) {
  state.deletingId = id;
  bsDeleteModal.show();
}

async function handleConfirmDelete() {
  const id = state.deletingId;
  if (!id) return;

  setButtonLoading(DOM.confirmDeleteBtn, DOM.deleteBtnText, DOM.deleteBtnSpinner, true, "Eliminando...");

  try {
    await deleteTask(id);
    state.tasks = state.tasks.filter((t) => t.id != id);
    bsDeleteModal.hide();
    renderTasks();
    showToast("Tarea eliminada.", "success");
  } catch (err) {
    console.error("[handleConfirmDelete]", err);
    showToast(`No se pudo eliminar: ${err.message}`, "error");
  } finally {
    setButtonLoading(DOM.confirmDeleteBtn, DOM.deleteBtnText, DOM.deleteBtnSpinner, false);
    DOM.deleteBtnText.textContent = "Eliminar";
    state.deletingId = null;
  }
}

/* ═══════════════════════════════════════════════
   FILTROS DE NAVEGACIÓN
═══════════════════════════════════════════════ */
function setFilter(filter) {
  state.filter = filter;

  ["filterAll", "filterPending", "filterCompleted"].forEach((id) => {
    DOM[id].classList.remove("active");
  });

  const map = { all: "filterAll", pending: "filterPending", completed: "filterCompleted" };
  DOM[map[filter]].classList.add("active");

  renderTasks();
}

/* ═══════════════════════════════════════════════
   BÚSQUEDA
═══════════════════════════════════════════════ */
function handleSearch(e) {
  state.search = e.target.value;
  DOM.searchClear.classList.toggle("d-none", state.search === "");
  renderTasks();
}

function clearSearch() {
  state.search           = "";
  DOM.searchInput.value  = "";
  DOM.searchClear.classList.add("d-none");
  DOM.searchInput.focus();
  renderTasks();
}

/* ═══════════════════════════════════════════════
   EVENT LISTENERS
═══════════════════════════════════════════════ */

// Botón "Nueva tarea" en el sidebar
DOM.newTaskBtn.addEventListener("click", openNewModal);

// Guardar tarea
DOM.saveTaskBtn.addEventListener("click", handleSaveTask);

// Enviar con Enter dentro del modal
DOM.taskTitle.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); handleSaveTask(); }
});
DOM.taskDesc.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) handleSaveTask();
});

// Confirmar eliminación
DOM.confirmDeleteBtn.addEventListener("click", handleConfirmDelete);

// Limpiar estado al abrir modal nuevo desde el botón topbar
DOM.taskModal.addEventListener("show.bs.modal", () => {
  // Si no viene de editar, limpia el form
  if (!state.editingId) {
    DOM.taskTitle.value = "";
    DOM.taskDesc.value  = "";
    DOM.taskTitle.classList.remove("is-invalid");
    DOM.taskModalLabel.textContent = "Nueva tarea";
    DOM.saveBtnText.textContent    = "Guardar";
  }
});

// Limpiar editingId al cerrar el modal
DOM.taskModal.addEventListener("hidden.bs.modal", () => {
  state.editingId = null;
});

// Reintentar carga
DOM.retryBtn.addEventListener("click", loadTasks);

// Filtros
DOM.filterAll.addEventListener("click",       () => setFilter("all"));
DOM.filterPending.addEventListener("click",   () => setFilter("pending"));
DOM.filterCompleted.addEventListener("click", () => setFilter("completed"));

// Búsqueda
DOM.searchInput.addEventListener("input", handleSearch);
DOM.searchClear.addEventListener("click", clearSearch);

// Delegación de eventos en la lista de tareas (toggle, edit, delete)
DOM.taskList.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;

  const { action, id } = el.dataset;
  if (action === "toggle") handleToggle(id);
  if (action === "edit")   openEditModal(id);
  if (action === "delete") openDeleteModal(id);
});

// Soporte teclado para los checkboxes personalizados
DOM.taskList.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const el = e.target.closest("[data-action='toggle']");
  if (el) { e.preventDefault(); handleToggle(el.dataset.id); }
});

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
loadTasks();
