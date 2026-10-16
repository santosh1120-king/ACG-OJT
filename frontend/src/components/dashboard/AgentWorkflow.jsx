import { CheckCircle2, Circle, CircleDot } from 'lucide-react';

export default function AgentWorkflow({ currentState }) {
  // These are the stages displayed in the visual progress line from left to right.
  const stages = [
    'REQUIREMENTS',
    'PLANNING',
    'CODING',
    'EXECUTION',
    'TESTING',
    'SELF-CORRECTION',
    'REVIEW',
    'COMPLETED'
  ];

  // The backend and UI use slightly different names for some stages, so map them here.
  const activeIndex = stages.findIndex(s => {
    if (s === 'CODING' && currentState === 'IMPLEMENTING') return true;
    if (s === 'REVIEW' && currentState === 'AWAITING_APPROVAL') return true;
    return s === currentState;
  });

  // If the state is unfamiliar, show coding instead of leaving the progress line empty.
  const resolvedIndex = activeIndex === -1 ? 2 : activeIndex;

  return (
    <div className="relative mt-8 mb-2">
      <div className="absolute left-0 top-3 w-full h-0.5 bg-slate-200"></div>
      <div 
        className="absolute left-0 top-3 h-0.5 bg-indigo-500 transition-all duration-500 ease-in-out"
        style={{ width: `${(resolvedIndex / (stages.length - 1)) * 100}%` }}
      ></div>
      
      <div className="relative flex justify-between">
        {stages.map((stage, index) => {
          const isCompleted = index < resolvedIndex;
          const isActive = index === resolvedIndex;
          
          return (
            <div key={stage} className="flex flex-col items-center gap-2 relative z-10 w-24">
              <div className="bg-white rounded-full">
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : isActive ? (
                  <CircleDot className="w-6 h-6 text-indigo-600 animate-pulse bg-white rounded-full" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <span className={`text-[10px] font-bold text-center tracking-wider uppercase ${
                isActive ? 'text-indigo-700' : isCompleted ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {stage.replace('-', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
