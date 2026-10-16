import { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { agentRunsAPI } from '../services/api';
import { Play, CheckCircle, AlertCircle, Clock, ShieldCheck, Loader2 } from 'lucide-react';

export default function AgentRunsPage() {
  // Keep the user's request, current run, messages, and approval notes together for this screen.
  const [requirement, setRequirement] = useState('');
  const [activeRun, setActiveRun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [approvalNotes, setApprovalNotes] = useState('');

  const handleStartRun = async (e) => {
    // Create an AI run from the written requirement and start a fresh visible log.
    e.preventDefault();
    if (!requirement.trim()) return;
    setLoading(true);
    setError(null);
    setLogs([]);
    try {
      const run = await agentRunsAPI.start({ requirement });
      setActiveRun(run);
      setLogs((prev) => [...prev, `[SYSTEM] Started agent run ${run.id}. Agent: ${run.current_agent}`]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start agent run. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Listen for live backend events only while this page has an active run.
    if (!activeRun?.id) return;
    try {
      const socket = agentRunsAPI.connectEvents(activeRun.id, (event) => {
        setLogs((prev) => [...prev, `[${event.agent?.toUpperCase() || 'EVENT'}] ${event.message || JSON.stringify(event)}`]);
        if (event.event_type === 'agent_transition' || event.payload?.status) {
          agentRunsAPI.get(activeRun.id).then(setActiveRun).catch(() => {});
        }
      });
      return () => {
        if (socket && typeof socket.close === 'function') socket.close();
      };
    } catch (e) {
      console.warn('WebSocket connection error:', e);
    }
  }, [activeRun?.id]);

  const handleApprove = async (approved) => {
    // Send the human review decision that either allows execution or stops the run.
    if (!activeRun) return;
    try {
      const updatedRun = await agentRunsAPI.approve(activeRun.id, approved, approvalNotes);
      setActiveRun(updatedRun);
      setLogs((prev) => [...prev, `[HUMAN] Plan ${approved ? 'APPROVED' : 'REJECTED'}. Notes: ${approvalNotes || 'None'}`]);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit approval decision.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader isConnected={true} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Play className="text-indigo-600 w-6 h-6" />
              Autonomous Agent Workflows
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Submit software requirements to initiate autonomous planning, coding, Docker execution, and validation.
            </p>

            <form onSubmit={handleStartRun} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Feature Requirement / Task Description
                </label>
                <textarea
                  rows={4}
                  value={requirement}
                  onChange={(e) => setRequirement(e.target.value)}
                  placeholder="e.g. Implement user profile update endpoint with validation commands python -m compileall ."
                  className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !requirement.trim()}
                className="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? 'Initiating Planner Agent...' : 'Start Autonomous Agent Run'}
              </button>
            </form>
            {error && <p className="text-sm text-rose-600 mt-3 font-medium">{error}</p>}
          </div>

          {activeRun && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    Run Details: <span className="font-mono text-sm text-indigo-600">{activeRun.id}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Active Agent: <strong className="capitalize">{activeRun.current_agent}</strong></p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  activeRun.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  activeRun.status === 'awaiting_approval' ? 'bg-amber-100 text-amber-700' :
                  activeRun.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {activeRun.status}
                </span>
              </div>

              {activeRun.status === 'awaiting_approval' && (
                <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    Human-in-the-Loop Governance: Plan Approval Required
                  </div>
                  <p className="text-sm text-amber-700">
                    The Planner Agent has generated {activeRun.tasks?.length || 0} tasks. Review the plan below before authorizing sandbox execution.
                  </p>
                  <div>
                    <input
                      type="text"
                      placeholder="Optional reviewer notes..."
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full p-2.5 rounded-md border border-amber-300 text-sm mb-3"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Approve & Execute Patch
                      </button>
                      <button
                        onClick={() => handleApprove(false)}
                        className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition-colors"
                      >
                        Reject & Stop Run
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeRun.tasks?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Planned Tasks</h3>
                  <div className="space-y-2">
                    {activeRun.tasks.map((task, idx) => (
                      <div key={task.task_id || idx} className="p-3 bg-slate-50 border rounded-lg flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.description}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded font-mono">
                          {task.status || 'pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">Live Agent Execution Logs</h3>
                <div className="bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-lg h-60 overflow-y-auto space-y-1">
                  {logs.length === 0 ? <p className="text-slate-500">Waiting for agent activity events...</p> : logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
