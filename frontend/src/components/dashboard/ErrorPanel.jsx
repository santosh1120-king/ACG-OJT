import { AlertTriangle, RefreshCcw, ExternalLink } from 'lucide-react';

export default function ErrorPanel({ errors }) {
  // There is nothing to display when the backend reported no errors.
  if (!errors || errors.length === 0) {
    return null; // hide if no errors
  }

  return (
    <div className="bg-white p-5 rounded-xl border border-rose-200 h-full">
      <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-rose-500" /> Issues & Errors
      </h2>
      
      <div className="space-y-3">
        {/* Each error receives a card with its retry state and available actions. */}
        {errors.map((error) => (
          <div key={error.id} className="bg-rose-50 rounded-lg p-3 border border-rose-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase">
                {error.type}
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Retry {error.retryCount} / {error.retryLimit}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-800 mb-1">{error.message}</p>
            <p className="text-xs text-slate-600 mb-3">{error.projectName} • {error.taskName}</p>
            
            <div className="flex gap-2">
              <button className="flex-1 text-xs font-medium bg-white text-slate-700 border border-slate-300 py-1.5 rounded hover:bg-slate-50 flex justify-center items-center gap-1">
                <ExternalLink className="w-3 h-3" /> View
              </button>
              {error.status === 'Retrying' && (
                <button className="flex-1 text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200 py-1.5 rounded flex justify-center items-center gap-1" disabled>
                  <RefreshCcw className="w-3 h-3 animate-spin" /> Retrying...
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
