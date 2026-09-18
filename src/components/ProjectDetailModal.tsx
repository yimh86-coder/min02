import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  Printer, 
  Edit3, 
  Building2, 
  Calendar, 
  DollarSign, 
  MapPin, 
  FileText, 
  Download, 
  Send, 
  Sparkles, 
  History, 
  Shield, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  ExternalLink,
  Navigation,
  MessageSquare,
  HelpCircle,
  Clock,
  ArrowRight,
  Share2,
  Trash2
} from 'lucide-react';
import { Project, UserPersona } from '../types';
import { formatBudget, formatFullBudget, getCategoryBadgeColor, getStatusBadge, getSecurityBadge } from '../utils/formatters';

interface ProjectDetailModalProps {
  project: Project;
  currentPersona: UserPersona;
  onClose: () => void;
  onToggleBookmark: (projectId: string, e: React.MouseEvent) => void;
  onOpenEdit: (project: Project) => void;
  onOpenPrintReport: (project: Project) => void;
  onAddQnA: (projectId: string, question: string) => void;
  onAnswerQnA: (projectId: string, qnaId: string, answer: string) => void;
  allProjects: Project[];
  onSelectProject: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  currentPersona,
  onClose,
  onToggleBookmark,
  onOpenEdit,
  onOpenPrintReport,
  onAddQnA,
  onAnswerQnA,
  allProjects,
  onSelectProject,
  onDeleteProject,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attachments' | 'qna' | 'history' | 'ai_summary'>('overview');
  const [newQuestion, setNewQuestion] = useState('');
  const [replyingQnaId, setReplyingQnaId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<{
    executiveSummary: string;
    keyInnovations: string[];
    duplicationRiskCheck: string;
    benchmarkingTips: string[];
  } | null>(null);

  const statusInfo = getStatusBadge(project.status);
  const securityInfo = getSecurityBadge(project.securityLevel);

  // Check confidential access permission
  const hasAccess = !(project.securityLevel === 'confidential' && currentPersona.role === 'officer');

  // Find similar projects for benchmarking recommendation
  const similarProjects = allProjects.filter(
    (p) => p.id !== project.id && (p.category === project.category || p.tags.some((t) => project.tags.includes(t)))
  ).slice(0, 3);

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    onAddQnA(project.id, newQuestion);
    setNewQuestion('');
  };

  const handleSendAnswer = (qnaId: string) => {
    if (!replyText.trim()) return;
    onAnswerQnA(project.id, qnaId, replyText);
    setReplyingQnaId(null);
    setReplyText('');
  };

