import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import AddTeamMember from "./AddTeamMember";

export default function ProjectDetail() {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canManageMembers, setCanManageMembers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [projectRes, memberRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single(),
        supabase
          .from("team_members")
          .select("user_id, name, email")
          .eq("project_id", projectId),
      ]);

      if (projectRes.error) {
        alert("Project not found");
        navigate("/projects");
        return;
      }

      setProject(projectRes.data);
      setMembers(memberRes.data || []);

      // ✅ check permission: if current user is owner or team member
      const isOwner = projectRes.data.owner_id === user.id;
      const isMember = (memberRes.data || []).some(
        (m) => m.email === user.email
      );

      setCanManageMembers(isOwner || isMember);
      setLoading(false);
    }

    fetchData();
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
        {members.map((m, index) => (
          <li key={index}>
            {m.name} ({m.email})
          </li>
        ))}
      </ul>

      {/* ✅ Show AddTeamMember form to owner or any added member */}
      {canManageMembers && (
        <>
          <h3>Add Team Member</h3>
          <AddTeamMember projectId={projectId} onAdd={onMemberAdded} />
        </>
      )}

      <hr />
      <button onClick={() => navigate(`/projects/${projectId}/list`)}>
        View Tasks List
      </button>
      <button onClick={() => navigate(`/projects/${projectId}/kanban`)}>
        View Kanban Board
      </button>
    </div>
  );
}
