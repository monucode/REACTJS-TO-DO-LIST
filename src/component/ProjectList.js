import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import AddProjectModal from "./AddProjectModal";
import "./project.css";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  /* ─ fetch once ─ */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate("/");
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at");
      setProjects(data || []);
    })();
  }, [navigate]);

  /* ─ helpers ─ */
  const addToList   = (p) => setProjects((prev) => [...prev, p]);

  const renameProj  = async (id) => {
    const newName = prompt("Rename project:");
    if (!newName) return;
    const { error } = await supabase
      .from("projects")
      .update({ name: newName.trim() })
      .eq("id", id);
    if (!error) setProjects(p =>
      p.map(pr => pr.id === id ? { ...pr, name: newName.trim() } : pr)
    );
  };

  const deleteProj  = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) setProjects(p => p.filter(pr => pr.id !== id));
  };

  return (
    <>
      {/* ───────── header ───────── */}
      <header className="pl-header">
        <h1>Your Projects</h1>
        <button
          className="pl-logout"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate("/");
          }}
        >
          Logout
        </button>
      </header>

      {/* ───────── grid ───────── */}
      <ul className="pl-grid">
        {projects.map((p) => (
          <li key={p.id} className="pl-card">
            <div className="pl-card-main" onClick={() => navigate(`/projects/${p.id}/list`)}>
              <h2>{p.name}</h2>
              <p>{new Date(p.created_at).toLocaleDateString()}</p>
            </div>

            <div className="pl-card-actions">
              <button onClick={() => renameProj(p.id)} title="Edit">✏️</button>
              <button onClick={() => deleteProj(p.id)} title="Delete">🗑️</button>
            </div>
          </li>
        ))}
      </ul>

      {/* floating + button */}
      <button className="pl-fab" onClick={() => setShowModal(true)}>＋</button>

      {showModal &&
        <AddProjectModal onClose={() => setShowModal(false)} onAdd={addToList} />}
    </>
  );
}
