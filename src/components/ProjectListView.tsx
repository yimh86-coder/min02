import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Bookmark, 
  LayoutGrid, 
  ListFilter, 
  ArrowUpDown, 
  Building2, 
  Calendar, 
  Shield, 
  FileText, 
  MapPin, 
  HelpCircle, 
  Eye, 
  CheckCircle,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  Trash2,
  FolderKanban
} from 'lucide-react';
import { Project, FilterState, ProjectCategory, ProjectStatus, SecurityLevel, UserPersona } from '../types';
import { formatBudget, getCategoryBadgeColor, getStatusBadge, getSecurityBadge } from '../utils/formatters';

interface ProjectListViewProps {
  projects: Project[];
  currentPersona: UserPersona;
  onSelectProject: (project: Project) => void;
  onToggleBookmark: (projectId: string, e: React.MouseEvent) => void;
  onDeleteProject?: (projectId: string, e: React.MouseEvent) => void;
  initialFilter?: Partial<FilterState>;
  onOpenNewProject: () => void;
  onOpenDuplicationCheck: () => void;
}

const ASAN_DISTRICTS = [
  '온양1동',
  '온양2동',
  '온양3동',
  '온양4동',
  '온양5동',
  '온양6동',
  '배방읍',
  '탕정면',
  '음봉면',
  '둔포면',
  '영인면',
  '인주면',
  '선장면',
  '도고면',
  '신창면',
  '염치읍',
  '송악면',
  '아산시 전역',
];

