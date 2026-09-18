import React from 'react';
import { X, Printer, Download, Building2, CheckCircle2 } from 'lucide-react';
import { Project, UserPersona } from '../types';
import { formatBudget, formatFullBudget } from '../utils/formatters';

interface PrintReportModalProps {
  project?: Project | null;
  projects?: Project[];
  currentPersona: UserPersona;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  project,
  projects,
  currentPersona,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none print:max-w-none">
        {/* Modal Toolbar (hidden in print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              지자체 표준 보고서 서식 미리보기 & 인쇄
            </h3>
            <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              단체장 보고용
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>즉시 인쇄 / PDF 저장</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (Korean Official Gov Document Style) */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-slate-900 text-xs sm:text-sm font-sans print:p-0">
          {project ? (
            /* Single Project Comprehensive Report */
            <div className="space-y-6">
              {/* Header & Approval Box */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-slate-900 pb-4 gap-4">
                <div>
                  <div className="text-xs text-slate-500 font-mono tracking-wider">
                    문서번호: {project.code}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 mt-1 tracking-tight">
                    지자체 사업 추진계획 및 실적 종합보고서
                  </h1>
                  <p className="text-xs text-slate-600 mt-1">
                    {project.region} {project.district} • {project.department}
                  </p>
                </div>

                {/* Gov Sign-off stamp table */}
                <div className="border border-slate-400 text-center text-[10px] shrink-0 self-end sm:self-auto">
                  <table className="border-collapse">
                    <tbody>
                      <tr>
                        <th className="border border-slate-400 p-1 bg-slate-100 font-medium" rowSpan={2}>
                          결<br />재
                        </th>
                        <th className="border border-slate-400 px-3 py-1 bg-slate-50 font-normal">담당(기안)</th>
                        <th className="border border-slate-400 px-3 py-1 bg-slate-50 font-normal">팀장(검토)</th>
                        <th className="border border-slate-400 px-3 py-1 bg-slate-50 font-normal">과장/국장(결재)</th>
                      </tr>
                      <tr className="h-12">
                        <td className="border border-slate-400 p-1 text-slate-600 align-bottom">{project.managerName}</td>
                        <td className="border border-slate-400 p-1 text-slate-600 align-bottom">박팀장(서명)</td>
                        <td className="border border-slate-400 p-1 text-slate-600 align-bottom">전결</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 1. 사업 개요 Table */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-700 pl-2 mb-2">
                  1. 사업 기본 개요
                </h2>
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <tbody>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 font-semibold w-28 text-left">사 업 명</th>
                      <td className="border border-slate-300 p-2 font-bold" colSpan={3}>{project.title}</td>
                    </tr>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 font-semibold text-left">소관 지자체</th>
                      <td className="border border-slate-300 p-2">{project.region} {project.district} ({project.department})</td>
                      <th className="border border-slate-300 bg-slate-100 p-2 font-semibold text-left w-28">사업 담당자</th>
                      <td className="border border-slate-300 p-2">{project.managerName} {project.managerRank} ({project.managerContact})</td>
                    </tr>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 font-semibold text-left">추진 기간</th>
                      <td className="border border-slate-300 p-2">{project.startDate} ~ {project.endDate}</td>
                      <th className="border border-slate-300 bg-slate-100 p-2 font-semibold text-left">공정률/진척도</th>
                      <td className="border border-slate-300 p-2 font-bold text-blue-700">{project.progressPercent}% (정상 추진)</td>
                    </tr>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 p-2 font-semibold text-left">정책 분야</th>
                      <td className="border border-slate-300 p-2">{project.category}</td>
                      <th className="border border-slate-300 bg-slate-100 p-2 font-semibold text-left">보안 등급</th>
                      <td className="border border-slate-300 p-2 font-medium">
                        {project.securityLevel === 'public' ? '전체 공개' : project.securityLevel === 'internal' ? '내부 공개' : '대외비 (비공개)'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 2. 소요 예산 구조 */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-700 pl-2 mb-2">
                  2. 재원 조달 및 소요 예산 내역
                </h2>
                <table className="w-full border-collapse border border-slate-300 text-xs text-center">
                  <thead>
                    <tr className="bg-slate-100 font-semibold text-slate-700">
                      <th className="border border-slate-300 p-2">총 소요 예산</th>
                      <th className="border border-slate-300 p-2">국비 (비율)</th>
                      <th className="border border-slate-300 p-2">도비 (비율)</th>
                      <th className="border border-slate-300 p-2">시·군·구비 (비율)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold">
                      <td className="border border-slate-300 p-2 text-blue-800 bg-blue-50/50">
                        {formatFullBudget(project.budget.total)}
                      </td>
                      <td className="border border-slate-300 p-2">
                        {project.budget.national.toLocaleString()}백만 원 ({Math.round((project.budget.national / project.budget.total) * 100)}%)
                      </td>
                      <td className="border border-slate-300 p-2">
                        {project.budget.provincial.toLocaleString()}백만 원 ({Math.round((project.budget.provincial / project.budget.total) * 100)}%)
                      </td>
                      <td className="border border-slate-300 p-2">
                        {project.budget.municipal.toLocaleString()}백만 원 ({Math.round((project.budget.municipal / project.budget.total) * 100)}%)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3. 사업 목적 및 주요 내용 */}
              <div>
                <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-700 pl-2 mb-2">
                  3. 사업 목적 및 추진 배경
                </h2>
                <div className="p-3 border border-slate-300 bg-slate-50/50 leading-relaxed text-xs">
                  {project.purpose}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-700 pl-2 mb-2">
                  4. 주요 사업 내용
                </h2>
                <div className="p-3 border border-slate-300 leading-relaxed text-xs whitespace-pre-line">
                  {project.description}
                </div>
              </div>

              {/* 5. 기대 효과 및 중복 방지 검토 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-700 pl-2 mb-2">
                    5. 주요 기대 효과
                  </h2>
                  <ul className="border border-slate-300 p-3 space-y-1 text-xs">
                    {project.expectedEffects.map((eff, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-600 mr-1.5">•</span>
                        <span>{eff}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-700 pl-2 mb-2">
                    6. 아산시 관내 중복성 사전 검토 결과
                  </h2>
                  <div className="border border-slate-300 p-3 text-xs bg-emerald-50/40 text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      <span>예산 중복 투자 방지 검증 적합</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      아산시 사업 통합 공유망을 통한 사전 키워드 검증 결과, 관내 타 부서 및 읍·면·동 사업 대비 독창성과 차별성이 확보되었으며 사전 협의 검토가 완료되었습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-8 border-t border-slate-300 text-center space-y-2">
                <div className="text-xs text-slate-500">{todayStr}</div>
                <div className="text-base font-bold text-slate-900 tracking-wider">
                  {project.region} {project.district}장
                </div>
              </div>
            </div>
          ) : (
            /* Multi-project Summary Report for Manager */
            <div className="space-y-6">
              <div className="border-b-2 border-slate-900 pb-4">
                <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                  지자체 전체 사업 추진 현황 총괄 보고서
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  작성자: {currentPersona.name} ({currentPersona.rank}, {currentPersona.department}) • 기준일자: {todayStr}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 border border-slate-300 bg-slate-50">
                  <div className="text-slate-500">총 사업 건수</div>
                  <div className="text-xl font-bold mt-1">{(projects || []).length}건</div>
                </div>
                <div className="p-3 border border-slate-300 bg-slate-50">
                  <div className="text-slate-500">총 예산 규모</div>
                  <div className="text-xl font-bold mt-1 text-blue-700">
                    {formatBudget((projects || []).reduce((acc, p) => acc + p.budget.total, 0))}
                  </div>
                </div>
                <div className="p-3 border border-slate-300 bg-slate-50">
                  <div className="text-slate-500">평균 공정률</div>
                  <div className="text-xl font-bold mt-1 text-emerald-700">
                    {Math.round((projects || []).reduce((acc, p) => acc + p.progressPercent, 0) / ((projects || []).length || 1))}%
                  </div>
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-semibold">
                    <th className="border border-slate-300 p-2 text-center w-10">No</th>
                    <th className="border border-slate-300 p-2 text-left">사업명</th>
                    <th className="border border-slate-300 p-2 text-left">지자체/부서</th>
                    <th className="border border-slate-300 p-2 text-right">총 예산</th>
                    <th className="border border-slate-300 p-2 text-center">공정률</th>
                    <th className="border border-slate-300 p-2 text-center">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {(projects || []).map((p, idx) => (
                    <tr key={p.id}>
                      <td className="border border-slate-300 p-2 text-center text-slate-500">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-medium">{p.title}</td>
                      <td className="border border-slate-300 p-2 text-slate-600">{p.region} {p.district}</td>
                      <td className="border border-slate-300 p-2 text-right font-bold">{formatBudget(p.budget.total)}</td>
                      <td className="border border-slate-300 p-2 text-center">{p.progressPercent}%</td>
                      <td className="border border-slate-300 p-2 text-center font-semibold">
                        {p.status === 'in_progress' ? '진행중' : p.status === 'completed' ? '완료' : p.status === 'planning' ? '기획중' : '보류'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-8 border-t border-slate-300 text-center space-y-1">
                <div className="text-xs text-slate-500">{todayStr}</div>
                <div className="text-base font-bold text-slate-900">
                  기획조정실 총괄 점검 완료
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
