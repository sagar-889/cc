import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import AddEvent from './pages/AddEvent';
import EventRegistrationAgent from './pages/EventRegistrationAgent';
import AdminSchedulingAgent from './pages/AdminSchedulingAgent';
import AdminCommunicationAgent from './pages/AdminCommunicationAgent';
import Chatbot from './components/Chatbot';
import Courses from './pages/Courses';
import AddCourse from './pages/AddCourse';
import Materials from './pages/Materials';
import AddMaterial from './pages/AddMaterial';
import Faculty from './pages/Faculty';
import Navigation from './pages/Navigation';
import Helpdesk from './pages/Helpdesk';
import AIAssistant from './pages/AIAssistant';
import AgenticAIAssistant from './pages/AgenticAIAssistant';
import AgenticFeatures from './pages/AgenticFeatures';
import StudentAgenticAIFeatures from './pages/StudentAgenticAIFeatures';
import MaterialFinderAgent from './pages/MaterialFinderAgent';
import AssignmentManagerAgent from './pages/AssignmentManagerAgent';
import ExamPrepAgent from './pages/ExamPrepAgent';
import UserManagement from './pages/UserManagement';
import AdminReportGenerator from './pages/AdminReportGenerator';
import AdminHelpdeskManager from './pages/AdminHelpdeskManager';
import AdminUserManager from './pages/AdminUserManager';
import TimetableGenerator from './pages/admin/TimetableGenerator';
import AdminAgenticAIFeatures from './pages/AdminAgenticAIFeatures';

// Core Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Timetable from './pages/Timetable';
import Events from './pages/Events';

// Layout
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/timetable-generator" element={<TimetableGenerator />} />
            <Route path="admin/agentic-features" element={<AdminAgenticAIFeatures />} />
            <Route path="admin/agentic-ai-features" element={<AdminAgenticAIFeatures />} />
            <Route path="student/agentic-features" element={<StudentAgenticAIFeatures />} />
            <Route path="timetable" element={<Timetable />} />
            <Route path="courses" element={<Courses />} />
            <Route path="add-course" element={<AddCourse />} />
            <Route path="materials" element={<Materials />} />
            <Route path="add-material" element={<AddMaterial />} />
            <Route path="faculty" element={<Faculty />} />
            <Route path="events" element={<Events />} />
            <Route path="add-event" element={<AddEvent />} />
            <Route path="navigation" element={<Navigation />} />
            <Route path="helpdesk" element={<Helpdesk />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="agentic-ai-assistant" element={<AgenticAIAssistant />} />
            <Route path="agentic-ai" element={<AgenticAIAssistant />} />
            <Route path="agentic-features" element={<AgenticFeatures />} />
            <Route path="assignment-manager" element={<AssignmentManagerAgent />} />
            <Route path="event-registration-agent" element={<EventRegistrationAgent />} />
            <Route path="material-finder" element={<MaterialFinderAgent />} />
            <Route path="material-finder-agent" element={<MaterialFinderAgent />} />
            <Route path="assignment-manager-agent" element={<AssignmentManagerAgent />} />
            <Route path="exam-prep" element={<ExamPrepAgent />} />
            <Route path="exam-prep-agent" element={<ExamPrepAgent />} />
            <Route path="admin/report-generator" element={<AdminReportGenerator />} />
            <Route path="admin/helpdesk-manager" element={<AdminHelpdeskManager />} />
            <Route path="admin/scheduling-agent" element={<AdminSchedulingAgent />} />
            <Route path="admin/user-manager" element={<AdminUserManager />} />
            <Route path="admin/communication-agent" element={<AdminCommunicationAgent />} />
          </Route>
        </Routes>
        <Chatbot />
      </div>
    </Router>
  );
}

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();

  // Temporarily bypass auth to test if components load
  // if (!token) {
  //   return <Navigate to="/login" replace />;
  // }

  return children;
}

export default App;
