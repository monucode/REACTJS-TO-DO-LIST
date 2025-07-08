import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import KanbanBoard from "./KanbanBoard";

import "./Todowrapper.css";   // banner + shared styles

export default function ProjectKanban() {
  const { id: projectId } = useParams();
  const navigate          = useNavigate();
  const [projectName, setProjectName] = useState("");

  /* fetch project name once */
  useEffect(() => {
    const getName = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("name")
        .eq("id", projectId)
        .single();
      if (!error && data) setProjectName(data.name);
    };
    getName();
  }, [projectId]);

  return (
    <div className="todo-page">
      {/* sticky pill banner */}
      <div className="project-banner project-banner--sticky">
        {projectName}
      </div>

      {/* Kanban board component */}
      <KanbanBoard
        projectId={projectId}
        onBack={() => navigate(`/projects/${projectId}/list`)}
      />
    </div>
  );
}
