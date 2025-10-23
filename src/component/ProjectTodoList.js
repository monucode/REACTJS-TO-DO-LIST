import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import { Todo } from "./Todo";
import { TodoForm } from "./TodoForm";
import { EditTodoForm } from "./EditTodoForm";
import AddTeamMember from "./AddTeamMember";

import { FiLogOut } from "react-icons/fi";
import "./Todowrapper.css";

export default function ProjectTodoList() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [isOwner,     setIsOwner]     = useState(false);
  const [todos,       setTodos]       = useState([]);
  const [team,        setTeam]        = useState([]);

  /* ── initial fetch ── */
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/login", { replace: true });

      /* project meta */
      const { data: proj } = await supabase
        .from("projects")
        .select("name, owner_id")
        .eq("id", projectId)
        .single();
      if (proj) {
        setProjectName(proj.name);
        setIsOwner(session.user.id === proj.owner_id);
      }

      /* todos */
      const { data: todoData } = await supabase
        .from("todos")
        .select("*")
        .eq("project_id", projectId)
        .order("id");
      setTodos(todoData || []);

      /* team */
      const { data: teamData } = await supabase
        .from("team_members")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");
      setTeam(teamData || []);
    })();
  }, [projectId, navigate]);

  /* ── member delete ── */
  async function removeMember(id) {
    if (!window.confirm("Remove this member?")) return;
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);
    if (error) return alert(error.message);
    setTeam(p => p.filter(m => m.id !== id));
  }

  /* ── todo helpers (add / del / toggle / edit) ── */
  const addTodo = async (task) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use a more robust temporary ID and include the default status
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tmp = {
      id: tempId,
      task,
      completed: false,
      project_id: projectId,
      status: 'todo' // Default status for new tasks
    };
    setTodos(p => [...p, tmp]);

    const { data, error } = await supabase
      .from("todos") // The table name should be 'todos'
      .insert([{
        task,
        completed: false,
        user_id: user.id,
        project_id: projectId,
        status: 'todo' // Add status on insert
      }])
      .select().single();
    if (error) setTodos(p => p.filter(t => t.id !== tmp.id));
    else       setTodos(p => p.map(t => t.id === tmp.id ? data : t));
  };
  const deleteTodo = async id => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (!error) setTodos(p => p.filter(t => t.id !== id));
  };
  const toggleComplete = async id => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const { error } = await supabase
      .from("todos").update({ completed:!todo.completed }).eq("id", id);
    if (!error) setTodos(p => p.map(t => t.id === id ? { ...t, completed:!t.completed } : t));
  };
  const editTodo = id => setTodos(p => p.map(
    t => t.id === id ? { ...t, isEditing:!t.isEditing } : t));
  const editTask = async (txt,id) => {
    const { error } = await supabase.from("todos").update({ task:txt }).eq("id", id);
    if (!error) setTodos(p => p.map(
      t => t.id === id ? { ...t, task:txt, isEditing:false } : t));
  };

  /* ── render ── */
  return (
    <div className="todo-page">
      <header className="project-banner"><h2>{projectName}</h2></header>

      <div className="TodoWrapper">
        {/* top bar */}
        <div className="todo-topbar">
          <button className="back-button" onClick={() => navigate("/projects")}>←</button>
          <h1 className="todo-heading">TO-DO LIST</h1>
          <div className="topbar-actions">
            <button className="kanban-toggle"
              onClick={() => navigate(`/projects/${projectId}/kanban`)}>Kanban</button>
            <button className="logout-button" onClick={async ()=>{
              await supabase.auth.signOut(); navigate("/login",{replace:true});
            }}><FiLogOut/></button>
          </div>
        </div>

        {/* todo form + list */}
        <TodoForm addTodo={addTodo}/>
        {todos.map(t =>
          t.isEditing ? (
            <EditTodoForm key={t.id} task={t} editTodo={editTask}/>
          ) : (
            <Todo key={t.id} task={t} deleteTodo={deleteTodo}
                  editTodo={editTodo} toggleComplete={toggleComplete}/>
          )
        )}

        {/* team box */}
        <section className="team-box">
          <h3>Team&nbsp;({team.length})</h3>

          {isOwner && (
            <AddTeamMember
              projectId={projectId}
              onAdd={m => setTeam(p => [...p, m])}
            />
          )}

          <div className="pill-row">
            {team.length === 0 && <small className="empty">No members</small>}
            {team.map(mem => (
              <span key={mem.id} className="pill" title={mem.email}>
                {mem.name}
                {isOwner &&
                  <button className="pill-x"
                    onClick={() => removeMember(mem.id)}>×</button>}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}