import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck2, 
  ShieldAlert, 
  Lightbulb, 
  RefreshCw,
  ExternalLink,
  Building2,
  DollarSign
} from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { calculateSimilarity, SimilarityResult } from '../utils/similarity';
import { formatBudget } from '../utils/formatters';

interface DuplicationCheckerProps {
  allProjects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenNewProjectWithDraft?: (draft: { title: string; category: ProjectCategory; purpose: string; tags: string[] }) => void;
}

export const DuplicationChecker: React.FC<DuplicationCheckerProps> = ({
  allProjects,
  onSelectProject,
  onOpenNewProjectWithDraft,
}) => {
  const [draftTitle, setDraftTitle] = useState('독거어르신 IoT 스마트 안심 케어 및 고독사 예방');
  const [draftCategory, setDraftCategory] = useState<ProjectCategory>('복지·보건');
  const [draftPurpose, setDraftPurpose] = useState('1인 독거노인 대상 움직임 센서 및 응급호출 비상벨 연동');
  const [draftTagsInput, setDraftTagsInput] = useState('IoT돌봄, 고독사, 노인복지');
  const [hasScanned, setHasScanned] = useState(true);

  const tags = draftTagsInput
    .split(',')
    .map((t) => t.trim().replace(/^#/, ''))
    .filter((t) => t.length > 0);

  const results = calculateSimilarity(
    {
      title: draftTitle,
      category: draftCategory,
      purpose: draftPurpose,
      tags,
    },
    allProjects
  );

  const maxScore = results.length > 0 ? results[0].score : 0;
  const isDuplicateRisk = maxScore >= 60;

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    setHasScanned(true);
  };

  const samplePresets = [
    {
      title: 'AI 영상 기반 스마트 어린이보호구역 보행안전 시스템',
      category: '교통·도시' as ProjectCategory,
      purpose: '초등학교 앞 불법주정차 단속 및 잔여 보행시간 자동 연장',
      tags: '스마트교차로, 어린이보호구역, 바닥신호등',
    },
    {
      title: '도심 탄소중립 수소전기 시내버스 충전소 확충',
      category: '환경·에너지' as ProjectCategory,
      purpose: '공영차고지 내 상용 수소충전 인프라 구축',
      tags: '수소충전소, 친환경버스, 탄소중립',
    },
    {
      title: '골목상권 소상공인 공동배달 및 디지털 온누리 플랫폼',
      category: '경제·일자리' as ProjectCategory,
      purpose: '전통시장 당일 묶음배송 및 온라인 주문 연계',
      tags: '전통시장, 디지털전환, 공동배송',
    },
    {
      title: '반려동물 공공 테마파크 및 유기동물 입양지원센터',
      category: '문화·관광' as ProjectCategory,
      purpose: '유휴 시유지 활용 반려견 놀이터 및 행동교정 교육장 조성',
      tags: '반려동물, 동물복지, 공공테마파크',
    },
  ];

  return (
    <div className="space-y-6 pb-12" id="duplication-checker-view">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>PRD 핵심 KPI: 예산 낭비 및 사업 중복 원천 차단 엔진</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          아산시 관내 유사 사업 사전 검증기
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          사업 기획서 작성 및 예산 심의 전, 아산시 관내 타 부서 및 읍·면·동에 이미 유사한 사업이 진행 중인지 실시간으로 교차 검증하여 중복 투자를 방지하고 선행 사례를 벤치마킹하세요.
        </p>
      </div>

      {/* Preset Quick Test Buttons */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-bold text-slate-700 mb-2">
          💡 빠른 테스트 예시 프리셋 (클릭 시 검증 데이터 자동 입력):
        </div>
        <div className="flex flex-wrap gap-2">
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDraftTitle(preset.title);
                setDraftCategory(preset.category);
                setDraftPurpose(preset.purpose);
                setDraftTagsInput(preset.tags);
                setHasScanned(true);
              }}
              className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 hover:border-blue-300 rounded-lg text-xs transition-colors"
            >
              {preset.title.slice(0, 24)}...
            </button>
          ))}
        </div>
      </div>

      {/* Form and Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">기획안 가안(Draft) 입력</h3>
            <span className="text-[11px] text-slate-400">실시간 매칭</span>
          </div>

          <form onSubmit={handleScan} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                기획 중인 사업명 (가안)
              </label>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="예: 독거노인 스마트 응급 안심 서비스"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">정책 분야</label>
              <select
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value as ProjectCategory)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="복지·보건">복지·보건</option>
                <option value="스마트·디지털">스마트·디지털</option>
                <option value="교통·도시">교통·도시</option>
                <option value="환경·에너지">환경·에너지</option>
                <option value="문화·관광">문화·관광</option>
                <option value="경제·일자리">경제·일자리</option>
                <option value="안전·재난">안전·재난</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                주요 목적 및 핵심 기능
              </label>
              <textarea
                rows={3}
                value={draftPurpose}
                onChange={(e) => setDraftPurpose(e.target.value)}
                placeholder="사업의 주요 목적 및 설치될 핵심 기술/서비스 내역"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                예상 키워드 태그 (쉼표로 구분)
              </label>
              <input
                type="text"
                value={draftTagsInput}
                onChange={(e) => setDraftTagsInput(e.target.value)}
                placeholder="IoT돌봄, 고독사, 노인복지"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>아산시 관내 중복성 검증 시작</span>
            </button>
          </form>

          {/* Direct Proceed to Register */}
          {onOpenNewProjectWithDraft && (
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() =>
                  onOpenNewProjectWithDraft({
                    title: draftTitle,
                    category: draftCategory,
                    purpose: draftPurpose,
                    tags,
                  })
                }
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 transition-colors"
              >
                <span>이 기획안으로 정식 사업 등록하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Result Summary Card */}
          <div className={`p-5 rounded-2xl border shadow-xs ${
            isDuplicateRisk 
              ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
              : results.length > 0 
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {isDuplicateRisk ? (
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                ) : results.length > 0 ? (
                  <Lightbulb className="w-6 h-6 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {isDuplicateRisk
                      ? `중복성 위험도 [주의] (최고 유사도 ${maxScore}%)`
                      : results.length > 0
                      ? `벤치마킹 권장 [양호] (유사 사업 ${results.length}건 발견)`
                      : '중복 사업 없음 [독창적] (기존 추진 사업 없음)'}
                  </h3>
                  <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                    {isDuplicateRisk
                      ? '아산시 관내 타 부서 또는 인접 읍·면·동에 매우 유사한 목적과 예산 구조의 사업이 이미 진행 중입니다. 사업 간 중복 투자를 방지하기 위해 부서 간 사전 협의를 거치거나 차별화 요소를 보완하세요.'
                      : results.length > 0
                      ? '아산시 기존 사업과 일정 부분 유사성이 있어 사업계획서 보완 시 관내 선행 부서의 추진 성과를 벤치마킹하기에 최적입니다.'
                      : '아산시 관내 등록 사업 중 유사한 프로젝트가 없습니다. 신규 혁신 공모 사업으로 추진하기 적합합니다.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black">{maxScore}%</span>
                <div className="text-[10px] opacity-80">유사도 점수</div>
              </div>
            </div>
          </div>

          {/* Similar Projects List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900">
                아산시 관내 매칭 유사 사업 목록 ({results.length}건)
              </h4>
              <span className="text-xs text-slate-500">유사도 내림차순</span>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                유사 키워드를 가진 등록 사업이 없습니다.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {results.map((res) => (
                  <div
                    key={res.project.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 transition-all space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800">
                          {res.project.region} {res.project.district}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{res.project.department}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          res.score >= 70
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : res.score >= 45
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        유사도 {res.score}%
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 text-sm">{res.project.title}</h5>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {res.project.purpose}
                    </p>

                    {/* Matched Reasons */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <strong className="text-slate-700">🔍 알고리즘 일치 사유:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                        {res.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                        <span>예산: {formatBudget(res.project.budget.total)}</span>
                        <span>담당: {res.project.managerName}</span>
                      </div>
                      <button
                        onClick={() => onSelectProject(res.project)}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                      >
                        <span>사업 상세 & 계획서 열람</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
