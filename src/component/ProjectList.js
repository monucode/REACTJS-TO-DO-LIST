// import { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { useNavigate } from "react-router-dom";
// import AddProjectModal from "./AddProjectModal";
// import "./project.css";

// export default function ProjectList() {
//   const [projects, setProjects] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return navigate("/");

//       const { data: own } = await supabase
//         .from("projects")
//         .select("*")
//         .eq("owner_id", user.id);

//       const { data: teamRows } = await supabase
//         .from("team_members")
//         .select("project_id")
//         .eq("email", user.email);

//       const sharedIds = teamRows?.map(r => r.project_id);
//       const { data: shared } = sharedIds?.length
//         ? await supabase.from("projects").select("*").in("id", sharedIds)
//         : { data: [] };

//       setProjects([...(own || []), ...(shared || [])]);
//     })();
//   }, [navigate]);

//   const addToList = (p) => setProjects((prev) => [...prev, p]);
//   const renameProj = async (id) => {
//     const newName = prompt("Rename project:");
//     if (!newName) return;
//     const { error } = await supabase.from("projects").update({ name: newName.trim() }).eq("id", id);
//     if (!error) setProjects(p => p.map(pr => pr.id === id ? { ...pr, name: newName.trim() } : pr));
//   };
//   const deleteProj = async (id) => {
//     if (!window.confirm("Delete this project and all its tasks?")) return;
//     const { error } = await supabase.from("projects").delete().eq("id", id);
//     if (!error) setProjects(p => p.filter(pr => pr.id !== id));
//   };

//   return (
//     <>
//       <header className="pl-header">
//         <h1>Your Projects</h1>
//         <button className="pl-logout" onClick={async () => {
//           await supabase.auth.signOut();
//           navigate("/");
//         }}>Logout</button>
//       </header>

//       <ul className="pl-grid">
//         {projects.map((p) => (
//           <li key={p.id} className="pl-card">
//             <div className="pl-card-main" onClick={() => navigate(`/projects/${p.id}/list`)}>
//               <h2>{p.name}</h2>
//               <p>{new Date(p.created_at).toLocaleDateString()}</p>
//             </div>
//             <div className="pl-card-actions">
//               <button onClick={() => renameProj(p.id)} title="Edit">✏️</button>
//               <button onClick={() => deleteProj(p.id)} title="Delete">🗑️</button>
//             </div>
//           </li>
//         ))}
//       </ul>

//       <button className="pl-fab" onClick={() => setShowModal(true)}>＋</button>
//       {showModal && <AddProjectModal onClose={() => setShowModal(false)} onAdd={addToList} />}
//     </>
//   );
// }


import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import AddProjectModal from "./AddProjectModal";
import "./project.css";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return navigate("/");

      // Thanks to RLS, we just fetch all projects user is allowed to see
      const { data: projects, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (projectError) {
        console.error("Error fetching projects:", projectError.message);
        return;
      }

      setProjects(projects || []);
    })();
  }, [navigate]);

  const addToList = (project) =>
    setProjects((prev) => [project, ...prev]);

  const renameProj = async (id) => {
    const newName = prompt("Rename project:");
    if (!newName) return;

    const { error } = await supabase
      .from("projects")
      .update({ name: newName.trim() })
      .eq("id", id);

    if (!error) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, name: newName.trim() } : p
        )
      );
    }
  };

  const deleteProj = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <header className="pl-header">
        <h1>Your Projects</h1>
        <button className="pl-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <ul className="pl-grid">
        {projects.map((p) => (
          <li key={p.id} className="pl-card">
            <div
              className="pl-card-main"
              onClick={() => navigate(`/projects/${p.id}/list`)}
            >
              <h2>{p.name}</h2>
              <p>{new Date(p.created_at).toLocaleDateString()}</p>
            </div>
            <div className="pl-card-actions">
              <button onClick={() => renameProj(p.id)} title="Edit">
                ✏️
              </button>
              <button onClick={() => deleteProj(p.id)} title="Delete">
                🗑️
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button className="pl-fab" onClick={() => setShowModal(true)}>
        ＋
      </button>

      {showModal && (
        <AddProjectModal
          onClose={() => setShowModal(false)}
          onAdd={addToList}
        />
      )}
    </>
  );
}
