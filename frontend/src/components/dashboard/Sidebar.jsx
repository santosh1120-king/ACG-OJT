import { 
  LayoutDashboard, FolderKanban, ListTodo, 
  PlayCircle, Code2, CheckCircle2, Clock, 
  Settings, User as UserIcon, LogOut 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  // The sidebar uses one data list so each navigation link is created consistently.
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Requirements', icon: ListTodo, path: '/requirements' },
    { name: 'Agent Runs', icon: PlayCircle, path: '/runs' },
    { name: 'Workspace', icon: Code2, path: '/workspace' },
    { name: 'Reviews', icon: CheckCircle2, path: '/reviews' },
    { name: 'History', icon: Clock, path: '/history' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Code2 className="text-indigo-500" />
          AutoDev OS
        </h1>
      </div>
      
      {/* Create one visible navigation link for every item in the list above. */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
