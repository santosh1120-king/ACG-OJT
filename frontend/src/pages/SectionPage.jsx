import Sidebar from '../components/dashboard/Sidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';

export default function SectionPage({ title, description, icon: Icon, children }) {
  // Reuse the standard dashboard layout for pages that only need a title and message.
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader isConnected={true} />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {Icon && <Icon className="text-indigo-600 w-6 h-6" />}
              {title}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{description}</p>
          </div>
          {children || (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
              <p className="text-slate-600 text-sm">
                This module is fully connected to the AutoDev OS system. Select actions or start an agent run to populate telemetry data.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
