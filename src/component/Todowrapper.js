// Todowrapper.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Todo } from "./Todo";
import { TodoForm } from "./TodoForm";
import { EditTodoForm } from "./EditTodoForm";
import "./Todowrapper.css";

export const Todowrapper = () => {
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      } else {
        fetchTodos();
      }
    };

    checkSessionAndFetch();
  }, [navigate]);

  const fetchTodos = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error.message);
    } else {
      setTodos(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // ✅ Optimistic Add Todo
  const addTodo = async (task) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not logged in:", userError?.message);
      return;
    }

    // Temporary ID and optimistic UI update
    const tempId = Date.now();
    const tempTodo = {
      id: tempId,
      task,
      completed: false,
      user_id: user.id,
    };

    setTodos((prev) => [...prev, tempTodo]);

    const { data, error } = await supabase
      .from("todos")
      .insert([
        {
          task,
          completed: false,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting todo:", error.message);
      // Rollback
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
    } else {
      // Replace temp todo with actual
      setTodos((prev) =>
        prev.map((t) => (t.id === tempId ? data : t))
      );
    }
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      console.error("Error deleting todo:", error.message);
    } else {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", id);

    if (error) {
      console.error("Error toggling todo:", error.message);
    } else {
      setTodos(
        todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      );
    }
  };

  const editTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
  };

  const editTask = async (task, id) => {
    const { error } = await supabase
      .from("todos")
      .update({ task })
      .eq("id", id);

    if (error) {
      console.error("Error updating task:", error.message);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, task, isEditing: false } : todo
        )
      );
    }
  };

  return (
    <div className="TodoWrapper">
      <div className="todo-topbar">
        <h1>TO-DO LIST</h1>
        <button onClick={handleLogout} className="logout-button">
          🔒
        </button>
      </div>

      <TodoForm addTodo={addTodo} />

      {todos.map((todo) =>
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
};
