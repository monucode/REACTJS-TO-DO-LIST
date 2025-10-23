// src/component/KanbanBoard.js
import React, { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./KanbanBoard.css";

/* column skeleton */
const columnsStore = {
  todo:       { name: "To Do",       items: [] },
  inprogress: { name: "In Progress", items: [] },
  done:       { name: "Done",        items: [] },
};

/**
 * Props (all optional for backward-compat):
 *   ▸ projectId : uuid  – per-project mode if provided
 *   ▸ onBack()  : func  – top-bar back button handler
 */
export default function KanbanBoard({ projectId = null, onBack = null }) {
  const [columns, setColumns] = useState(columnsStore);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ---------------- fetch once (or when projectId changes) ---------------- */
  useEffect(() => {
    (async () => {
      let query = supabase
        .from("todos")
        .select("*")
        .order("inserted_at");

      if (projectId) query = query.eq("project_id", projectId);

      const { data, error } = await query;
      if (error) console.error(error.message);

      if (data) {
        setColumns({
          todo:       { ...columnsStore.todo,       items: data.filter(t => t.status === "todo") },
          inprogress: { ...columnsStore.inprogress, items: data.filter(t => t.status === "inprogress") },
          done:       { ...columnsStore.done,       items: data.filter(t => t.status === "done") },
        });
      }
      setLoading(false);
    })();
  }, [projectId]);

  /* ---------------- drag logic ---------------- */
  const onDragEnd = useCallback(
    async (result) => {
      const { source, destination } = result;
      if (!destination) return;

      if (
        source.droppableId === destination.droppableId &&
        source.index       === destination.index
      ) return;

      /* local mutate */
      const srcItems  = Array.from(columns[source.droppableId].items);
      const dstItems  = Array.from(columns[destination.droppableId].items);
      const [moved]   = srcItems.splice(source.index, 1);
      dstItems.splice(destination.index, 0, moved);

      setColumns({
        ...columns,
        [source.droppableId]: { ...columns[source.droppableId], items: srcItems },
        [destination.droppableId]: { ...columns[destination.droppableId], items: dstItems },
      });

      /* persist status change */
      if (source.droppableId !== destination.droppableId) {
        await supabase
          .from("todos")
          .update({ status: destination.droppableId })
          .eq("id", moved.id);
      }
    },
    [columns]
  );

  /* ---------------- render ---------------- */
  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="board-wrapper">
      {/* ── Top-bar ───────────────────────────────────────── */}
      <div className="kanban-topbar">
        {onBack ? (
          <button className="list-toggle" onClick={onBack}>
            ← Back
          </button>
        ) : (
          <button className="list-toggle" onClick={() => navigate("/todo")}>
            To-Do List
          </button>
        )}

        <h1 className="board-title">Kanban Task Board</h1>

        {/* 🔒 logout */}
        <button
          className="logout-button"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/");
          }}
        >
          🔒
        </button>
      </div>

      {/* ── Columns ─────────────────────────────────────── */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {Object.entries(columns).map(([colId, col]) => (
            <div key={colId} className="column">
              <header className="column-header">{col.name}</header>

              <Droppable droppableId={colId}>
                {(provided, snapshot) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={
                      "task-list " + (snapshot.isDraggingOver ? "task-list--active" : "")
                    }
                  >
                    {col.items.map((task, idx) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={idx}
                      >
                        {(prov, snap) => (
                          <li
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={
                              "task-card " + (snap.isDragging ? "task-card--dragging" : "")
                            }
                            style={prov.draggableProps.style}
                          >
                            {task.task}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
