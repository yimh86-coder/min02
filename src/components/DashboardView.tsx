import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FolderKanban, 
  Share2, 
  Download, 
  Printer, 
  Layers, 
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  Building
} from 'lucide-react';
import { Project, UserPersona } from '../types';
import { formatBudget, getCategoryBadgeColor } from '../utils/formatters';

interface DashboardViewProps {
  projects: Project[];
  currentPersona: UserPersona;
  onSelectProject: (project: Project) => void;
  onFilterByCategory: (category: string) => void;
  onFilterByStatus: (status: string) => void;
  onOpenReportModal: () => void;
  onExportCsv: () => void;
  onOpenNewProject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  currentPersona,
  onSelectProject,
  onFilterByCategory,
  onFilterByStatus,
  onOpenReportModal,
  onExportCsv,
  onOpenNewProject,
}) => {
  // Aggregate KPI metrics
  const totalCount = projects.length;
  const totalBudgetMillions = projects.reduce((acc, p) => acc + p.budget.total, 0);
  const nationalBudget = projects.reduce((acc, p) => acc + p.budget.national, 0);
  const provincialBudget = projects.reduce((acc, p) => acc + p.budget.provincial, 0);
  const municipalBudget = projects.reduce((acc, p) => acc + p.budget.municipal, 0);

  const statusCounts = {
    planning: projects.filter((p) => p.status === 'planning').length,
    in_progress: projects.filter((p) => p.status === 'in_progress').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    on_hold: projects.filter((p) => p.status === 'on_hold').length,
  };

  const avgProgress = totalCount > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progressPercent, 0) / totalCount) 
    : 0;

  // Category breakdown
  const categoryStats: Record<string, { count: number; budget: number }> = {};
  projects.forEach((p) => {
    if (!categoryStats[p.category]) {
      categoryStats[p.category] = { count: 0, budget: 0 };
    }
    categoryStats[p.category].count += 1;
    categoryStats[p.category].budget += p.budget.total;
  });

  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1].budget - a[1].budget);

  // Asan-si department breakdown
  const departmentStats: Record<string, { count: number; budget: number }> = {};
  projects.forEach((p) => {
    const dept = p.department || '기획예산과';
    if (!departmentStats[dept]) {
      departmentStats[dept] = { count: 0, budget: 0 };
    }
    departmentStats[dept].count += 1;
    departmentStats[dept].budget += p.budget.total;
  });

  const sortedDepartments = Object.entries(departmentStats).sort((a, b) => b[1].budget - a[1].budget);

  // Benchmarking QnA stats
  const totalQnaCount = projects.reduce((acc, p) => acc + p.qnaList.length, 0);
  const answeredQnaCount = projects.reduce(
    (acc, p) => acc + p.qnaList.filter((q) => q.status === 'answered').length,
    0
  );
  const qnaAnswerRate = totalQnaCount > 0 ? Math.round((answeredQnaCount / totalQnaCount) * 100) : 100;

  return (
    <div className="space-y-6 pb-12" id="dashboard-view">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold mb-1">
              <span className="px-2 py-0.5 bg-blue-800/80 rounded-full border border-blue-600/40">
                {currentPersona.roleName} 모드
              </span>
              <span>•</span>
              <span>{currentPersona.name} ({currentPersona.department})</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              아산시 사업 총괄 현황 대시보드
            </h2>
            <p className="text-blue-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
              아산시 본청 및 사업소, 17개 읍·면·동의 사업 정보를 실시간으로 통합 공유하고, 부서 간 예산 중복 투자 방지 및 우수 사업 성과를 체계적으로 관리합니다.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenReportModal}
              id="dashboard-print-btn"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg border border-white/20 backdrop-blur-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>보고서 양식 출력</span>
            </button>
            <button
              onClick={onExportCsv}
              id="dashboard-export-csv-btn"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg border border-white/20 backdrop-blur-sm transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel 내보내기</span>
            </button>
            <button
              onClick={onOpenNewProject}
              id="dashboard-new-prj-btn"
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <span>+ 신규 사업 기획·등록</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div 
          onClick={() => onFilterByStatus('all')} 
          className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">등록 총 사업 수</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalCount}</span>
            <span className="text-xs text-slate-500">건</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>신규 등록 3건 증가 (전월 대비)</span>
          </div>
        </div>

        {/* Total Budget */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">총 사업 예산 (국/도/시비)</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatBudget(totalBudgetMillions)}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>국비 {Math.round((nationalBudget / totalBudgetMillions) * 100 || 0)}%</span>
              <span>도비 {Math.round((provincialBudget / totalBudgetMillions) * 100 || 0)}%</span>
              <span>시·군·구비 {Math.round((municipalBudget / totalBudgetMillions) * 100 || 0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full flex overflow-hidden">
              <div style={{ width: `${(nationalBudget / totalBudgetMillions) * 100}%` }} className="bg-blue-600 h-full" title="국비" />
              <div style={{ width: `${(provincialBudget / totalBudgetMillions) * 100}%` }} className="bg-indigo-500 h-full" title="도비" />
              <div style={{ width: `${(municipalBudget / totalBudgetMillions) * 100}%` }} className="bg-emerald-500 h-full" title="시·군·구비" />
            </div>
          </div>
        </div>

        {/* Average Progress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">전체 평균 공정/이행률</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{avgProgress}%</span>
            <span className="text-xs text-slate-500">목표 달성 중</span>
          </div>
          <div className="mt-2.5">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${avgProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>목표 50%</span>
              <span className="text-indigo-600 font-semibold">정상 추진 80%</span>
            </div>
          </div>
        </div>

        {/* Benchmarking Collaboration */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">벤치마킹 협업 활성도</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalQnaCount}</span>
            <span className="text-xs text-slate-500">건 질의</span>
            <span className="text-xs text-amber-600 font-semibold ml-2">답변율 {qnaAnswerRate}%</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
            <span>아산시 부서 및 읍·면·동 실시간 행정 협업 중</span>
          </div>
        </div>
      </div>

      {/* Status Breakdown & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Cards */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">추진 상태별 현황</h3>
              <p className="text-xs text-slate-500">클릭하여 해당 상태 사업 목록 필터링</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-3">
            {/* Planning */}
            <div 
              onClick={() => onFilterByStatus('planning')}
              className="p-3 rounded-lg border border-amber-100 bg-amber-50/40 hover:bg-amber-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-xs font-bold text-amber-900">기획 중 (사전 검토)</div>
                  <div className="text-[11px] text-amber-700">예산 심의 및 중복 검증 단계</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-amber-900">{statusCounts.planning}</span>
                <span className="text-xs text-amber-700 ml-0.5">건</span>
              </div>
            </div>

            {/* In Progress */}
            <div 
              onClick={() => onFilterByStatus('in_progress')}
              className="p-3 rounded-lg border border-blue-100 bg-blue-50/40 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-blue-900">진행 중 (실행 중)</div>
                  <div className="text-[11px] text-blue-700">설계, 공사 및 서비스 운영 중</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-blue-900">{statusCounts.in_progress}</span>
                <span className="text-xs text-blue-700 ml-0.5">건</span>
              </div>
            </div>

            {/* Completed */}
            <div 
              onClick={() => onFilterByStatus('completed')}
              className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-emerald-900">완료 (우수사례)</div>
                  <div className="text-[11px] text-emerald-700">실적보고 및 벤치마킹 개방</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-900">{statusCounts.completed}</span>
                <span className="text-xs text-emerald-700 ml-0.5">건</span>
              </div>
            </div>

            {/* On Hold */}
            <div 
              onClick={() => onFilterByStatus('on_hold')}
              className="p-3 rounded-lg border border-rose-100 bg-rose-50/40 hover:bg-rose-50 cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <div>
                  <div className="text-xs font-bold text-rose-900">보류 / 재검토</div>
                  <div className="text-[11px] text-rose-700">규제 심의, 설계 변경 등</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-rose-900">{statusCounts.on_hold}</span>
                <span className="text-xs text-rose-700 ml-0.5">건</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Budget Share */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">정책 분야별 예산 및 사업 점유율</h3>
              <p className="text-xs text-slate-500">분야를 클릭하면 해당 카테고리 사업으로 즉시 필터링됩니다</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {sortedCategories.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  등록된 사업 데이터가 없습니다.
                </div>
              ) : (
                sortedCategories.map(([category, data]) => {
                  const percent = totalBudgetMillions > 0 ? Math.round((data.budget / totalBudgetMillions) * 100) : 0;
                  return (
                    <div
                      key={category}
                      onClick={() => onFilterByCategory(category)}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${getCategoryBadgeColor(category as any)}`}>
                            {category}
                          </span>
                          <span className="text-slate-500 font-medium">{data.count}건</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-800">{formatBudget(data.budget)}</span>
                          <span className="text-slate-400 text-[11px] ml-1">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Asan-si Department breakdown list */}
            <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center">
                <Building className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                <span>아산시 부서별 사업 분포 TOP 5</span>
              </h4>
              <div className="space-y-2.5">
                {sortedDepartments.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    등록된 부서별 사업이 없습니다.
                  </div>
                ) : (
                  sortedDepartments.slice(0, 5).map(([dept, data], idx) => (
                    <div key={dept} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{dept}</span>
                        <span className="text-[11px] text-slate-500">({data.count}건)</span>
                      </div>
                      <span className="font-bold text-slate-700">{formatBudget(data.budget)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900">
                <div className="flex items-center font-bold text-blue-800 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  <span>아산시 예산 중복 방지 알림</span>
                </div>
                아산시 관내 부서 간 유사 목적 사업에 대한 사전 교차 검증 시스템이 정상 가동 중입니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured & High-Impact Projects List */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">최근 업데이트 및 우수 사업</h3>
            <p className="text-xs text-slate-500">아산시 전 부서 및 공직자가 가장 많이 열람하고 협업을 진행한 핵심 사업 목록입니다</p>
          </div>
          <button
            onClick={() => onFilterByStatus('all')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
          >
            <span>전체 사업 목록 ({totalCount}건) 보기</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="mt-4 p-10 bg-slate-50/80 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">현재 등록된 아산시 사업이 없습니다</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                모든 예시 사업이 삭제되었습니다. 상단의 <strong>'+ 신규 사업 기획·등록'</strong> 버튼을 눌러 아산시 본청 및 읍·면·동의 실제 사업을 등록해보세요.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenNewProject}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <span>+ 아산시 신규 사업 기획·등록하기</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md bg-white transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getCategoryBadgeColor(project.category)}`}>
                      {project.category}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">{project.code}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {project.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {project.purpose}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{project.region} {project.district}</span>
                    <span className="font-bold text-slate-900">{formatBudget(project.budget.total)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>진척률 {project.progressPercent}%</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full" 
                        style={{ width: `${project.progressPercent}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
