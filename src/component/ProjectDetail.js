import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AddTeamMember from "./AddTeamMember";

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        alert("Project not found");
        navigate("/projects");
        return;
      }
      setProject(data);
    }

    async function fetchMembers() {
      const { data, error } = await supabase
        .from("project_members")
        .select(`user_id, role, users(username, email)`)
        .eq("project_id", projectId);

      if (!error) setMembers(data);
    }

    Promise.all([fetchProject(), fetchMembers()]).finally(() => setLoading(false));
  }, [projectId, navigate]);

  function onMemberAdded(newMember) {
    setMembers((prev) => [...prev, newMember]);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Project: {project?.name}</h1>

      <h2>Team Members</h2>
      {members.length === 0 && <p>No team members yet.</p>}
      <ul>
        {members.map((m) => (
          <li key={m.user_id}>
            {m.users?.username || "Unknown"} ({m.users?.email}) - {m.role}
          </li>
        ))}
      </ul>

      <h3>Add Team Member</h3>
      <AddTeamMember projectId={projectId} onMemberAdded={onMemberAdded} />

      <hr />
      <button onClick={() => navigate(`/projects/${projectId}/list`)}>View Tasks List</button>
      <button onClick={() => navigate(`/projects/${projectId}/kanban`)}>View Kanban Board</button>
    </div>
  );
}
