import { Activity, CheckCircle, XCircle, FileCode, Package, GitCommit } from 'lucide-react';

export default function ActivityTimeline({ activities }) {
  // Pick an icon that visually explains each type of recorded activity.
  const getIcon = (type) => {
    switch(type) {
      case 'TEST_PASSED': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'TEST_FAILED': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'FILE_MODIFIED': return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'PLANNER_CREATED': return <Package className="w-4 h-4 text-purple-500" />;
      case 'CHECKPOINT': return <GitCommit className="w-4 h-4 text-slate-500" />;
      default: return <Activity className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 h-full">
      <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-500" /> Recent Activity
      </h2>
      
      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          {/* The index lets the last timeline item omit the connecting vertical line. */}
          {activities.map((activity, idx) => (
            <div key={activity.id} className="relative pl-6">
              {idx !== activities.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-[-16px] w-px bg-slate-200"></div>
              )}
              <div className="absolute left-0 top-1 bg-white">
                {getIcon(activity.type)}
              </div>
              <div>
                <p className="text-sm text-slate-800 font-medium">{activity.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-indigo-600 font-medium">{activity.projectName}</span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No recent activity.</p>
        </div>
      )}
    </div>
  );
}
