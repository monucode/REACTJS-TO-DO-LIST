// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// /* -- auth pages -- */
// import Login from "./component/Login";
// import Signup from "./component/Signup";

// /* -- single-user legacy pages (optional) -- */
// import { Todowrapper } from "./component/Todowrapper";
// import KanbanBoard from "./component/KanbanBoard";

// /* -- new multi-project pages -- */
// import ProjectList from "./component/ProjectList";
// import ProjectTodoList from "./component/ProjectTodoList";
// import ProjectKanban from "./component/ProjectKanban";
// // import ProjectDetail from "./component/ProjectDetail"; 

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* auth routes */}
//         <Route path="/" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* project workflow */}
//         <Route path="/projects" element={<ProjectList />} />
//         {/* <Route path="/projects/:id" element={<ProjectDetail />} />   */}
//         <Route path="/projects/:id/list" element={<ProjectTodoList />} />
//         <Route path="/projects/:id/kanban" element={<ProjectKanban />} />

//         {/* legacy single-user paths (keep or remove) */}
//         <Route path="/todo" element={<Todowrapper />} />
//         <Route path="/kanban" element={<KanbanBoard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

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

import ProtectedRoute from "./component/ProtectedRoute"; // ✅ Import this

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
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

        {/* Optional legacy pages – protect if needed */}
        <Route path="/todo" element={<Todowrapper />} />
        <Route path="/kanban" element={<KanbanBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
