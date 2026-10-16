import { Play, Pause, ExternalLink } from 'lucide-react';
import AgentWorkflow from './AgentWorkflow';

export default function ActiveRuns({ runs }) {
  // Use a friendly empty state when the server reports no running workflows.
  if (!runs || runs.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <h3 className="text-lg font-medium text-slate-700 mb-2">No Active Agent Runs</h3>
        <p className="text-slate-500 mb-4">There are currently no autonomous agents executing tasks.</p>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          Start New Run
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Draw one detailed card for each workflow currently in progress. */}
      {runs.map(run => (
        <div key={run.id} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm shadow-indigo-50/50">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-slate-800">{run.projectName}</h3>
                <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full">
                  {run.id}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  {run.currentAgent}
                </span>
              </div>
              <p className="text-slate-600 text-sm font-medium">Task: <span className="text-slate-800">{run.currentTask}</span></p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> View Run
              </button>
              <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Pause className="w-4 h-4" /> Pause
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-1">Current State</p>
              <p className="font-semibold text-indigo-600">{run.state}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Progress</p>
              <p className="font-semibold text-slate-800">{run.progress}%</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Retry Count</p>
              <p className="font-semibold text-slate-800">{run.retryCount} / {run.retryLimit}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-1">Last Activity</p>
              <p className="font-semibold text-slate-800">{new Date(run.lastActivity).toLocaleTimeString()}</p>
            </div>
          </div>

          <AgentWorkflow currentState={run.state} />
        </div>
      ))}
    </div>
  );
}