  const handleGenerateAiSummary = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiSummaryResult({
        executiveSummary: `${project.title} 사업은 ${project.region} ${project.district}의 ${project.department}에서 주관하는 총 ${formatBudget(project.budget.total)} 규모의 핵심 정책 과제입니다. 주요 타깃인 '${project.targetBeneficiaries}'을 대상으로 ${project.purpose}을 달성하기 위해 기획되었습니다.`,
        keyInnovations: [
          `재원 구조 효율화: 국비(${(project.budget.national / project.budget.total * 100).toFixed(0)}%) 연계 매칭을 통한 시비 재정 부담 경감`,
          `기술 접목도: ${project.tags.slice(0, 3).join(', ')} 기술을 현업 행정에 직접 도입`,
          `아산시 관내 타 부서 횡단 확산성: 표준 업무 매뉴얼 및 타 읍·면·동 수평 전파 가능성 매우 높음`,
        ],
        duplicationRiskCheck: `유사 사업 분석 결과, 아산시 관내 전 부서 및 읍·면·동 사업과의 중복도가 15% 미만으로 매우 독창적이며, 조례 제정 및 국·도비 공모 선발 가능성이 높습니다.`,
        benchmarkingTips: [
          `도입 전 담당 부서(${project.managerName} ${project.managerRank})에 사전 협의 서식 요청 권장`,
          `공공데이터 및 소방/경찰 등 유관기관 연계 인프라 구축 선행 필요`,
          `예산 편성 시 국·도비 특별교부세 또는 공모사업 트랙 활용 추천`,
        ],
      });
      setAiGenerating(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getCategoryBadgeColor(project.category)}`}>
                {project.category}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                {statusInfo.label}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${securityInfo.bg}`}>
                {securityInfo.label}
              </span>
              <span className="text-xs font-mono text-slate-400">{project.code}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
              {project.title}
            </h2>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{project.region} {project.district}</span>
              <span>•</span>
              <span>{project.department}</span>
              <span>•</span>
              <span>담당: {project.managerName} ({project.managerRank})</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Bookmark button */}
            <button
              onClick={(e) => onToggleBookmark(project.id, e)}
              className={`p-2 rounded-lg border border-slate-200 hover:bg-white transition-colors ${
                project.isLiked ? 'text-amber-500 fill-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="관심 사업 찜하기"
            >
              <Bookmark className="w-4 h-4" fill={project.isLiked ? 'currentColor' : 'none'} />
            </button>

            {/* Print Report */}
            <button
              onClick={() => onOpenPrintReport(project)}
              className="flex items-center space-x-1 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
              title="공공 표준 서식 보고서 인쇄"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">보고서 출력</span>
            </button>

            {/* Edit button (for managers or admin) */}
            {(currentPersona.role === 'admin' || currentPersona.role === 'manager') && (
              <button
                onClick={() => onOpenEdit(project)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">정보 수정</span>
              </button>
            )}

            {/* Delete button */}
            {onDeleteProject && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`'${project.title}' 사업을 영구 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                    onDeleteProject(project.id);
                  }
                }}
                className="flex items-center space-x-1 px-3 py-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors"
                title="사업 영구 삭제"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">사업 삭제</span>
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Confidential Lock Warning if restricted */}
        {!hasAccess ? (
          <div className="p-8 text-center bg-slate-50 my-auto">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">대외비 열람 권한 제한</h3>
            <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              본 사업은 <strong>대외비(비공개)</strong> 보안 등급으로 지정되어 있어 일반 사업 담당자 계정으로는 세부 계획서를 열람할 수 없습니다. 상단 역할 전환 메뉴에서 <strong>부서 관리자(박팀장)</strong> 또는 <strong>전체 관리자(최서기관)</strong>로 전환해 주세요.
            </p>
          </div>
        ) : (
          <>
            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-5 bg-white text-xs font-medium overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-3 border-b-2 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                기본 정보 & 사업 계획
              </button>

              <button
                onClick={() => setActiveTab('attachments')}
                className={`py-3 px-3 border-b-2 font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'attachments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>첨부파일 ({project.attachments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('qna')}
                className={`py-3 px-3 border-b-2 font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'qna'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>벤치마킹 Q&A 및 자료요청</span>
                {project.qnaList.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-blue-100 text-blue-800 rounded-full font-bold">
                    {project.qnaList.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-3 border-b-2 font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>수정 이력 로그 ({project.logs.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('ai_summary');
                  if (!aiSummaryResult && !aiGenerating) {
                    handleGenerateAiSummary();
                  }
                }}
                className={`py-3 px-3 border-b-2 font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 text-indigo-600 ${
                  activeTab === 'ai_summary'
                    ? 'border-indigo-600 bg-indigo-50/40'
                    : 'border-transparent hover:bg-indigo-50/30'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI 사업 요약 & 차별성 분석</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm text-slate-700">
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Budget & Progress Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Budget Breakdown */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-800 flex items-center">
                          <DollarSign className="w-4 h-4 text-emerald-600 mr-1" />
                          소요 예산 내역 (총 {formatFullBudget(project.budget.total)})
                        </span>
                        <span className="text-[11px] text-slate-500">단위: 백만 원</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="text-[11px] text-slate-500">국비 지원</div>
                          <div className="font-extrabold text-blue-600 mt-1">
                            {project.budget.national.toLocaleString()}백만
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {Math.round((project.budget.national / project.budget.total) * 100 || 0)}%
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="text-[11px] text-slate-500">도비 지원</div>
                          <div className="font-extrabold text-indigo-600 mt-1">
                            {project.budget.provincial.toLocaleString()}백만
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {Math.round((project.budget.provincial / project.budget.total) * 100 || 0)}%
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="text-[11px] text-slate-500">시·군·구비</div>
                          <div className="font-extrabold text-emerald-600 mt-1">
                            {project.budget.municipal.toLocaleString()}백만
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {Math.round((project.budget.municipal / project.budget.total) * 100 || 0)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Manager */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-slate-800 flex items-center mb-2">
                          <Calendar className="w-4 h-4 text-blue-600 mr-1" />
                          추진 일정 및 진척률
                        </span>
                        <div className="text-xs text-slate-600 mb-2">
                          <strong>사업 기간:</strong> {project.startDate} ~ {project.endDate} ({project.year}년도)
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">공정률</span>
                            <span className="font-bold text-blue-600">{project.progressPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${project.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>담당자: {project.managerName} ({project.managerRank})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-blue-600 font-medium">
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-0.5" />
                            {project.managerContact}
                          </span>
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-0.5" />
                            {project.managerEmail}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI 3-line summary banner */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-purple-50/90 rounded-xl border border-indigo-200/80 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>인공지능(AI) 3줄 핵심 요약</span>
                      </div>
                      <span className="text-[10px] bg-indigo-100/90 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                        아산시정 지원 특화
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-800 text-xs sm:text-sm">
                      {(project.aiSummaryLines && project.aiSummaryLines.length > 0
                        ? project.aiSummaryLines
                        : project.aiSummary
                        ? project.aiSummary.split('\n').filter(Boolean)
                        : [
                            `1. [추진목적] ${project.purpose}`,
                            `2. [주요내용] ${project.description.slice(0, 100)}...`,
                            `3. [기대효과] ${project.expectedEffects[0] || '아산시민 삶의 질 향상 및 공공 서비스 혁신'}`,
                          ]
                      ).map((line, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-slate-800 font-medium leading-relaxed">
                            {line.replace(/^[0-9]+\.\s*/, '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purpose & Content */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                      사업 목적 및 추진 배경
                    </h3>
                    <p className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-100 text-slate-800 leading-relaxed text-xs sm:text-sm">
                      {project.purpose}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-500">
                      주요 사업 내용 및 세부 추진계획
                    </h3>
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
                      {project.description}
                    </div>
                  </div>

                  {/* Target & Expected Effects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">수혜 대상 및 수요 계층</h4>
                      <p className="text-xs text-slate-600">{project.targetBeneficiaries}</p>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                      <h4 className="text-xs font-bold text-slate-800 mb-2">주요 기대 효과</h4>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {project.expectedEffects.map((eff, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0 mt-0.5" />
                            <span>{eff}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* GIS Spatial Location Info with Free Google Maps Integration */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center">
                          <MapPin className="w-4 h-4 text-rose-500 mr-1.5" />
                          사업 위치 및 공간 정보 (Google 지도 무료 연동)
                        </h4>
                        <p className="text-xs text-slate-700 mt-1">
                          <strong>설치/실행 위치:</strong> {project.location.address}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${project.location.lat},${project.location.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Google 지도에서 보기</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${project.location.lat},${project.location.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <span>길찾기</span>
                        </a>
                      </div>
                    </div>

                    {/* Free Embedded Google Maps */}
                    <div className="w-full h-56 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <iframe
                        title={`Google Map - ${project.title}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://maps.google.com/maps?q=${project.location.lat},${project.location.lng}&hl=ko&z=15&output=embed`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>좌표: {project.location.lat.toFixed(4)}, {project.location.lng.toFixed(4)} ({project.region} {project.district})</span>
                      <span className="text-emerald-600 font-medium">무료 지도 실시간 연동 중</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2">연관 태그</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((t) => (
                        <span key={t} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Benchmarking Recommendations */}
                  {similarProjects.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                        <span>아산시 관내 유사 및 협업 연계 추천 사업</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {similarProjects.map((sp) => (
                          <div
                            key={sp.id}
                            onClick={() => onSelectProject(sp)}
                            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all"
                          >
                            <div className="text-[10px] text-slate-400">{sp.region} {sp.district}</div>
                            <div className="font-bold text-slate-800 text-xs line-clamp-1 mt-0.5">{sp.title}</div>
                            <div className="text-[11px] text-blue-600 font-semibold mt-1">
                              {formatBudget(sp.budget.total)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Attachments */}
              {activeTab === 'attachments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">제출 및 관련 행정 첨부파일</h3>
                      <p className="text-xs text-slate-500">계획서, 심의자료, 결과보고서 등 다운로드 가능합니다</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">
                      총 {project.attachments.length}개 파일
                    </span>
                  </div>

                  <div className="space-y-2">
                    {project.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                            {file.type}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-xs sm:text-sm">{file.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {file.size} • 등록일 {file.uploadedAt}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => alert(`[안내] '${file.name}' 행정 문서 다운로드를 시작합니다.`)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 text-xs font-medium transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>다운로드</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Simulated Upload Box */}
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50/40">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-700">추가 행정 자료 업로드</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      결과보고서, 조례안, 예산 산출근거 등 (PDF, HWP, XLSX 지원, 최대 100MB)
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Q&A and Collaboration */}
              {activeTab === 'qna' && (
                <div className="space-y-6">
                  {/* Info Header */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900 leading-relaxed">
                      <strong>아산시 부서 간 행정 협업 채널</strong>
                      <p className="mt-0.5 text-blue-800/90">
                        아산시 타 부서나 읍·면·동 사업 담당자에게 조례 제정 팁, 도비/국비 확보 노하우, 또는 기술 규격서를 직접 질의할 수 있습니다. 등록된 질의는 사업 담당자에게 알림이 전송됩니다.
                      </p>
                    </div>
                  </div>

                  {/* Ask Question Form */}
                  <form onSubmit={handleSendQuestion} className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-800">
                      담당자({project.managerName} {project.managerRank})에게 벤치마킹 질의 또는 자료 요청
                    </label>
                    <textarea
                      rows={3}
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder={`예: "안녕하세요, ${currentPersona.region} ${currentPersona.department} ${currentPersona.name}입니다. 심의 시 요구되었던 보안성 검토 표준 서식을 공유받을 수 있을까요?"`}
                      className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        작성자: {currentPersona.name} ({currentPersona.region} {currentPersona.department})
                      </span>
                      <button
                        type="submit"
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>질의 등록</span>
                      </button>
                    </div>
                  </form>

                  {/* QnA List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-800">
                      등록된 질의응답 목록 ({project.qnaList.length}건)
                    </h4>

                    {project.qnaList.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200">
                        아직 등록된 벤치마킹 질의가 없습니다. 첫 질의를 남겨보세요!
                      </div>
                    ) : (
                      project.qnaList.map((q) => (
                        <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-900 text-xs">{q.author}</span>
                                <span className="text-[11px] text-slate-500">({q.authorOrg})</span>
                                <span className="text-[10px] text-slate-400">{q.date}</span>
                              </div>
                              <p className="text-xs text-slate-800 mt-1 leading-relaxed">
                                {q.question}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
                                q.status === 'answered'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {q.status === 'answered' ? '답변완료' : '답변대기'}
                            </span>
                          </div>

                          {/* Answer if exists */}
                          {q.answer ? (
                            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs space-y-1">
                              <div className="flex items-center space-x-2 text-blue-900 font-bold text-[11px]">
                                <span>↳ {q.answeredBy} 답변</span>
                                <span className="text-[10px] text-blue-600 font-normal">{q.answeredDate}</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{q.answer}</p>
                            </div>
                          ) : (
                            /* Reply button for manager/officer */
                            <div>
                              {replyingQnaId === q.id ? (
                                <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
                                  <textarea
                                    rows={2}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="답변 내용을 작성해 주세요..."
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => setReplyingQnaId(null)}
                                      className="px-2.5 py-1 text-slate-500 text-xs hover:bg-slate-100 rounded"
                                    >
                                      취소
                                    </button>
                                    <button
                                      onClick={() => handleSendAnswer(q.id)}
                                      className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded"
                                    >
                                      답변 등록
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReplyingQnaId(q.id);
                                    setReplyText('');
                                  }}
                                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                                >
                                  + 답변 작성하기
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Version History Log */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">사업 내용 및 공정 변경 이력</h3>
                    <p className="text-xs text-slate-500">공공 감사 및 사업 이력 추적을 위한 공식 변경 로그입니다</p>
                  </div>

                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {project.logs.map((log) => (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-xs" />
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-slate-900">{log.action}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
                          </div>
                          <div className="text-xs text-slate-600">{log.details}</div>
                          <div className="mt-2 text-[11px] text-slate-400 flex items-center space-x-1">
                            <span>처리자:</span>
                            <span className="font-semibold text-slate-600">{log.user}</span>
                            <span>({log.role})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: AI Summary & Benchmark Differentiation */}
              {activeTab === 'ai_summary' && (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-5 rounded-2xl shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5 text-amber-300" />
                        <h3 className="text-base font-bold">지자체 사업계획서 AI 분석 & 벤치마킹 인사이트</h3>
                      </div>
                      <button
                        onClick={handleGenerateAiSummary}
                        disabled={aiGenerating}
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        {aiGenerating ? '분석 생성 중...' : '다시 분석하기'}
                      </button>
                    </div>
                    <p className="text-xs text-indigo-200 mt-1">
                      공공사업 평가 지표에 입각하여 사업계획서의 핵심 요약, 차별성, 중복성 리스크를 1초 만에 분석합니다.
                    </p>
                  </div>

                  {aiGenerating ? (
                    <div className="p-12 text-center text-slate-500 space-y-3">
                      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-semibold">사업계획서 텍스트 및 예산 구조를 인공지능 분석 중입니다...</p>
                    </div>
                  ) : aiSummaryResult ? (
                    <div className="space-y-4 text-xs sm:text-sm">
                      {/* Executive Summary */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                        <div className="font-bold text-indigo-900 text-xs">핵심 요약 (Executive Summary)</div>
                        <p className="text-slate-700 leading-relaxed text-xs">{aiSummaryResult.executiveSummary}</p>
                      </div>

                      {/* Key Innovations */}
                      <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                        <div className="font-bold text-emerald-900 text-xs">사업의 주요 혁신 및 차별화 요소</div>
                        <ul className="space-y-1.5 text-xs text-emerald-800">
                          {aiSummaryResult.keyInnovations.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Duplication check */}
                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1.5">
                        <div className="font-bold text-amber-900 text-xs">아산시 관내 유사 중복 검증 결과</div>
                        <p className="text-xs text-amber-800 leading-relaxed">{aiSummaryResult.duplicationRiskCheck}</p>
                      </div>

                      {/* Benchmarking tips */}
                      <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-2">
                        <div className="font-bold text-purple-900 text-xs">아산시 관내 추진 및 협업 시 핵심 팁</div>
                        <ul className="space-y-1.5 text-xs text-purple-800">
                          {aiSummaryResult.benchmarkingTips.map((tip, i) => (
                            <li key={i} className="flex items-start">
                              <ArrowRight className="w-3.5 h-3.5 text-purple-600 mr-1.5 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div className="text-slate-500 flex items-center space-x-2">
                <span className="font-medium">최종 수정일: {project.updatedAt}</span>
                <span>•</span>
                <span>조회수 {project.viewsCount + 1}회</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
