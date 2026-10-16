import { Plus, Play, RotateCcw, CheckSquare, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
  // Define shortcut labels, icons, and destination URLs in one reusable list.
  const navigate = useNavigate();

  const actions = [
    { name: 'New Project', icon: Plus, path: '/projects/new', color: 'indigo' },
    { name: 'Start Agent', icon: Play, path: '/runs', color: 'emerald' },
    { name: 'Resume Run', icon: RotateCcw, path: '/runs', color: 'blue' },
    { name: 'Review Changes', icon: CheckSquare, path: '/reviews', color: 'amber' },
    { name: 'View History', icon: Clock, path: '/history', color: 'slate' },
  ];

  // Translate a simple color label into the Tailwind classes used by each shortcut.
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200',
    slate: 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <h2 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${colorMap[action.color]} ${i === 0 ? 'col-span-2' : ''}`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
