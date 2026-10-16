import { AlertOctagon, Check, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ApprovalQueue({ approvals }) {
  // This component is only needed when at least one action waits for a human decision.
  const navigate = useNavigate();

  if (!approvals || approvals.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Check className="w-5 h-5" />
        </div>
        <h3 className="font-medium text-slate-800">You're all caught up!</h3>
        <p className="text-sm text-slate-500">No agent actions require human review.</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <AlertOctagon className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-bold text-slate-800">Human Review Required</h2>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
          {approvals.length}
        </span>
      </div>

      <div className="space-y-3">
        {/* Show each pending approval with its related project and task. */}
        {approvals.map((approval) => (
          <div key={approval.id} className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-amber-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-800">{approval.projectName}</h3>
                <span className="text-slate-400 text-sm">•</span>
                <span className="text-slate-600 text-sm">{approval.taskName}</span>
                {approval.riskLevel === 'HIGH' && (
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">High Risk</span>
                )}
              </div>
              <p className="text-sm font-medium text-amber-900 mb-1">{approval.action}</p>
              <p className="text-xs text-amber-700/80">{approval.reason}</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => navigate(`/projects/${approval.projectId}/review`)}
                className="flex-1 md:flex-none px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Search className="w-4 h-4" /> Review
              </button>
              <button className="flex-1 md:flex-none px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-lg hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Approve
              </button>
              <button className="flex-1 md:flex-none px-3 py-1.5 text-sm font-medium text-rose-700 bg-rose-100 border border-rose-200 rounded-lg hover:bg-rose-200 transition-colors flex items-center justify-center gap-1.5">
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
