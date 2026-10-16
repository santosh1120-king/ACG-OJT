import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import AgentRunsPage from './pages/AgentRunsPage';
import SectionPage from './pages/SectionPage';
import { ListTodo, Code2, CheckCircle2, Clock, Settings } from 'lucide-react';

// Wrap pages that only signed-in users are allowed to open.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center font-sans text-slate-500">Loading workspace...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

// Keep signed-in users away from pages that only make sense before login.
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center font-sans text-slate-500">Loading workspace...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}

// Match each browser URL to the page React should display.
function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/runs"
        element={
          <ProtectedRoute>
            <AgentRunsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requirements"
        element={
          <ProtectedRoute>
            <SectionPage
              title="Requirements Backlog"
              description="View and structure raw requirements before passing them to the AI Planner Agent."
              icon={ListTodo}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <SectionPage
              title="Repository Workspace"
              description="Inspect container workspace directories and generated patch files."
              icon={Code2}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <SectionPage
              title="Human-in-the-Loop Reviews"
              description="Review pending task approvals and inspect completed release summaries."
              icon={CheckCircle2}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <SectionPage
              title="Execution History & Audit Log"
              description="Complete log of past autonomous agent runs, actions, and validation outputs."
              icon={Clock}
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SectionPage
              title="System Settings"
              description="Configure Docker container sandboxes, OpenAI models, and Supabase integration."
              icon={Settings}
            />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// Start routing, then make login information available to every page.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
