import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';

import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import KPIGrid from '../components/dashboard/KPIGrid';
import ActiveRuns from '../components/dashboard/ActiveRuns';
import ProjectGrid from '../components/dashboard/ProjectGrid';
import ApprovalQueue from '../components/dashboard/ApprovalQueue';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import ErrorPanel from '../components/dashboard/ErrorPanel';
import QuickActions from '../components/dashboard/QuickActions';

export default function Dashboard() {
  // Store the data and connection state needed to draw the dashboard.
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    projects: [],
    activeRuns: [],
    pendingApprovals: [],
    activities: [],
    errors: [],
    stats: {
      totalProjects: 0,
      activeProjects: 0,
      activeRuns: 0,
      executingRuns: 0,
      tasksCompleted: 0,
      pendingReviews: 0,
    }
  });

  useEffect(() => {
    // Load data once, then refresh it whenever the backend sends a live event.
    loadDashboardData();
    
    const socket = dashboardService.connectDashboardEvents((event) => {
      loadDashboardData(false);
    });

    if (socket && typeof socket.addEventListener === 'function') {
      socket.addEventListener('open', () => setIsConnected(true));
      socket.addEventListener('close', () => setIsConnected(false));
      socket.addEventListener('error', () => setIsConnected(false));
    }

    return () => {
      if (socket && typeof socket.close === 'function') socket.close();
      setIsConnected(false);
    };
  }, []);

  const loadDashboardData = async (showLoading = true) => {
    // Request independent dashboard data at the same time to make the screen load faster.
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [projects, activeRuns, pendingApprovals, activities, errors] = await Promise.all([
        dashboardService.getProjects(),
        dashboardService.getActiveRuns(),
        dashboardService.getPendingApprovals(),
        dashboardService.getRecentActivity(),
        dashboardService.getErrors()
      ]);

      // Turn raw lists into the summary numbers shown at the top of the page.
      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status !== 'Completed').length,
        activeRuns: activeRuns.length,
        executingRuns: activeRuns.filter(r => r.state === 'IMPLEMENTING' || r.state === 'EXECUTING').length,
        tasksCompleted: projects.reduce((total, project) => total + (project.tasksCompleted || 0), 0),
        pendingReviews: pendingApprovals.length,
      };

      setDashboardData({
        projects,
        activeRuns,
        pendingApprovals,
        activities,
        errors,
        stats
      });
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader isConnected={isConnected} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Good morning, {user?.name?.split(' ')[0] || 'Developer'}</h1>
                <p className="text-slate-500 text-sm mt-1">Monitor your autonomous development workflows and project progress.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => navigate('/runs')} className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Start Agent Run
                </button>
                <button onClick={() => navigate('/projects/new')} className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                  + Create New Project
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-700 p-4 rounded-lg border border-rose-200 text-sm flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => loadDashboardData()} className="font-medium underline">Retry</button>
              </div>
            )}

            {/* KPI Summary */}
            <KPIGrid stats={dashboardData.stats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Column (Active Runs & Approvals) */}
              <div className="xl:col-span-2 space-y-6">
                
                {dashboardData.pendingApprovals.length > 0 && (
                  <ApprovalQueue approvals={dashboardData.pendingApprovals} />
                )}

                <section>
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Active Agent Runs</h2>
                  <ActiveRuns runs={dashboardData.activeRuns} />
                </section>

                <ProjectGrid projects={dashboardData.projects} />
                
              </div>

              {/* Side Column (Activity, Errors, Quick Actions) */}
              <div className="space-y-6">
                <QuickActions />
                
                {dashboardData.errors.length > 0 && (
                  <ErrorPanel errors={dashboardData.errors} />
                )}
                
                <ActivityTimeline activities={dashboardData.activities} />
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
