// src/component/ProjectTodoList.js
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import { Todo } from "./Todo";
import { TodoForm } from "./TodoForm";
import { EditTodoForm } from "./EditTodoForm";
import "./Todowrapper.css";

export default function ProjectTodoList() {
  const { id: projectId } = useParams();
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  /* ─── session check + first fetch ─── */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/");

      fetchTodos();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /* ─── fetch helper ─── */
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("project_id", projectId)
      .order("id");
    if (!error) setTodos(data || []);
  };

  /* ─────────────────────────────────────────────────────────
     CRUD helpers — project_id हमेशा भेजना ज़रूरी
  ───────────────────────────────────────────────────────── */
  const addTodo = async (task) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tmpId = Date.now();
    setTodos([...todos, { id: tmpId, task, completed: false, project_id: projectId }]);

    const { data, error } = await supabase
      .from("todos")
      .insert([
        { task, completed: false, user_id: user.id, project_id: projectId }
      ])
      .select()
      .single();

    if (error) {
      console.error(error.message);
      setTodos(t => t.filter(x => x.id !== tmpId));
    } else {
      setTodos(t => t.map(x => (x.id === tmpId ? data : x)));
    }
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (!error) setTodos(todos.filter(t => t.id !== id));
  };

  const toggleComplete = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", id);
    if (!error) {
      setTodos(todos.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
    }
  };

  const editTodo = (id) =>
    setTodos(todos.map(t => (t.id === id ? { ...t, isEditing: !t.isEditing } : t)));

  const editTask = async (newTask, id) => {
    const { error } = await supabase.from("todos").update({ task: newTask }).eq("id", id);
    if (!error) {
      setTodos(todos.map(t => (t.id === id ? { ...t, task: newTask, isEditing: false } : t)));
    }
  };

  /* ─── UI ─── */
  return (
    <div className="TodoWrapper">
      {/* top-bar */}
      <div className="todo-topbar">
        <button
          className="back-button"
          onClick={() => navigate("/projects")}
          title="Back to projects"
        >
          ←
        </button>

        <h1 className="todo-heading">{`Project · ${projectId.slice(0, 6)}…`}</h1>

        <button
          className="kanban-toggle"
          onClick={() => navigate(`/projects/${projectId}/kanban`)}
        >
          Kanban
        </button>
      </div>

      {/* add form + list */}
      <TodoForm addTodo={addTodo} />

      {todos.map(todo =>
        todo.isEditing ? (
          <EditTodoForm key={todo.id} editTodo={editTask} task={todo} />
        ) : (
          <Todo
            key={todo.id}
            task={todo}
            deleteTodo={deleteTodo}
            editTodo={editTodo}
            toggleComplete={toggleComplete}
          />
        )
      )}
    </div>
  );
}
