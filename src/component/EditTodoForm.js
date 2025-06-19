// EditTodoForm.js
import React, { useState } from "react";

export const EditTodoForm = ({ task, editTodo }) => {
  const [value, setValue] = useState(task.task);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;

    editTodo(value.trim(), task.id);
  };

  return (
    <form onSubmit={handleSubmit} className="EditTodoForm">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="todo-input"
      />
      <button type="submit" className="todo-btn">Update Task</button>
    </form>
  );
};