export const ProjectListView: React.FC<ProjectListViewProps> = ({
  projects,
  currentPersona,
  onSelectProject,
  onToggleBookmark,
  onDeleteProject,
  initialFilter,
  onOpenNewProject,
  onOpenDuplicationCheck,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    keyword: initialFilter?.keyword || '',
    region: initialFilter?.region || '충청남도 아산시',
    district: initialFilter?.district || 'all',
    department: initialFilter?.department || 'all',
    category: initialFilter?.category || 'all',
    status: initialFilter?.status || 'all',
    year: initialFilter?.year || 'all',
    budgetRange: initialFilter?.budgetRange || 'all',
    securityLevel: initialFilter?.securityLevel || 'all',
    sortBy: 'latest',
  });

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // Available unique regions, departments, categories, years
  const regions = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.region))).sort();
  }, [projects]);

  const departments = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.department))).sort();
  }, [projects]);

  const categories: ProjectCategory[] = [
    '복지·보건',
    '스마트·디지털',
    '교통·도시',
    '환경·에너지',
    '문화·관광',
    '경제·일자리',
    '안전·재난',
  ];

  // Top popular tags
  const popularTags = useMemo(() => {
    const tagCount: Record<string, number> = {};
    projects.forEach((p) => {
      p.tags.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [projects]);

  // Filter & Sort logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Keyword
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase();
        const matchTitle = project.title.toLowerCase().includes(query);
        const matchPurpose = project.purpose.toLowerCase().includes(query);
        const matchManager = project.managerName.toLowerCase().includes(query);
        const matchCode = project.code.toLowerCase().includes(query);
        const matchTags = project.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchPurpose && !matchManager && !matchCode && !matchTags) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag && !project.tags.includes(selectedTag)) {
        return false;
      }

      // Region (Fixed to Asan-si)
      if (filters.region !== 'all' && project.region !== filters.region) {
        return false;
      }

      // District filter for Asan-si
      if (filters.district && filters.district !== 'all' && project.district !== filters.district) {
        return false;
      }

      // Department
      if (filters.department !== 'all' && project.department !== filters.department) {
        return false;
      }

      // Category
      if (filters.category !== 'all' && project.category !== filters.category) {
        return false;
      }

      // Status
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }

      // Year
      if (filters.year !== 'all' && project.year.toString() !== filters.year) {
        return false;
      }

      // Security Level
      if (filters.securityLevel !== 'all' && project.securityLevel !== filters.securityLevel) {
        return false;
      }

      // Budget Range
      if (filters.budgetRange !== 'all') {
        const total = project.budget.total;
        if (filters.budgetRange === 'under_1000' && total >= 1000) return false;
        if (filters.budgetRange === '1000_3000' && (total < 1000 || total > 3000)) return false;
        if (filters.budgetRange === '3000_5000' && (total < 3000 || total > 5000)) return false;
        if (filters.budgetRange === 'over_5000' && total <= 5000) return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'budget_desc':
          return b.budget.total - a.budget.total;
        case 'budget_asc':
          return a.budget.total - b.budget.total;
        case 'likes':
          return b.likesCount - a.likesCount;
        case 'progress':
          return b.progressPercent - a.progressPercent;
        case 'latest':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
  }, [projects, filters, selectedTag]);

  const getProjectAiSummaryLines = (project: Project): string[] => {
    if (project.aiSummaryLines && project.aiSummaryLines.length > 0) {
      return project.aiSummaryLines;
    }
    if (project.aiSummary) {
      return project.aiSummary.split('\n').filter(Boolean);
    }
    return [
      `1. [추진목적] ${project.purpose}`,
      `2. [주요내용] ${project.description.slice(0, 85)}...`,
      `3. [기대효과] ${project.expectedEffects[0] || '아산시민 편익 증진 및 시정 혁신'}`,
    ];
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      region: '충청남도 아산시',
      district: 'all',
      department: 'all',
      category: 'all',
      status: 'all',
      year: 'all',
      budgetRange: 'all',
      securityLevel: 'all',
      sortBy: 'latest',
    });
    setSelectedTag(null);
  };

  return (
    <div className="space-y-5" id="project-list-view">
      {/* Search and Main Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search row with pre-duplication banner */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="search-input"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              placeholder="아산시 사업명, 키워드, 부서명, 읍면동 또는 사업번호(PRJ-2025-...) 검색"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {filters.keyword && (
              <button
                onClick={() => setFilters({ ...filters, keyword: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                지우기
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            <button
              onClick={onOpenDuplicationCheck}
              className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
              title="사업 기획 전 아산시 및 인근 사업과의 중복 여부를 미리 검사합니다"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>사전 중복 검사기</span>
            </button>

            <button
              onClick={onOpenNewProject}
              className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <span>+ 아산시 신규 사업 등록</span>
            </button>
          </div>
        </div>

        {/* Detailed Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Region - Scoped to Asan-si */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">관할 지자체</label>
            <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold text-[11px] flex items-center justify-between">
              <span>아산시청</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-bold">충남</span>
            </div>
          </div>

          {/* District - Eup/Myeon/Dong */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">관내 읍·면·동</label>
            <select
              id="filter-district"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체 읍·면·동</option>
              {ASAN_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">소관 부서</label>
            <select
              id="filter-department"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체 부서</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">정책 분야</label>
            <select
              id="filter-category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체 분야</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">사업 상태</label>
            <select
              id="filter-status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체 상태</option>
              <option value="planning">기획 중</option>
              <option value="in_progress">진행 중</option>
              <option value="completed">완료</option>
              <option value="on_hold">보류</option>
            </select>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">예산 규모</label>
            <select
              id="filter-budget"
              value={filters.budgetRange}
              onChange={(e) => setFilters({ ...filters, budgetRange: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체 규모</option>
              <option value="under_1000">10억 미만</option>
              <option value="1000_3000">10억 ~ 30억</option>
              <option value="3000_5000">30억 ~ 50억</option>
              <option value="over_5000">50억 원 이상</option>
            </select>
          </div>

          {/* Security Level */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">보안 등급</label>
            <select
              id="filter-security"
              value={filters.securityLevel}
              onChange={(e) => setFilters({ ...filters, securityLevel: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">전체 공개등급</option>
              <option value="public">전체 공개</option>
              <option value="internal">내부 공개 (지자체)</option>
              <option value="confidential">대외비 (비공개)</option>
            </select>
          </div>
        </div>

        {/* Tags & Quick Reset Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px] mr-1">추천 태그:</span>
            {popularTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>필터 초기화</span>
          </button>
        </div>
      </div>

      {/* List Header & Sorting & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-bold text-slate-900">
            사업 검색 결과 <span className="text-blue-600 font-extrabold">{filteredProjects.length}</span>건
          </h3>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500">평균 검색 응답속도 0.12초</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sorting */}
          <div className="flex items-center space-x-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="latest">최신 수정순</option>
              <option value="budget_desc">예산 높은순</option>
              <option value="budget_asc">예산 낮은순</option>
              <option value="progress">진척도 높은순</option>
              <option value="likes">관심(찜) 많은순</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="카드형 보기"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="목록형(테이블) 보기"
            >
              <ListFilter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display: Grid vs Table */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800">현재 등록된 아산시 사업이 없습니다</h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            예시 사업 데이터가 모두 삭제되었습니다.<br />
            상단의 <strong>'+ 신규 사업 등록'</strong> 버튼을 클릭하여 아산시의 새로운 정책 및 실무 사업을 등록하세요.
          </p>
          <button
            onClick={onOpenNewProject}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            + 아산시 신규 사업 등록하기
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">일치하는 아산시 사업이 없습니다</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            검색어를 변경하거나 필터를 초기화해 보세요.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            필터 초기화
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const statusInfo = getStatusBadge(project.status);
            const securityInfo = getSecurityBadge(project.securityLevel);
            const isConfidentialAndRestricted = 
              project.securityLevel === 'confidential' && currentPersona.role === 'officer';

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between p-5 relative group"
              >
                {/* Confidential Shield Notice if applicable */}
                {isConfidentialAndRestricted && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-6 text-white text-center z-10">
                    <Lock className="w-8 h-8 text-rose-400 mb-2" />
                    <span className="text-xs font-bold text-rose-200">대외비 (접근 제한)</span>
                    <span className="text-[11px] text-slate-200 mt-1">
                      부서 관리자 또는 전체 관리자 권한이 필요합니다. 상단 페르소나를 변경해 보세요.
                    </span>
                  </div>
                )}

                <div>
                  {/* Top Bar: Badges & Bookmark */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getCategoryBadgeColor(project.category)}`}>
                        {project.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                        {statusInfo.label}
                      </span>
                      {project.securityLevel !== 'public' && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${securityInfo.bg}`}>
                          {project.securityLevel === 'internal' ? '내부공개' : '대외비'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => onToggleBookmark(project.id, e)}
                        className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                          project.isLiked ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-slate-500'
                        }`}
                        title="관심 사업 찜하기"
                      >
                        <Bookmark className="w-4 h-4" fill={project.isLiked ? 'currentColor' : 'none'} />
                      </button>

                      {onDeleteProject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`'${project.title}' 사업을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`)) {
                              onDeleteProject(project.id, e);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="사업 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Project Code & Title */}
                  <div className="text-[11px] font-mono text-slate-400 mb-1">{project.code}</div>
                  <h4 
                    onMouseEnter={() => setHoveredProjectId(project.id)}
                    onMouseLeave={() => setHoveredProjectId(null)}
                    className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                  >
                    {project.title}
                  </h4>

                  {/* Purpose */}
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {project.purpose}
                  </p>

                  {/* AI 3줄 요약 Hover Tooltip Trigger */}
                  <div 
                    className="relative mt-2.5 inline-block"
                    onMouseEnter={() => setHoveredProjectId(project.id)}
                    onMouseLeave={() => setHoveredProjectId(null)}
                  >
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200/80 rounded-lg text-indigo-800 text-[11px] font-semibold cursor-help transition-all shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                      <span>AI 3줄 요약 툴팁 (마우스 오버)</span>
                    </div>

                    {/* Floating Tooltip Box on Hover */}
                    {hoveredProjectId === project.id && (
                      <div className="absolute left-0 bottom-full mb-2 z-50 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-indigo-500/40 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2.5">
                          <div className="flex items-center space-x-1.5 font-bold text-indigo-300">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span>Gemini AI 3줄 핵심 요약</span>
                          </div>
                          <span className="text-[10px] bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-700/50">
                            {project.region} {project.district}
                          </span>
                        </div>

                        <div className="space-y-2 text-slate-200 text-[11.5px] leading-relaxed">
                          {getProjectAiSummaryLines(project).map((line, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-600/80 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-slate-100">{line.replace(/^[0-9]+\.\s*/, '')}</span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>클릭 시 세부 사업계획서 조회</span>
                          <span className="text-indigo-400 font-semibold">상세보기 &rarr;</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {project.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] bg-slate-50 text-slate-600 px-1.5 py-0.5 rounded border border-slate-100">
                        #{t}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400 self-center">+{project.tags.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Bottom Details & Progress */}
                <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-slate-600 space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{project.region} {project.district}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">{project.department}</span>
                    </div>
                    <div className="text-right font-extrabold text-slate-900">
                      {formatBudget(project.budget.total)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>이행률 {project.progressPercent}%</span>
                    <div className="flex items-center space-x-2">
                      {project.qnaList.length > 0 && (
                        <span className="flex items-center text-slate-500">
                          <HelpCircle className="w-3 h-3 mr-0.5 text-blue-500" />
                          {project.qnaList.length}
                        </span>
                      )}
                      {project.attachments.length > 0 && (
                        <span className="flex items-center text-slate-500">
                          <FileText className="w-3 h-3 mr-0.5 text-slate-400" />
                          {project.attachments.length}
                        </span>
                      )}
                      <span>찜 {project.likesCount}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        project.status === 'completed'
                          ? 'bg-emerald-500'
                          : project.status === 'on_hold'
                          ? 'bg-rose-400'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${project.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4 w-12 text-center">찜</th>
                  <th className="py-3 px-4">사업코드 / 사업명</th>
                  <th className="py-3 px-4">AI 요약 (호버)</th>
                  <th className="py-3 px-4">지자체 / 부서</th>
                  <th className="py-3 px-4">정책 분야</th>
                  <th className="py-3 px-4 text-right">총 예산 (국/도/시비)</th>
                  <th className="py-3 px-4 text-center">상태</th>
                  <th className="py-3 px-4 text-center">진척도</th>
                  <th className="py-3 px-4 text-center">보안등급</th>
                  <th className="py-3 px-4 text-center">담당자</th>
                  {onDeleteProject && <th className="py-3 px-3 text-center w-14">삭제</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const statusInfo = getStatusBadge(project.status);
                  const securityInfo = getSecurityBadge(project.securityLevel);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-center" onClick={(e) => onToggleBookmark(project.id, e)}>
                        <button className="text-slate-300 hover:text-amber-500">
                          <Bookmark
                            className="w-4 h-4"
                            fill={project.isLiked ? '#f59e0b' : 'none'}
                            color={project.isLiked ? '#f59e0b' : 'currentColor'}
                          />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[10px] text-slate-400">{project.code}</div>
                        <div 
                          onMouseEnter={() => setHoveredProjectId(project.id)}
                          onMouseLeave={() => setHoveredProjectId(null)}
                          className="font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors"
                        >
                          {project.title}
                        </div>
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div 
                          className="relative inline-block"
                          onMouseEnter={() => setHoveredProjectId(project.id)}
                          onMouseLeave={() => setHoveredProjectId(null)}
                        >
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 text-[11px] font-semibold cursor-help">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>3줄 요약</span>
                          </span>

                          {hoveredProjectId === project.id && (
                            <div className="absolute left-0 bottom-full mb-2 z-50 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border border-indigo-500/40 text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
                                <div className="flex items-center space-x-1 font-bold text-indigo-300">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>Gemini AI 3줄 핵심 요약</span>
                                </div>
                                <span className="text-[10px] bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded-full">
                                  {project.region} {project.district}
                                </span>
                              </div>
                              <div className="space-y-1.5 text-slate-200 text-[11px] leading-relaxed">
                                {getProjectAiSummaryLines(project).map((line, idx) => (
                                  <div key={idx} className="flex items-start space-x-1.5">
                                    <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{line.replace(/^[0-9]+\.\s*/, '')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium">{project.region} {project.district}</div>
                        <div className="text-[11px] text-slate-400">{project.department}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getCategoryBadgeColor(project.category)}`}>
                          {project.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatBudget(project.budget.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">
                        {project.progressPercent}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${securityInfo.bg}`}>
                          {securityInfo.label.slice(0, 4)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600">
                        {project.managerName}
                      </td>
                      {onDeleteProject && (
                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`'${project.title}' 사업을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`)) {
                                onDeleteProject(project.id, e);
                              }
                            }}
                            className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="사업 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
