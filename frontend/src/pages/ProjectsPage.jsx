import { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { dashboardService } from '../services/dashboardService';
import api from '../services/api';
import { FolderKanban, Plus, Folder, Loader2 } from 'lucide-react';

export default function ProjectsPage() {
  // These values control the project list and the create-project popup form.
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [repoPath, setRepoPath] = useState('/workspace');

  useEffect(() => {
    // Fetch projects once when the page first appears.
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await dashboardService.getProjects();
    setProjects(data || []);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    // Stop the browser's normal form submit, then send the new project to the backend.
    e.preventDefault();
    try {
      await api.post('/api/projects', { name, repository_path: repoPath });
      setShowModal(false);
      setName('');
      loadProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader isConnected={true} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <FolderKanban className="text-indigo-600 w-6 h-6" />
                Projects Directory
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage development repositories and autonomous agent project configurations.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-4">
              <Folder className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Projects Configured</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Create a project workspace to associate requirements and run autonomous coding agents against your repository.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, idx) => (
                <div key={project.id || idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-base">{project.name}</h3>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded">Active</span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded border">
                    {project.repository_path || '/workspace'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Create New Project</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. E-Commerce Backend"
                      className="w-full p-2.5 rounded-lg border text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Repository Workspace Path</label>
                    <input
                      type="text"
                      value={repoPath}
                      onChange={(e) => setRepoPath(e.target.value)}
                      placeholder="/workspace"
                      className="w-full p-2.5 rounded-lg border text-sm font-mono"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
