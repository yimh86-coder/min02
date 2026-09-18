import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Save, 
  AlertTriangle, 
  Sparkles, 
  DollarSign, 
  Building2, 
  Calendar, 
  Shield, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle,
  FileUp,
  Info
} from 'lucide-react';
import { Project, ProjectCategory, ProjectStatus, SecurityLevel, UserPersona } from '../types';
import { calculateSimilarity, SimilarityResult } from '../utils/similarity';
import { formatBudget } from '../utils/formatters';

interface ProjectFormModalProps {
  initialProject?: Project | null;
  currentPersona: UserPersona;
  allProjects: Project[];
  onSave: (projectData: Partial<Project>, logReason: string) => void;
  onClose: () => void;
  onViewSimilarProject?: (project: Project) => void;
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

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  initialProject,
  currentPersona,
  allProjects,
  onSave,
  onClose,
  onViewSimilarProject,
}) => {
  const isEdit = !!initialProject;

  // Form states - strictly scoped to Asan-si
  const [title, setTitle] = useState(initialProject?.title || '');
  const [region, setRegion] = useState('충청남도 아산시');
  const [district, setDistrict] = useState(initialProject?.district || '온양1동');
  const [department, setDepartment] = useState(initialProject?.department || currentPersona.department || '스마트도시과');
  const [managerName, setManagerName] = useState(initialProject?.managerName || currentPersona.name);
  const [managerRank, setManagerRank] = useState(initialProject?.managerRank || currentPersona.rank);
  const [managerContact, setManagerContact] = useState(initialProject?.managerContact || '041-540-2000');
  const [managerEmail, setManagerEmail] = useState(initialProject?.managerEmail || 'official@asan.go.kr');

  // Budget
  const [nationalBudget, setNationalBudget] = useState(initialProject?.budget.national || 1000);
  const [provincialBudget, setProvincialBudget] = useState(initialProject?.budget.provincial || 500);
  const [municipalBudget, setMunicipalBudget] = useState(initialProject?.budget.municipal || 500);
  const totalBudget = nationalBudget + provincialBudget + municipalBudget;

  // Dates
  const [startDate, setStartDate] = useState(initialProject?.startDate || '2025-03-01');
  const [endDate, setEndDate] = useState(initialProject?.endDate || '2025-12-31');
  const [year, setYear] = useState(initialProject?.year || 2025);

  // Status & Category
  const [category, setCategory] = useState<ProjectCategory>(initialProject?.category || '스마트·디지털');
  const [status, setStatus] = useState<ProjectStatus>(initialProject?.status || 'planning');
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>(initialProject?.securityLevel || 'public');
  const [progressPercent, setProgressPercent] = useState(initialProject?.progressPercent || 20);

  // Content
  const [purpose, setPurpose] = useState(initialProject?.purpose || '');
  const [description, setDescription] = useState(initialProject?.description || '');

  // AI 3-Line Summary states
  const [aiSummary, setAiSummary] = useState(initialProject?.aiSummary || '');
  const [aiSummaryLines, setAiSummaryLines] = useState<string[]>(
    initialProject?.aiSummaryLines || (initialProject?.aiSummary ? initialProject.aiSummary.split('\n') : [])
  );
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryStatusMessage, setSummaryStatusMessage] = useState<string | null>(null);

  const [targetBeneficiaries, setTargetBeneficiaries] = useState(initialProject?.targetBeneficiaries || '아산시민 및 관내 취약계층');
  const [expectedEffects, setExpectedEffects] = useState<string[]>(
    initialProject?.expectedEffects || [
      '아산시민 체감형 공공서비스 품질 향상',
      '행정 효율화 및 시정 예산 절감 달성',
    ]
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialProject?.tags || ['아산시', '스마트행정']);

  // GIS Location - focused on Asan-si
  const [address, setAddress] = useState(initialProject?.location.address || `충청남도 아산시 ${district} 일원`);
  const [lat, setLat] = useState(initialProject?.location.lat || 36.7898);
  const [lng, setLng] = useState(initialProject?.location.lng || 127.0018);

  // When district changes, update address placeholder if not customized
  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    if (!address || address.includes('충청남도 아산시')) {
      setAddress(`충청남도 아산시 ${newDistrict} 일원`);
    }
  };

  // AI 3줄 요약 생성기 (Gemini API 호출)
  const handleGenerateAiSummary = async () => {
    if (!title.trim() && !purpose.trim() && !description.trim()) {
      alert('AI 3줄 요약을 생성하려면 사업명, 사업 목적 또는 주요 내용 중 최소 1개 이상을 입력해 주세요.');
      return;
    }

    setIsSummarizing(true);
    setSummaryStatusMessage(null);

    try {
      const response = await fetch('/api/summarize-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          purpose: purpose.trim(),
          description: description.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답 오류 (${response.status})`);
      }

      const data = await response.json();
      const summaryText = data.summary || '';
      const lines: string[] = data.lines && data.lines.length > 0 ? data.lines : summaryText.split('\n');

      setAiSummary(summaryText);
      setAiSummaryLines(lines);
      setSummaryStatusMessage('Gemini AI 3줄 요약이 성공적으로 생성되었습니다.');
    } catch (error) {
      console.error('AI summary error:', error);
      // Client-side structured fallback
      const fallback = [
        `1. [추진목적] ${purpose ? purpose.slice(0, 65) : `${title || '아산시 핵심 과제'}를 통한 시민 편익 증대`}`,
        `2. [주요내용] ${description ? description.slice(0, 70) : '관내 주요 인프라 구축 및 맞춤형 공공서비스 운영'}`,
        `3. [기대효과] 행정 효율성 극대화 및 아산시민 시정 만족도 제고`,
      ];
      setAiSummary(fallback.join('\n'));
      setAiSummaryLines(fallback);
      setSummaryStatusMessage('표준 3줄 요약이 생성되었습니다.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Audit reason for log
  const [editReason, setEditReason] = useState(isEdit ? '계획 변경에 따른 세부사항 업데이트' : '신규 사업 등록');

  // Real-time Similarity & Duplication Check
  const similarityResults: SimilarityResult[] = useMemo(() => {
    return calculateSimilarity(
      {
        title,
        category,
        purpose,
        description,
        tags,
      },
      allProjects,
      initialProject?.id
    );
  }, [title, category, purpose, description, tags, allProjects, initialProject]);

  const highSimilarityMatches = similarityResults.filter((r) => r.score >= 50);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddEffect = () => {
    setExpectedEffects([...expectedEffects, '신규 기대 효과 항목']);
  };

  const handleUpdateEffect = (index: number, val: string) => {
    const updated = [...expectedEffects];
    updated[index] = val;
    setExpectedEffects(updated);
  };

  const handleRemoveEffect = (index: number) => {
    setExpectedEffects(expectedEffects.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('사업명을 입력해 주세요.');
      return;
    }
    if (!purpose.trim()) {
      alert('사업 목적을 입력해 주세요.');
      return;
    }

    const payload: Partial<Project> = {
      title,
      region,
      district,
      department,
      managerName,
      managerRank,
      managerContact,
      managerEmail,
      budget: {
        national: Number(nationalBudget) || 0,
        provincial: Number(provincialBudget) || 0,
        municipal: Number(municipalBudget) || 0,
        total: totalBudget,
      },
      startDate,
      endDate,
      year: Number(year) || 2025,
      category,
      status,
      securityLevel,
      progressPercent: Number(progressPercent) || 0,
      purpose,
      description,
      aiSummary: aiSummary || undefined,
      aiSummaryLines: aiSummaryLines && aiSummaryLines.length > 0 ? aiSummaryLines : undefined,
      targetBeneficiaries,
      expectedEffects: expectedEffects.filter((e) => e.trim().length > 0),
      tags,
      location: {
        region,
        district,
        address,
        lat: Number(lat) || 36.7898,
        lng: Number(lng) || 127.0018,
      },
    };

    onSave(payload, editReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">
                {isEdit ? '사업 정보 수정 및 공정 변경' : '지자체 신규 사업 기획·등록'}
              </h2>
              <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                공공 표준 서식
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              사업 정보를 입력하면 실시간으로 아산시 관내 전 부서 유사 사업을 자동 검색하여 예산 중복 투자를 방지합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with 2 Columns: Form on Left, Real-time Duplicate Detector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto">
          {/* Main Form Fields (2 Cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 p-6 space-y-5 text-xs sm:text-sm">
            {/* Section 1: Basic Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>기본 사업 정보</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  사업명 (공식 명칭) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 2025년도 스마트 안심 보행로 및 AI 교차로 안전망 구축"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">지자체 (관할)</label>
                  <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center justify-between">
                    <span>충청남도 아산시</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">고정</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">관내 읍·면·동</label>
                  <select
                    value={district}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500"
                  >
                    {ASAN_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">소관 부서</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">정책 분야</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
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
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">담당자 성명</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">직급</label>
                  <input
                    type="text"
                    value={managerRank}
                    onChange={(e) => setManagerRank(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">행정 유선연락처</label>
                  <input
                    type="text"
                    value={managerContact}
                    onChange={(e) => setManagerContact(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">공직 이메일</label>
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Budget Breakdown (Auto calculation) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5">
                <div className="flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>예산 구조 및 재원 분담 (단위: 백만 원)</span>
                </div>
                <span className="text-blue-600 font-extrabold">
                  총 예산: {formatBudget(totalBudget)} ({totalBudget.toLocaleString()}백만 원)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <label className="block font-semibold text-blue-950 mb-1">국비 지원액</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={nationalBudget}
                      onChange={(e) => setNationalBudget(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg font-bold text-slate-800"
                    />
                    <span className="ml-1.5 text-[11px] text-slate-500 shrink-0">백만</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <label className="block font-semibold text-indigo-950 mb-1">도비 지원액</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={provincialBudget}
                      onChange={(e) => setProvincialBudget(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg font-bold text-slate-800"
                    />
                    <span className="ml-1.5 text-[11px] text-slate-500 shrink-0">백만</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <label className="block font-semibold text-emerald-950 mb-1">시·군·구비</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      value={municipalBudget}
                      onChange={(e) => setMunicipalBudget(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white border border-emerald-200 rounded-lg font-bold text-slate-800"
                    />
                    <span className="ml-1.5 text-[11px] text-slate-500 shrink-0">백만</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Status, Dates, Security */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">사업 상태</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="planning">기획 중</option>
                  <option value="in_progress">진행 중</option>
                  <option value="completed">완료</option>
                  <option value="on_hold">보류</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">보안 등급</label>
                <select
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(e.target.value as SecurityLevel)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="public">전체 공개</option>
                  <option value="internal">내부 공개 (지자체망)</option>
                  <option value="confidential">대외비 (비공개)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">공정률 / 이행률 (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">기준 연도</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || 2025)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">시작 연월</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">종료 예정 연월</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            {/* Section 4: Purpose & Content */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  사업 목적 및 추진 배경 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="예: 초고령사회 진입에 따른 독거노인 고독사 조기 감지 및 119 응급 구조 골든타임 확보"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  주요 사업 내용 및 세부 추진 계획
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="사업 범위, 설치 장비 내역, 위탁 운영 방식, 홍보 계획 등을 상세히 기재해 주세요."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* AI 3줄 요약 카드 (Gemini AI 연동) */}
              <div className="p-4 bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 border border-indigo-200/80 rounded-xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs text-indigo-950">AI 기반 3줄 핵심 요약</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full">
                          Gemini AI
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-700/80">
                        사업명·목적·주요내용을 분석하여 공무원 및 관리자 결재용 3줄 요약을 자동 생성합니다.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiSummary}
                    disabled={isSummarizing}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSummarizing ? 'animate-spin' : ''}`} />
                    <span>{isSummarizing ? 'AI 분석 요약 중...' : (aiSummary ? 'AI 요약 재생성' : 'AI 3줄 요약 생성')}</span>
                  </button>
                </div>

                {summaryStatusMessage && (
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center space-x-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{summaryStatusMessage}</span>
                  </div>
                )}

                {isSummarizing ? (
                  <div className="p-4 bg-white/90 rounded-lg border border-indigo-100 flex items-center space-x-3 text-xs text-indigo-900 animate-pulse">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                    <span>아산시 행정 정책 맥락을 분석하여 3줄 요약 문안을 추출하고 있습니다...</span>
                  </div>
                ) : (
                  <>
                    {aiSummaryLines && aiSummaryLines.length > 0 ? (
                      <div className="space-y-2 bg-white p-3 rounded-lg border border-indigo-100">
                        <div className="text-[11px] font-semibold text-indigo-900 mb-1 flex items-center justify-between">
                          <span>생성된 3줄 요약 문안 (수정 가능):</span>
                          <span className="text-[10px] text-slate-400">목록 호버 툴팁에 자동 반영됩니다</span>
                        </div>
                        {aiSummaryLines.map((line, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold flex items-center justify-center mt-0.5">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={line}
                              onChange={(e) => {
                                const newLines = [...aiSummaryLines];
                                newLines[idx] = e.target.value;
                                setAiSummaryLines(newLines);
                                setAiSummary(newLines.join('\n'));
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-white/70 rounded-lg border border-dashed border-indigo-200 text-center">
                        <p className="text-[11px] text-slate-500">
                          위의 사업명과 목적을 입력한 뒤 <strong className="text-indigo-600 font-semibold">[AI 3줄 요약 생성]</strong> 버튼을 누르면, Gemini가 행정 표준 요약을 자동으로 작성해 줍니다.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">수혜 대상</label>
                <input
                  type="text"
                  value={targetBeneficiaries}
                  onChange={(e) => setTargetBeneficiaries(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Expected Effects */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">주요 기대 효과</label>
                  <button
                    type="button"
                    onClick={handleAddEffect}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    + 항목 추가
                  </button>
                </div>
                <div className="space-y-1.5">
                  {expectedEffects.map((eff, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={eff}
                        onChange={(e) => handleUpdateEffect(i, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      {expectedEffects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEffect(i)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">연관 키워드 태그</label>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="태그 입력 후 엔터 (예: #IoT돌봄, #스마트교차로)"
                    className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] border border-blue-200 font-medium"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Address / GIS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  공간 위치 및 소재지 주소 (GIS 지도 연동)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="예: 서울특별시 성동구 왕십리로 270"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {/* Reason for change (Audit Log) */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  변경 / 등록 사유 (공공 이력 로그 기록용)
                </label>
                <input
                  type="text"
                  required
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="예: 국비 매칭 확정에 따른 예산안 증액 및 공정 일정 조정"
                  className="w-full px-3 py-1.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{isEdit ? '수정 내용 저장' : '신규 사업 등록 완료'}</span>
              </button>
            </div>
          </form>

          {/* Right Column: Real-time Duplication & Similar Projects Assistant (PRD Requirement!) */}
          <div className="p-5 bg-slate-50/80 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900">
                  실시간 유사 사업 추천 & 중복도 감지
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                입력하시는 사업명, 키워드, 정책 분야를 실시간 분석하여 아산시 관내 중복 사업을 감지하고 상호 벤치마킹을 지원합니다.
              </p>

              {/* Status Alert Badge */}
              <div className="mt-3">
                {highSimilarityMatches.length > 0 ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs space-y-1">
                    <div className="flex items-center space-x-1 font-bold text-rose-700">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>중복 주의: 관내 유사 사업 {highSimilarityMatches.length}건 발견</span>
                    </div>
                    <p className="text-[11px] text-rose-800">
                      기존 사업과 목적 또는 명칭이 유사합니다. 예산 중복 심의에서 지적될 수 있으니 차별점을 점검하세요.
                    </p>
                  </div>
                ) : similarityResults.length > 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                    <div className="flex items-center space-x-1 font-bold text-amber-700">
                      <Info className="w-4 h-4 text-amber-600" />
                      <span>참고 가능 사업 {similarityResults.length}건 추천</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      아산시 관내 선행 우수 사례를 참고하여 조례 및 제안서를 벤치마킹할 수 있습니다.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                    <div className="flex items-center space-x-1 font-bold text-emerald-700">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>중복 사업 미감지 (신규 독창성 양호)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      아산시 관내 등록 사업과 겹치는 내용이 없습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* Similar Projects List */}
              <div className="mt-4 space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {similarityResults.slice(0, 4).map((sim) => (
                  <div
                    key={sim.project.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-all text-xs space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-400">{sim.project.region}</span>
                      <span
                        className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                          sim.score >= 70
                            ? 'bg-rose-100 text-rose-800'
                            : sim.score >= 45
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        유사도 {sim.score}%
                      </span>
                    </div>

                    <div className="font-bold text-slate-800 line-clamp-1">
                      {sim.project.title}
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      {sim.project.purpose}
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-50 p-1.5 rounded border border-slate-100">
                      <strong>일치 항목:</strong> {sim.reasons.join(', ')}
                    </div>

                    {onViewSimilarProject && (
                      <button
                        type="button"
                        onClick={() => onViewSimilarProject(sim.project)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold pt-1"
                      >
                        사업 상세 및 계획서 열람 →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Tip */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500">
              <strong className="text-slate-700">💡 벤치마킹 팁:</strong> 신규 사업 기획서 작성 시 아산시 타 부서의 성공 요인과 실패 방지 대책을 사전 검토하면 기획 심의 통과율이 크게 높아집니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
