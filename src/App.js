import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './component/Login';
import Signup from './component/Signup';  
import { Todowrapper } from './component/Todowrapper';
import KanbanBoard from './component/KanbanBoard';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/todo" element={<Todowrapper />} />
        <Route path="/kanban" element={<KanbanBoard />} /> 
      </Routes>
    </Router>
  );
}

export default App;

