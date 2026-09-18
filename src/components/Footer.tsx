import React from 'react';
import { 
  Phone, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  ExternalLink, 
  Mail, 
  Clock,
  Printer,
  Headphones,
  FileText
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-auto" id="app-footer">
      {/* Upper Asan Representative Phone & Contact Strip (디터브/푸터 대표전화 안내 바) */}
      <div className="bg-blue-950/80 border-b border-blue-900/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-slate-200">
            <div className="flex items-center space-x-2 bg-blue-900/70 border border-blue-700/60 px-3.5 py-1.5 rounded-lg">
              <Headphones className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-xs text-blue-200 font-medium">아산시 콜센터:</span>
              <a 
                href="tel:1422-42" 
                className="text-sm font-bold text-amber-300 hover:text-amber-200 tracking-wider"
                title="아산시 콜센터 바로 연결"
              >
                1422-42
              </a>
              <span className="text-[10px] text-blue-300 hidden sm:inline">(평일 09:00~18:00)</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3.5 py-1.5 rounded-lg">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300 font-medium">아산시청 대표전화:</span>
              <a 
                href="tel:041-540-2114" 
                className="text-sm font-bold text-white hover:text-emerald-300 tracking-wider"
                title="아산시청 대표전화 연결"
              >
                041-540-2114
              </a>
            </div>

            <div className="hidden lg:flex items-center space-x-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>야간·공휴일 당직실: <strong className="text-slate-200 font-mono">041-540-2222</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-300">
            <span className="flex items-center space-x-1 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700">
              <Printer className="w-3 h-3 text-slate-400" />
              <span>팩스: 041-540-2599</span>
            </span>
            <span className="flex items-center space-x-1 bg-slate-800/60 px-2.5 py-1 rounded border border-slate-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>시스템 행정망 연계</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-slate-800">
          {/* Col 1: Identity & Address */}
          <div className="md:col-span-6 space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                아산
              </div>
              <span className="text-sm font-bold text-white">충청남도 아산시 사업 공유 및 통합 관리 플랫폼</span>
            </div>
            
            <div className="space-y-1 text-slate-400 leading-relaxed text-[11px]">
              <p className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>(우 31512) 충청남도 아산시 시민로 456 (온천동) 아산시청</span>
              </p>
              <p>
                아산시 대표전화: <strong className="text-slate-200">041-540-2114</strong> | 아산시 콜센터: <strong className="text-amber-300">1422-42</strong> | 야간/공휴일 당직실: 041-540-2222 | 팩스: 041-540-2599
              </p>
              <p>
                총괄 운영부서: 아산시청 기획경제실 기획예산과 (시정 사업 총괄) & 스마트도시과 (플랫폼 운영)
              </p>
            </div>
          </div>

          {/* Col 2: Policy & Quick links */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">주요 행정 포털</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a 
                  href="https://www.asan.go.kr" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>아산시청 대표 포털</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.asan.go.kr/mayor" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span>열린시장실 · 시정 비전</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <span className="text-slate-400">아산시 자치법규(조례·규칙) 연계</span>
              </li>
              <li>
                <span className="text-slate-400">행정안전부 지방재정365 통합망</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Guidelines */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">플랫폼 운영 지침</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="text-slate-400">예산 중복 투자 방지 사전 검증 의무화</li>
              <li className="text-slate-400">AI 3줄 요약 자동 추출 및 표준 공정 관리</li>
              <li className="text-slate-400">아산시 17개 읍·면·동 행정협의체 공유</li>
              <li className="text-emerald-400 font-medium">개인정보처리방침 | 행정망 보안 준수</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            © ASAN CITY. ALL RIGHTS RESERVED. 본 플랫폼은 아산시 시정 사업 공유 및 예산 중복 방지 행정 표준을 지원합니다.
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>아산시청 대표전화: 041-540-2114</span>
            <span>•</span>
            <span className="text-amber-400">콜센터: 1422-42</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
