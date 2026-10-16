import { FolderKanban, PlayCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function KPIGrid({ stats }) {
  // Convert the supplied numbers into a consistent set of summary cards.
  const kpis = [
    { 
      label: 'Total Projects', 
      value: stats.totalProjects || 0, 
      icon: FolderKanban, 
      color: 'blue',
      context: `${stats.activeProjects || 0} active`
    },
    { 
      label: 'Active Agent Runs', 
      value: stats.activeRuns || 0, 
      icon: PlayCircle, 
      color: 'indigo',
      context: `${stats.executingRuns || 0} currently executing`
    },
    { 
      label: 'Tasks Completed', 
      value: stats.tasksCompleted || 0, 
      icon: CheckCircle, 
      color: 'emerald',
      context: `Last 7 days`
    },
    { 
      label: 'Tasks Requiring Review', 
      value: stats.pendingReviews || 0, 
      icon: AlertTriangle, 
      color: 'amber',
      context: 'Human approval required'
    }
  ];

  // Match each card's simple color name to Tailwind CSS classes.
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2.5 rounded-lg ${colorMap[kpi.color]}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-800">{kpi.value}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600">{kpi.label}</h3>
          <p className="text-xs text-slate-500 mt-1">{kpi.context}</p>
        </div>
      ))}
    </div>
  );
}
