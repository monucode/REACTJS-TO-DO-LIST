import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* -- auth pages -- */
import Login from "./component/Login";
import Signup from "./component/Signup";

/* -- single-user legacy pages (optional) -- */
import { Todowrapper } from "./component/Todowrapper";
import KanbanBoard from "./component/KanbanBoard";

/* -- new multi-project pages -- */

import ProjectList from "./component/ProjectList";
import ProjectTodoList from "./component/ProjectTodoList";
import ProjectKanban from "./component/ProjectKanban";
// import ProjectDetail from "./component/ProjectDetail";

import ProtectedRoute from "./component/ProtectedRoute"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Default entry → Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/list"
          element={
            <ProtectedRoute>
              <ProjectTodoList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id/kanban"
          element={
            <ProtectedRoute>
              <ProjectKanban />
            </ProtectedRoute>
          }
        />

        {/* Optional legacy pages */}
        <Route path="/todo" element={<Todowrapper />} />
        <Route path="/kanban" element={<KanbanBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
