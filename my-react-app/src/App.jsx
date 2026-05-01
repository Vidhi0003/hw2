import { useState, useEffect } from "react";

export default function App() {
  // ✅ LocalStorage
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [];
  });

  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("all");

  // Inline editing
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Undo delete
  const [lastDeleted, setLastDeleted] = useState(null);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // ✅ Add
  function addTodo(e) {
    e.preventDefault();
    if (!draft.trim()) return;

    setTodos([
      { id: Date.now(), text: draft, completed: false },
      ...todos,
    ]);
    setDraft("");
  }

  // ✅ Toggle
  function toggleTodo(id) {
    if (editingId) return;

    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  // ✅ Delete + Undo
  function deleteTodo(id) {
    const deleted = todos.find((t) => t.id === id);
    setLastDeleted(deleted);

    setTodos(todos.filter((t) => t.id !== id));

    setTimeout(() => setLastDeleted(null), 5000);
  }

  function undoDelete() {
    if (lastDeleted) {
      setTodos([lastDeleted, ...todos]);
      setLastDeleted(null);
    }
  }

  // ✅ Inline Editing
  function startEditing(todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  function saveEdit(id) {
    if (!editText.trim()) return;

    setTodos(
      todos.map((t) =>
        t.id === id ? { ...t, text: editText } : t
      )
    );
    setEditingId(null);
  }

  // ✅ Bulk delete completed
  function clearCompleted() {
    setTodos(todos.filter((t) => !t.completed));
  }

  // ✅ Filtering
  const visibleTodos =
    filter === "active"
      ? todos.filter((t) => !t.completed)
      : filter === "completed"
      ? todos.filter((t) => t.completed)
      : todos;

  // ✅ Stats
  const remaining = todos.filter((t) => !t.completed).length;
  const completed = todos.filter((t) => t.completed).length;
  const total = todos.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6f8",
        display: "flex",
        justifyContent: "center",
        paddingTop: 40,
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          width: 420,
          background: "white",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ marginBottom: 4 }}>📝 Todo App</h1>

        {/* Guidance */}
        <p style={{ fontSize: 13, color: "#666" }}>
          Double-click to edit • Click to toggle complete
        </p>

        {/* Input */}
        <form onSubmit={addTodo} style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a new task..."
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
          <button
            style={{
              background: "#4f46e5",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </form>

        {/* Filters */}
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                flex: 1,
                padding: 6,
                borderRadius: 20,
                border: "1px solid #ddd",
                background: filter === f ? "#4f46e5" : "white",
                color: filter === f ? "white" : "#333",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Clear Completed */}
        {completed > 0 && (
          <button
            onClick={clearCompleted}
            style={{
              marginTop: 10,
              fontSize: 12,
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
            }}
          >
            Clear all completed tasks
          </button>
        )}

        {/* Stats + Progress */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span>{remaining} tasks remaining</span>
            <span>{completed} completed</span>
          </div>

          <div
            style={{
              marginTop: 6,
              height: 8,
              background: "#eee",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: "100%",
                background: "#4f46e5",
                borderRadius: 10,
                transition: "width 0.3s",
              }}
            />
          </div>

          <p style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
            {percent}% complete
          </p>
        </div>

        {/* Undo */}
        {lastDeleted && (
          <div
            style={{
              marginTop: 12,
              padding: 8,
              background: "#c12727",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            Todo deleted —{" "}
            <button onClick={undoDelete}>Undo?</button>
          </div>
        )}

        {/* Empty States */}
        {todos.length === 0 ? (
          <p style={{ marginTop: 20, color: "#888" }}>
            No tasks yet. Add one above!
          </p>
        ) : visibleTodos.length === 0 ? (
          <p style={{ marginTop: 20, color: "#888" }}>
            No completed tasks. Finish something first.
          </p>
        ) : (
          <ul style={{ marginTop: 16, padding: 0 }}>
            {visibleTodos.map((todo) => (
              <li
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                style={{
                  listStyle: "none",
                  padding: 10,
                  marginBottom: 8,
                  borderRadius: 10,
                  background: "#fafafa",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                {editingId === todo.id ? (
                  <input
                    value={editText}
                    autoFocus
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(todo.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEditing(todo)}
                    style={{
                      textDecoration: todo.completed ? "line-through" : "none",
                      color: todo.completed ? "#999" : "#222",
                    }}
                  >
                    {todo.text}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTodo(todo.id);
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#999",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}