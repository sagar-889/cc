import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, BookOpen, FileText, Users, 
  MapPin, HelpCircle, LogOut, Menu, X, Bell,
  Sparkles, Phone, Brain, Shield, UserCog, Plus, MessageCircle,
  ClipboardList, GraduationCap, BarChart3, Ticket, UserPlus, Mail
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import EnhancedVoiceChat from './EnhancedVoiceChat';
import CCAIChatbot from './CCAIChatbot';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'admin';
  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty';

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    ...(isAdmin ? [{ path: '/admin/dashboard', icon: Shield, label: 'Admin Dashboard' }] : []),
    ...(isAdmin ? [{ path: '/admin/users', icon: UserCog, label: 'User Management' }] : []),
    
    // Admin-only Agentic AI Features
    ...(isAdmin ? [{ path: '/admin/report-generator', icon: BarChart3, label: '📊 Report Generator' }] : []),
    ...(isAdmin ? [{ path: '/admin/helpdesk-manager', icon: Ticket, label: '🎫 Helpdesk Manager' }] : []),
    ...(isAdmin ? [{ path: '/admin/scheduling-agent', icon: Calendar, label: '📅 Scheduling Agent' }] : []),
    ...(isAdmin ? [{ path: '/admin/user-manager', icon: UserPlus, label: '👥 User Manager' }] : []),
    ...(isAdmin ? [{ path: '/admin/communication-agent', icon: Mail, label: '📧 Communication' }] : []),
    
    // Student-only Agentic AI Features
    ...(!isAdmin ? [{ path: '/agentic-ai', icon: Brain, label: 'Agentic AI' }] : []),
    ...(!isAdmin ? [{ path: '/event-registration-agent', icon: Calendar, label: '🎪 Event Agent' }] : []),
    ...(!isAdmin ? [{ path: '/material-finder-agent', icon: BookOpen, label: '📚 Material Finder' }] : []),
    ...(!isAdmin ? [{ path: '/assignment-manager-agent', icon: ClipboardList, label: '⏰ Assignment Manager' }] : []),
    ...(!isAdmin ? [{ path: '/exam-prep-agent', icon: GraduationCap, label: '📝 Exam Prep' }] : []),
    
    { path: '/timetable', icon: Calendar, label: 'Timetable' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    // Admin/Faculty only - Add Course
    ...(isAdminOrFaculty ? [{ path: '/add-course', icon: Plus, label: 'Add Course' }] : []),
    { path: '/materials', icon: FileText, label: 'Materials' },
    // Admin/Faculty only - Add Material
    ...(isAdminOrFaculty ? [{ path: '/add-material', icon: Plus, label: 'Add Material' }] : []),
    { path: '/faculty', icon: Users, label: 'Faculty' },
    { path: '/events', icon: Sparkles, label: 'Events' },
    // Admin/Faculty only - Add Event
    ...(isAdminOrFaculty ? [{ path: '/add-event', icon: Plus, label: 'Add Event' }] : []),
    { path: '/navigation', icon: MapPin, label: 'Navigation' },
    { path: '/helpdesk', icon: HelpCircle, label: 'Helpdesk' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-primary-600">CampusCompanion</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setChatbotOpen(true)}
              className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
              title="CC-AI Chatbot"
            >
              <MessageCircle size={20} />
            </button>
            <button 
              onClick={() => setVoiceChatOpen(true)}
              className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors"
              title="Voice Assistant"
            >
              <Phone size={20} />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-30
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        overflow-y-auto
      `}>
        <nav className="p-4 space-y-2 pb-20">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Voice Chat Modal */}
      <EnhancedVoiceChat isOpen={voiceChatOpen} onClose={() => setVoiceChatOpen(false)} />
      
      {/* CC-AI Chatbot */}
      <CCAIChatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </div>
  );
};

export default Layout;
