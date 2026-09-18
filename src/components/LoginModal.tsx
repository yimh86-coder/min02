import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Building2, 
  CheckCircle2, 
  KeyRound, 
  ArrowRight,
  Fingerprint,
  User,
  Briefcase,
  Mail,
  AlertCircle
} from 'lucide-react';
import { UserPersona } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: UserPersona[];
  currentPersona: UserPersona | null;
  onLogin: (persona: UserPersona) => void;
  promptMessage?: string;
}

const ASAN_DEPARTMENTS = [
  '기획예산과',
  '미래전략과',
  '스마트도시과',
  '대중교통과',
  '도로시설과',
  '관광진흥과',
  '문화예술과',
  '사회복지과',
  '보건행정과',
  '환경보전과',
  '기업지원과',
  '온양1동 행정복지센터',
  '온양2동 행정복지센터',
  '배방읍 행정복지센터',
  '탕정면 행정복지센터',
  '음봉면 행정복지센터',
  '둔포면 행정복지센터',
  '신창면 행정복지센터',
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  personas,
  currentPersona,
  onLogin,
  promptMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'credentials' | 'quick' | 'gpki'>('credentials');
  
  // Custom Login State
  const [userName, setUserName] = useState('');
  const [userDepartment, setUserDepartment] = useState('기획예산과');
  const [userRank, setUserRank] = useState('행정 7급 (주무관)');
  const [userId, setUserId] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Quick preset login
  const handleQuickSelect = (persona: UserPersona) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(persona);
      setIsLoading(false);
      setLoginSuccessMessage(`${persona.name} (${persona.department})으로 로그인되었습니다.`);
      setTimeout(() => {
        setLoginSuccessMessage(null);
        onClose();
      }, 700);
    }, 300);
  };

  // Custom credentials login
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('성명을 입력해 주세요.');
      return;
    }
    if (!userId.trim()) {
      alert('공직자 사번 또는 행정 ID/이메일을 입력해 주세요.');
      return;
    }

    setIsLoading(true);

    const isManager = userRank.includes('팀장') || userRank.includes('과장') || userRank.includes('서기관');
    const customPersona: UserPersona = {
      id: `custom-user-${Date.now()}`,
      name: userName.trim(),
      rank: userRank,
      department: userDepartment,
      region: '충청남도 아산시',
      role: isManager ? 'manager' : 'officer',
      roleName: isManager ? '부서 관리자' : '실무 담당자',
      description: `아산시 ${userDepartment} 소속 공직자`,
      avatarColor: isManager ? 'bg-blue-600' : 'bg-emerald-600',
      employeeId: userId.trim(),
      email: userId.includes('@') ? userId.trim() : `${userId.trim()}@asan.go.kr`,
    };

    setTimeout(() => {
      onLogin(customPersona);
      setIsLoading(false);
      setLoginSuccessMessage(`${customPersona.name} ${customPersona.rank} (${customPersona.department})님 환영합니다.`);
      setTimeout(() => {
        setLoginSuccessMessage(null);
        onClose();
      }, 700);
    }, 450);
  };

  // GPKI Certificate Login
  const handleGpkiLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const gpkiUser: UserPersona = personas[0] || {
        id: 'gpki-user',
        name: '김주무관',
        rank: '행정 7급',
        department: '스마트도시과',
        region: '충청남도 아산시',
        role: 'officer',
        roleName: '사업 담당자',
        description: '아산시 스마트도시과 실무 공직자',
        avatarColor: 'bg-emerald-600',
        employeeId: 'asan-gpki-2025',
        email: 'officer@asan.go.kr',
      };
      onLogin(gpkiUser);
      setIsLoading(false);
      setLoginSuccessMessage('행정전자서명(GPKI) 인증이 완료되었습니다.');
      setTimeout(() => {
        setLoginSuccessMessage(null);
        onClose();
      }, 700);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>아산시 행정포털 공직자 보안 인증</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            아산시 공직자 로그인
          </h3>
          <p className="text-xs text-blue-100/80 mt-1 leading-relaxed">
            아산시 관내 신규 사업 등록, AI 3줄 요약 작성, 예산 중복 방지 심의 및 보고서 출력을 위한 통합 인증입니다.
          </p>

          {promptMessage && (
            <div className="mt-3 p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{promptMessage}</span>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'credentials'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            공직자 직접 로그인
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'quick'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            직무별 간편 선택
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gpki')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'gpki'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            GPKI 전자서명
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loginSuccessMessage ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">인증 성공</h4>
              <p className="text-xs text-slate-600">{loginSuccessMessage}</p>
            </div>
          ) : activeTab === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>성명</span>
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="예: 김아산"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>직급</span>
                  </label>
                  <select
                    value={userRank}
                    onChange={(e) => setUserRank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-blue-600"
                  >
                    <option value="행정 7급 (주무관)">행정 7급 (주무관)</option>
                    <option value="행정 6급 (주무관)">행정 6급 (주무관)</option>
                    <option value="행정 5급 (팀장)">행정 5급 (팀장)</option>
                    <option value="행정 4급 (과장)">행정 4급 (과장)</option>
                    <option value="기획경제실 서기관">기획경제실 서기관</option>
                    <option value="임기제 / 연구원">임기제 / 연구원</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>소속 부서 / 읍·면·동</span>
                </label>
                <select
                  value={userDepartment}
                  onChange={(e) => setUserDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-blue-600"
                >
                  {ASAN_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>행정 ID 또는 이메일</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="예: yimh86@naver.com 또는 asan-2025-01"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white focus:outline-blue-600"
                    required
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>비밀번호</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요 (행정망 비밀번호)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:outline-blue-600"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>로그인 상태 유지</span>
                </label>
                <span className="text-slate-400 text-[11px]">아산시 행정 정보보안 규정 준수</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                {isLoading ? (
                  <span>인증 처리 중...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>아산시 공직자 로그인</span>
                  </>
                )}
              </button>
            </form>
          ) : activeTab === 'quick' ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>접속할 아산시 공직자 직무를 선택하세요:</span>
                <span className="text-[11px] text-blue-600 font-semibold">클릭 즉시 접속</span>
              </div>

              <div className="space-y-2">
                {personas.map((persona) => {
                  const isCurrent = currentPersona?.id === persona.id;
                  return (
                    <div
                      key={persona.id}
                      onClick={() => handleQuickSelect(persona)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500/20'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-full ${persona.avatarColor} text-white flex items-center justify-center text-xs font-bold shadow-xs`}
                        >
                          {persona.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-900">{persona.name}</span>
                            <span className="text-[11px] text-slate-500">({persona.rank})</span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                              {persona.roleName}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {persona.department} · {persona.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isCurrent && (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            현재 로그인됨
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  담당자 계정은 신규 사업 등록 및 AI 요약 작성이 가능하며, 관리자 계정은 결재·검토 및 시정 총괄 권한이 부여됩니다.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <Fingerprint className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  행정전자서명(GPKI) 인증서 로그인
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  USB 보안 토큰 또는 PC에 저장된 정부 표준 행정전자서명 인증서를 통해 아산시 공직자 신원을 확인합니다.
                </p>

                <button
                  type="button"
                  onClick={handleGpkiLogin}
                  disabled={isLoading}
                  className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span>GPKI 인증서 확인 중...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>GPKI 공인인증서 전자서명 인증하기</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                ※ 충청남도 아산시 공무원 행정 전산망 보안 가이드라인 준수
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>아산시청 기획경제실 스마트 행정지원</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
