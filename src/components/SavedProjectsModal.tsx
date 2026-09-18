import React from 'react';
import { X, Bookmark, ArrowRight, Building2, Trash2 } from 'lucide-react';
import { Project } from '../types';
import { formatBudget, getCategoryBadgeColor, getStatusBadge } from '../utils/formatters';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: Project[];
  onSelectProject: (project: Project) => void;
  onRemoveBookmark: (projectId: string, e: React.MouseEvent) => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  onSelectProject,
  onRemoveBookmark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">내 관심 사업 (찜 목록)</h3>
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              {savedProjects.length}건
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {savedProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-300" />
              <p>아직 찜한 관심 사업이 없습니다.</p>
              <p className="text-[11px] text-slate-400">사업 목록에서 책갈피 아이콘을 클릭하여 관심 사업으로 등록해 보세요.</p>
            </div>
          ) : (
            savedProjects.map((project) => {
              const statusInfo = getStatusBadge(project.status);
              return (
                <div
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getCategoryBadgeColor(project.category)}`}>
                        {project.category}
                      </span>
                      <span className={`px-1.5 py-0.2 text-[10px] font-medium rounded border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <button
                      onClick={(e) => onRemoveBookmark(project.id, e)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="관심 사업 해제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-blue-600">
                    {project.title}
                  </h4>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.region} {project.district}</span>
                      <span>•</span>
                      <span>{project.department}</span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {formatBudget(project.budget.total)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
