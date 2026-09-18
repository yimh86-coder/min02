import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Bell, 
  Bookmark, 
  Search, 
  BarChart3, 
  MapPin, 
  HelpCircle, 
  ShieldCheck, 
  Sparkles,
  ChevronDown,
  UserCheck,
  LogIn,
  LogOut,
  Phone
} from 'lucide-react';
import { UserPersona, NotificationItem } from '../types';

interface HeaderProps {
  currentPersona: UserPersona;
  personas: UserPersona[];
  onSelectPersona: (persona: UserPersona) => void;
  activeTab: 'dashboard' | 'projects' | 'map' | 'duplicate_check' | 'qna';
  setActiveTab: (tab: 'dashboard' | 'projects' | 'map' | 'duplicate_check' | 'qna') => void;
  onOpenNewProject: () => void;
  savedProjectsCount: number;
  onOpenSavedProjects: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  unreadCount: number;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  personas,
  onSelectPersona,
  activeTab,
  setActiveTab,
  onOpenNewProject,
  savedProjectsCount,
  onOpenSavedProjects,
  unreadCount,
  onOpenNotifications,
  isLoggedIn,
  onOpenLogin,
  onLogout,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs" id="main-header">
      {/* Top Banner / Gov Bar with Asan representative phone */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">아산시 시정 사업 공유 및 통합 관리망</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-300 font-semibold flex items-center space-x-1">
            <Phone className="w-3 h-3 mr-0.5" />
            <span>아산시 콜센터: 1422-42</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">시청 대표전화: 041-540-2114</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-slate-400 hidden sm:inline">소속 자치단체: <strong className="text-slate-200">충청남도 아산시</strong></span>
          <button
            type="button"
            onClick={isLoggedIn ? undefined : onOpenLogin}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-0.5 rounded-sm transition-colors ${
              isLoggedIn 
                ? 'text-amber-300 bg-amber-950/60 border border-amber-800/60' 
                : 'text-blue-300 bg-blue-950/80 border border-blue-700 hover:bg-blue-900 cursor-pointer'
            }`}
            title={isLoggedIn ? '아산시 공직자 인증 완료' : '클릭하여 공직자 로그인'}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isLoggedIn ? `${currentPersona.name} (${currentPersona.rank})` : '비회원 (클릭하여 로그인)'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-500/15">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  아산시 사업 통합 공유·관리 플랫폼
                </h1>
                <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                  아산시정
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                전 부서 및 읍·면·동 사업 중복 방지 · AI 3줄 요약 · 예산 효율화
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Login / User Status */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  id="persona-switcher-btn"
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-left rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
                  title="계정 정보 확인 및 공직자 계정 전환"
                >
                  <div className={`w-7 h-7 rounded-full ${currentPersona.avatarColor} text-white flex items-center justify-center text-xs font-bold`}>
                    {currentPersona.name.slice(0, 1)}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-semibold text-slate-800">{currentPersona.name}</span>
                      <span className="text-[11px] text-slate-500">({currentPersona.rank})</span>
                    </div>
                    <div className="text-[10px] text-blue-600 font-medium">{currentPersona.department}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Menu */}
                {showPersonaMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-700">로그인 정보</p>
                        <p className="text-[11px] text-slate-500">{currentPersona.department} ({currentPersona.roleName})</p>
                      </div>
                      <button
                        onClick={() => {
                          onLogout();
                          setShowPersonaMenu(false);
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded"
                        title="로그아웃"
                      >
                        <LogOut className="w-3 h-3 mr-0.5" />
                        <span>로그아웃</span>
                      </button>
                    </div>

                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      다른 공직자 계정으로 전환:
                    </div>

                    {personas.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPersona(p);
                          setShowPersonaMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start space-x-3 hover:bg-slate-50 transition-colors ${
                          currentPersona.id === p.id ? 'bg-blue-50/60 border-l-2 border-blue-600' : ''
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full ${p.avatarColor} text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5`}>
                          {p.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-slate-900">{p.name}</span>
                            <span className="text-[11px] text-slate-500">{p.rank}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{p.department} · {p.roleName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>공직자 로그인</span>
              </button>
            )}

            {/* Saved Bookmarks Button */}
            <button
              id="saved-projects-btn"
              onClick={onOpenSavedProjects}
              className="relative p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              title="관심 사업 (찜)"
            >
              <Bookmark className="w-4 h-4" />
              {savedProjectsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {savedProjectsCount}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <button
              id="notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              title="사업 변경 및 Q&A 알림"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* New Project Registration Button */}
            <button
              id="open-new-project-btn"
              onClick={onOpenNewProject}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/20 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">신규 사업 등록</span>
              <span className="sm:hidden">등록</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-100 overflow-x-auto py-1" aria-label="Tabs">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>사업 현황 대시보드</span>
          </button>

          <button
            id="tab-projects"
            onClick={() => setActiveTab('projects')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'projects'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>통합 사업 탐색 및 검색</span>
          </button>

          <button
            id="tab-map"
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'map'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>사업위치 지도 (구글맵 연동)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              무료 지도
            </span>
          </button>

          <button
            id="tab-duplicate-check"
            onClick={() => setActiveTab('duplicate_check')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'duplicate_check'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>유사 사업 사전 검증기</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
              중복 방지
            </span>
          </button>

          <button
            id="tab-qna"
            onClick={() => setActiveTab('qna')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'qna'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>아산시정 협업 질의응답 (Q&A)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
