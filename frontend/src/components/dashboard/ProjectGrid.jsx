import { Folder, Clock, Code2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectGrid({ projects }) {
  // Navigation is used when a person clicks a project card.
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">Your Projects</h2>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          View All <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Choose either project cards or a helpful first-project message. */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors group cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{project.name}</h3>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                  project.status === 'Agent Running' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  project.status === 'Human Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  {project.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description}</p>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Code2 className="w-4 h-4 text-slate-400" />
                  <span>{project.stack}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Progress: {project.progress}</span>
                  </div>
                  <span className="text-slate-400">{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <Folder className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-slate-700 font-medium mb-1">No Projects Found</h3>
          <p className="text-sm text-slate-500 mb-4">You haven't created any projects yet.</p>
          <button className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
            Create Your First Project
          </button>
        </div>
      )}
    </section>
  );
}
