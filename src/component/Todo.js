// Todo.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faClock,         // 📝  todo
  faSpinner,       // ⏳  in progress
  faCheck          // ✅  done
} from "@fortawesome/free-solid-svg-icons";

export const Todo = ({ task, deleteTodo, editTodo, toggleComplete }) => {
  const { id, status = "todo" } = task;  // default 'todo' if missing

  // choose icon based on status
  const statusIcon =
    status === "todo"       ? faClock   :
    status === "inprogress" ? faSpinner :
    faCheck;  // done

  return (
    <div className={`Todo status-${status}`}>
      {/* badge */}
      <span className="status-badge">
        <FontAwesomeIcon icon={statusIcon} />
      </span>

      {/* main task text */}
      <p
        className={task.completed ? "completed" : "incompleted"}
        onClick={() => toggleComplete(id)}
      >
        {task.task}
      </p>

      {/* edit / delete */}
      <div>
        <FontAwesomeIcon
          className="edit-icon"
          icon={faPenToSquare}
          onClick={() => editTodo(id)}
        />
        <FontAwesomeIcon
          className="delete-icon"
          icon={faTrash}
          onClick={() => deleteTodo(id)}
        />
      </div>
    </div>
  );
};
