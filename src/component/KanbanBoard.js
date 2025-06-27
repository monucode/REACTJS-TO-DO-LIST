import React, { useEffect, useState, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./KanbanBoard.css";

const columnsStore = {
  todo: { name: "To Do", items: [] },
  inprogress: { name: "In Progress", items: [] },
  done: { name: "Done", items: [] },
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(columnsStore);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /*--------------------------------------------------*
   | 🗂  FETCH once on mount                           |
   *--------------------------------------------------*/
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at");
      if (!error && data) {
        setColumns({
          todo: {
            ...columnsStore.todo,
            items: data.filter((t) => t.status === "todo"),
          },
          inprogress: {
            ...columnsStore.inprogress,
            items: data.filter((t) => t.status === "inprogress"),
          },
          done: {
            ...columnsStore.done,
            items: data.filter((t) => t.status === "done"),
          },
        });
      }
      setLoading(false);
    })();
  }, []);

  /*--------------------------------------------------*
   | ✋  DRAG logic                                    |
   *--------------------------------------------------*/
  const onDragEnd = useCallback(
    async (result) => {
      const { source, destination } = result;
      if (!destination) return;

      // 1️⃣ same spot
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      // 2️⃣ mutate local
      const sourceClone = Array.from(columns[source.droppableId].items);
      const destClone = Array.from(columns[destination.droppableId].items);
      const [movedItem] = sourceClone.splice(source.index, 1);
      destClone.splice(destination.index, 0, movedItem);

      // 3️⃣ set state
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...columns[source.droppableId],
          items: sourceClone,
        },
        [destination.droppableId]: {
          ...columns[destination.droppableId],
          items: destClone,
        },
      });

      // 4️⃣ persist
      if (source.droppableId !== destination.droppableId) {
        await supabase
          .from("todos")
          .update({ status: destination.droppableId })
          .eq("id", movedItem.id);
      }
    },
    [columns]
  );

  /*--------------------------------------------------*
   | 🔄  RENDER                                        |
   *--------------------------------------------------*/
  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="board-wrapper">
      {/* ── Top‑bar ────────────────────────────────── */}
      <div className="kanban-topbar">
        <h1 className="board-title">Kanban Task Board</h1>

        {/* 🔁 switch back to list view */}
        <button className="list-toggle" onClick={() => navigate("/todo")}>
          To‑Do List
        </button>

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

      {/* ── Board Columns ─────────────────────────── */}
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
                      "task-list " +
                      (snapshot.isDraggingOver ? "task-list--active" : "")
                    }
                  >
                    {col.items.map((task, idx) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={idx}
                      >
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={
                              "task-card " +
                              (snapshot.isDragging
                                ? "task-card--dragging"
                                : "")
                            }
                            style={provided.draggableProps.style}
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
