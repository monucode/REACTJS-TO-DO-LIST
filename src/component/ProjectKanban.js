import { useParams, useNavigate } from "react-router-dom";
import KanbanBoard from "./KanbanBoard";

export default function ProjectKanban() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  return (
    <KanbanBoard
      projectId={projectId}
      onBack={() => navigate(`/projects/${projectId}/list`)}
    />
  );
}
