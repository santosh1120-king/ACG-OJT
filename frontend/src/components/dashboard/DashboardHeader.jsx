import { Search, Bell, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHeader({ isConnected }) {
  // Read the signed-in user's name and picture from shared login state.
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="text-xl font-semibold text-slate-800 hidden sm:block">Dashboard</h2>
        <div className="relative max-w-md w-full ml-0 sm:ml-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search projects or tasks..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          {/* Show whether the browser still has a live dashboard connection. */}
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}
        </div>
        
        <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">{user?.name || 'Developer'}</p>
            <p className="text-xs text-slate-500">{user?.email || 'dev@example.com'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden border border-indigo-200">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              (user?.name || 'D').charAt(0)
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
