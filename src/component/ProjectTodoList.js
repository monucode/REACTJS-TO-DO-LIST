import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

/* child components */
import { Todo } from "./Todo";
import { TodoForm } from "./TodoForm";
import { EditTodoForm } from "./EditTodoForm";

/* icon (Feather-icons via react-icons) */
import { FiLogOut } from "react-icons/fi";

import "./Todowrapper.css";

export default function ProjectTodoList() {
  const { id: projectId } = useParams();
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  /* ── session check + first fetch ── */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/login", { replace: true });
      fetchTodos();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  /* fetch todos for this project */
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("project_id", projectId)
      .order("id");
    if (!error) setTodos(data || []);
  };

  /* logout */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  /* ── CRUD helpers ── */
  const addTodo = async (task) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tmpId = Date.now();
    setTodos([...todos, { id: tmpId, task, completed: false, project_id: projectId }]);

    const { data, error } = await supabase
      .from("todos")
      .insert([{ task, completed: false, user_id: user.id, project_id: projectId }])
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

  /* ── UI ── */
  return (
    <div className="TodoWrapper">
      {/* TOP BAR */}
      <div className="todo-topbar">
        {/* back */}
        <button
          className="back-button"
          onClick={() => navigate("/projects")}
          title="Back to projects"
        >
          ←
        </button>

        {/* heading */}
        <h1 className="todo-heading">TO-DO LIST</h1>

        {/* right-side buttons */}
        <div className="topbar-actions">
          <button
            className="kanban-toggle"
            onClick={() => navigate(`/projects/${projectId}/kanban`)}
          >
            Kanban
          </button>
          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <FiLogOut />
          </button>
        </div>
      </div>

      {/* form + list */}
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
