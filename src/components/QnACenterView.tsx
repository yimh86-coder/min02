import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Search, 
  Building2, 
  ArrowRight, 
  User, 
  Send, 
  Filter
} from 'lucide-react';
import { Project, UserPersona, ProjectQnA } from '../types';

interface QnACenterViewProps {
  projects: Project[];
  currentPersona: UserPersona;
  onSelectProject: (project: Project) => void;
  onAnswerQnA: (projectId: string, qnaId: string, answer: string) => void;
}

export const QnACenterView: React.FC<QnACenterViewProps> = ({
  projects,
  currentPersona,
  onSelectProject,
  onAnswerQnA,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  // Collect all QnAs across all projects
  const allQnAs: { project: Project; qna: ProjectQnA }[] = [];
  projects.forEach((project) => {
    project.qnaList.forEach((qna) => {
      allQnAs.push({ project, qna });
    });
  });

  const filteredQnAs = allQnAs.filter(({ project, qna }) => {
    if (filterStatus !== 'all' && qna.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQ = qna.question.toLowerCase().includes(q);
      const matchA = qna.answer?.toLowerCase().includes(q);
      const matchProject = project.title.toLowerCase().includes(q);
      const matchAuthor = qna.author.toLowerCase().includes(q);
      if (!matchQ && !matchA && !matchProject && !matchAuthor) return false;
    }
    return true;
  });

  const handleReplySubmit = (projectId: string, qnaId: string) => {
    if (!answerText.trim()) return;
    onAnswerQnA(projectId, qnaId, answerText);
    setActiveReplyId(null);
    setAnswerText('');
  };

  return (
    <div className="space-y-6 pb-12" id="qna-center-view">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>아산시 부서·읍면동 행정 노하우 및 협업 소통망</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          아산시정 협업 질의응답 (Q&A) 센터
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          아산시 관내 부서 및 읍·면·동 간 사업 조례, 도비·국비 확보 노하우, 현장 민원 대응 팁을 실시간으로 질의하고 협업할 수 있는 전용 채널입니다.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="질의 내용, 답변, 사업명 또는 질문자 부서 검색..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'all' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              전체 ({allQnAs.length})
            </button>
            <button
              onClick={() => setFilterStatus('waiting')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'waiting' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              답변 대기 ({allQnAs.filter((q) => q.qna.status === 'waiting').length})
            </button>
            <button
              onClick={() => setFilterStatus('answered')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === 'answered' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              답변 완료 ({allQnAs.filter((q) => q.qna.status === 'answered').length})
            </button>
          </div>
        </div>
      </div>

      {/* QnA List */}
      <div className="space-y-4">
        {filteredQnAs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            조건에 부합하는 벤치마킹 질의응답이 없습니다.
          </div>
        ) : (
          filteredQnAs.map(({ project, qna }) => (
            <div
              key={qna.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-3"
            >
              {/* Linked Project Bar */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-blue-600">대상 사업:</span>
                  <button
                    onClick={() => onSelectProject(project)}
                    className="font-bold text-slate-900 hover:text-blue-600 hover:underline flex items-center"
                  >
                    <span>{project.title}</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    qna.status === 'answered'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {qna.status === 'answered' ? '답변완료' : '답변대기'}
                </span>
              </div>

              {/* Question */}
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-800">{qna.author}</span>
                  <span>({qna.authorOrg})</span>
                  <span>•</span>
                  <span className="text-slate-400">{qna.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  Q. {qna.question}
                </p>
              </div>

              {/* Answer if exists */}
              {qna.answer ? (
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{qna.answeredBy} 답변 ({project.region} {project.department})</span>
                    </div>
                    <span className="text-[11px] text-blue-600 font-normal">{qna.answeredDate}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                    {qna.answer}
                  </p>
                </div>
              ) : (
                /* Reply prompt */
                <div>
                  {activeReplyId === qna.id ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-2">
                      <label className="block text-xs font-bold text-slate-700">
                        {currentPersona.name} ({currentPersona.department}) 명의로 답변 작성:
                      </label>
                      <textarea
                        rows={3}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="아산시 관내 타 부서 담당자에게 도움될 수 있도록 구체적인 행정 절차나 조례 명칭, 추진 팁을 작성해 주세요."
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-3 py-1 text-slate-500 text-xs hover:bg-slate-200 rounded"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleReplySubmit(project.id, qna.id)}
                          className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs"
                        >
                          답변 등록
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveReplyId(qna.id);
                        setAnswerText('');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      <span>답변 작성하기</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
