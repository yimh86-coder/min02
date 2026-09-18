import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProjectListView } from './components/ProjectListView';
import { MapView } from './components/MapView';
import { DuplicationChecker } from './components/DuplicationChecker';
import { QnACenterView } from './components/QnACenterView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { PrintReportModal } from './components/PrintReportModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SavedProjectsModal } from './components/SavedProjectsModal';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';

import { Project, UserPersona, NotificationItem, FilterState, ProjectCategory } from './types';
import { INITIAL_PROJECTS } from './data/mockProjects';
import { MOCK_USERS } from './data/mockUsers';

const STORAGE_KEY_PROJECTS = 'asan_si_projects_live_clean_v4';
const STORAGE_KEY_USER = 'asan_si_user_live_v4';
const STORAGE_KEY_AUTH = 'asan_si_auth_live_v4';

export default function App() {
  // Load initial projects from localStorage or clean INITIAL_PROJECTS
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      // Clear legacy storage keys
      localStorage.removeItem('gov_shared_projects_v2');
      localStorage.removeItem('gov_shared_projects_v1');
      localStorage.removeItem('gov_shared_auth_v2');
      localStorage.removeItem('gov_shared_user_v2');

      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROJECTS; // empty array []
  });

  // Authentication state - false by default to prompt login
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState<string | undefined>(undefined);

  // Current persona (RBAC)
  const [currentPersona, setCurrentPersona] = useState<UserPersona>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        if (saved.startsWith('{')) {
          return JSON.parse(saved);
        }
        const found = MOCK_USERS.find((u) => u.id === saved);
        if (found) return found;
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_USERS[0]; // Default: Officer (김주무관)
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'map' | 'duplicate_check' | 'qna'>('dashboard');

  // Modals & Drawers state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printTargetProject, setPrintTargetProject] = useState<Project | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [savedProjectsModalOpen, setSavedProjectsModalOpen] = useState(false);

  // Filter state to pass to ProjectListView when navigating from dashboard
  const [listFilters, setListFilters] = useState<Partial<FilterState>>({});

  // Clean initial notifications for Asan-si platform
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-welcome',
      title: '아산시 사업 통합 관리 시스템',
      message: '아산시 시정 사업 공유 및 통합 관리 시스템에 오신 것을 환영합니다. 예시 사업 데이터가 초기화되었습니다.',
      projectId: '',
      time: '공지',
      read: false,
      type: 'update',
    },
  ]);

  // Persist projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  // Persist user persona
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentPersona));
    } catch (e) {
      console.error(e);
    }
  }, [currentPersona]);

  // Persist auth status
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, String(isLoggedIn));
    } catch (e) {
      console.error(e);
    }
  }, [isLoggedIn]);

  const handleLogin = (persona: UserPersona) => {
    setCurrentPersona(persona);
    setIsLoggedIn(true);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '아산시 공직자 인증 완료',
        message: `${persona.name} (${persona.department} · ${persona.roleName})님으로 접속되었습니다.`,
        projectId: '',
        time: '방금 전',
        read: false,
        type: 'update',
      },
      ...prev,
    ]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '로그아웃 완료',
        message: '안전하게 로그아웃되었습니다. 비회원 조회 모드로 전환되었습니다.',
        projectId: '',
        time: '방금 전',
        read: false,
        type: 'alert',
      },
      ...prev,
    ]);
  };

  // Bookmark toggle
  const handleToggleBookmark = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );

    // If modal is open, also sync
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likesCount: !prev.isLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1),
            }
          : null
      );
    }
  };

  // Delete project handler
  const handleDeleteProject = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetProject = projects.find((p) => p.id === projectId);
    const title = targetProject?.title || '해당 사업';

    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
    }

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '사업 삭제 완료',
        message: `[${title}] 사업이 영구 삭제되었습니다.`,
        projectId: '',
        time: '방금 전',
        read: false,
        type: 'alert',
      },
      ...prev,
    ]);
  };

  // Open new project with login check
  const handleOpenNewProject = () => {
    if (!isLoggedIn) {
      setLoginPromptMessage('아산시 관내 신규 사업을 등록하려면 공직자 로그인이 필요합니다.');
      setLoginModalOpen(true);
      return;
    }
    setEditingProject(null);
    setFormModalOpen(true);
  };

  // Add or Edit Project handler
  const handleSaveProject = (projectData: Partial<Project>, logReason: string) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    if (editingProject) {
      // Update existing
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id === editingProject.id) {
            const updatedLogs = [
              {
                id: `log-${Date.now()}`,
                timestamp,
                user: currentPersona.name,
                role: currentPersona.roleName,
                action: '정보 수정',
                details: logReason || '사업 세부내용 변경',
              },
              ...p.logs,
            ];

            const updated = {
              ...p,
              ...projectData,
              updatedAt: timestamp.slice(0, 10),
              logs: updatedLogs,
            } as Project;

            if (selectedProject?.id === p.id) {
              setSelectedProject(updated);
            }
            return updated;
          }
          return p;
        })
      );
    } else {
      // Create new
      const newId = `prj-${Date.now().toString().slice(-4)}`;
      const newCode = `PRJ-${projectData.year || 2025}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newProject: Project = {
        id: newId,
        code: newCode,
        title: projectData.title || '신규 아산시 사업',
        region: projectData.region || '충청남도 아산시',
        district: projectData.district || '온양1동',
        department: projectData.department || currentPersona.department,
        managerName: projectData.managerName || currentPersona.name,
        managerRank: projectData.managerRank || currentPersona.rank,
        managerContact: projectData.managerContact || '041-540-2114',
        managerEmail: projectData.managerEmail || `${currentPersona.employeeId || 'officer'}@asan.go.kr`,
        budget: projectData.budget || { national: 1000, provincial: 500, municipal: 500, total: 2000 },
        startDate: projectData.startDate || '2025-03-01',
        endDate: projectData.endDate || '2025-12-31',
        year: projectData.year || 2025,
        category: projectData.category || '스마트·디지털',
        status: projectData.status || 'planning',
        securityLevel: projectData.securityLevel || 'public',
        progressPercent: projectData.progressPercent || 10,
        purpose: projectData.purpose || '',
        description: projectData.description || '',
        targetBeneficiaries: projectData.targetBeneficiaries || '아산시민',
        expectedEffects: projectData.expectedEffects || ['시정 효율성 증대 및 시민 편익 향상'],
        tags: projectData.tags || ['아산시사업'],
        location: projectData.location || {
          region: '충청남도 아산시',
          district: projectData.district || '온양1동',
          address: '충청남도 아산시 시민로 456 (온천동, 아산시청)',
          lat: 36.7898,
          lng: 127.0018,
        },
        attachments: [
          {
            id: `att-${Date.now()}`,
            name: `${projectData.title || '신규사업'}_사업계획서(초안).pdf`,
            size: '2.5 MB',
            type: 'pdf',
            uploadedAt: timestamp.slice(0, 10),
          },
        ],
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp,
            user: currentPersona.name,
            role: currentPersona.roleName,
            action: '신규 등록',
            details: logReason || '신규 정책 사업 기획서 등록',
          },
        ],
        qnaList: [],
        likesCount: 1,
        isLiked: true,
        viewsCount: 1,
        createdAt: timestamp.slice(0, 10),
        updatedAt: timestamp.slice(0, 10),
      };

      setProjects((prev) => [newProject, ...prev]);

      // Add a notification for subscription
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: '신규 사업 등록 완료',
          message: `[${newProject.title}] 사업이 성공적으로 등록되었습니다.`,
          projectId: newProject.id,
          time: '방금 전',
          read: false,
          type: 'update',
        },
        ...prev,
      ]);
    }

    setFormModalOpen(false);
    setEditingProject(null);
  };

  // Add QnA
  const handleAddQnA = (projectId: string, question: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const newQnA = {
      id: `qna-${Date.now()}`,
      author: currentPersona.name,
      authorOrg: `${currentPersona.region} ${currentPersona.department}`,
      authorEmail: 'inquiry@gov.kr',
      question,
      date: today,
      status: 'waiting' as const,
    };

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updated = {
            ...p,
            qnaList: [newQnA, ...p.qnaList],
          };
          if (selectedProject?.id === p.id) {
            setSelectedProject(updated);
          }
          return updated;
        }
        return p;
      })
    );

    // Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '신규 벤치마킹 질의 등록',
        message: `${currentPersona.name}님이 벤치마킹 질의를 등록했습니다: "${question.slice(0, 24)}..."`,
        projectId,
        time: '방금 전',
        read: false,
        type: 'qna',
      },
      ...prev,
    ]);
  };

  // Answer QnA
  const handleAnswerQnA = (projectId: string, qnaId: string, answer: string) => {
    const today = new Date().toISOString().slice(0, 10);

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          const updatedQnaList = p.qnaList.map((q) => {
            if (q.id === qnaId) {
              return {
                ...q,
                status: 'answered' as const,
                answer,
                answeredBy: `${currentPersona.name} (${currentPersona.rank})`,
                answeredDate: today,
              };
            }
            return q;
          });

          const updated = { ...p, qnaList: updatedQnaList };
          if (selectedProject?.id === p.id) {
            setSelectedProject(updated);
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Export CSV formatted for Korean Excel (with BOM)
  const handleExportCsv = () => {
    const headers = ['사업코드', '사업명', '지자체', '부서', '담당자', '정책분야', '상태', '국비(백만)', '도비(백만)', '시비(백만)', '총예산(백만)', '공정률(%)', '보안등급', '등록일자'];
    
    const rows = projects.map((p) => [
      `"${p.code}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.region} ${p.district}"`,
      `"${p.department}"`,
      `"${p.managerName}"`,
      `"${p.category}"`,
      `"${p.status}"`,
      p.budget.national,
      p.budget.provincial,
      p.budget.municipal,
      p.budget.total,
      p.progressPercent,
      `"${p.securityLevel}"`,
      `"${p.createdAt}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `아산시_사업관리_통합데이터_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Saved projects count
  const savedProjects = projects.filter((p) => p.isLiked);
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Platform Header */}
      <Header
        currentPersona={currentPersona}
        personas={MOCK_USERS}
        onSelectPersona={setCurrentPersona}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProject={handleOpenNewProject}
        savedProjectsCount={savedProjects.length}
        onOpenSavedProjects={() => setSavedProjectsModalOpen(true)}
        notifications={notifications}
        unreadCount={unreadNotificationsCount}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => {
          setLoginPromptMessage(undefined);
          setLoginModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            projects={projects}
            currentPersona={currentPersona}
            onSelectProject={(p) => setSelectedProject(p)}
            onFilterByCategory={(category) => {
              setListFilters({ category });
              setActiveTab('projects');
            }}
            onFilterByStatus={(status) => {
              setListFilters({ status });
              setActiveTab('projects');
            }}
            onOpenReportModal={() => {
              setPrintTargetProject(null);
              setPrintModalOpen(true);
            }}
            onExportCsv={handleExportCsv}
            onOpenNewProject={handleOpenNewProject}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectListView
            projects={projects}
            currentPersona={currentPersona}
            onSelectProject={(p) => setSelectedProject(p)}
            onToggleBookmark={handleToggleBookmark}
            onDeleteProject={handleDeleteProject}
            initialFilter={listFilters}
            onOpenNewProject={handleOpenNewProject}
            onOpenDuplicationCheck={() => setActiveTab('duplicate_check')}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            projects={projects}
            onSelectProject={(p) => setSelectedProject(p)}
            onOpenNewProject={handleOpenNewProject}
          />
        )}

        {activeTab === 'duplicate_check' && (
          <DuplicationChecker
            allProjects={projects}
            onSelectProject={(p) => setSelectedProject(p)}
            onOpenNewProjectWithDraft={(draft) => {
              if (!isLoggedIn) {
                setLoginPromptMessage('기획안으로 신규 사업을 등록하려면 공직자 로그인이 필요합니다.');
                setLoginModalOpen(true);
                return;
              }
              setEditingProject({
                id: '',
                code: '',
                title: draft.title,
                region: '충청남도 아산시',
                district: '온양1동',
                department: currentPersona.department,
                managerName: currentPersona.name,
                managerRank: currentPersona.rank,
                managerContact: '041-540-2114',
                managerEmail: `${currentPersona.employeeId || 'officer'}@asan.go.kr`,
                budget: { national: 1000, provincial: 500, municipal: 500, total: 2000 },
                startDate: '2025-03-01',
                endDate: '2025-12-31',
                year: 2025,
                category: draft.category,
                status: 'planning',
                securityLevel: 'public',
                progressPercent: 10,
                purpose: draft.purpose,
                description: '',
                targetBeneficiaries: '아산시민',
                expectedEffects: ['예산 절감 및 행정 효율성 증대'],
                tags: draft.tags,
                location: {
                  region: '충청남도 아산시',
                  district: '온양1동',
                  address: '충청남도 아산시 시민로 456 (온천동, 아산시청)',
                  lat: 36.7898,
                  lng: 127.0018,
                },
                attachments: [],
                logs: [],
                qnaList: [],
                likesCount: 0,
                viewsCount: 0,
                createdAt: '',
                updatedAt: '',
              });
              setFormModalOpen(true);
            }}
          />
        )}

        {activeTab === 'qna' && (
          <QnACenterView
            projects={projects}
            currentPersona={currentPersona}
            onSelectProject={(p) => setSelectedProject(p)}
            onAnswerQnA={handleAnswerQnA}
          />
        )}
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          currentPersona={currentPersona}
          onClose={() => setSelectedProject(null)}
          onToggleBookmark={handleToggleBookmark}
          onDeleteProject={handleDeleteProject}
          onOpenEdit={(p) => {
            setEditingProject(p);
            setFormModalOpen(true);
          }}
          onOpenPrintReport={(p) => {
            setPrintTargetProject(p);
            setPrintModalOpen(true);
          }}
          onAddQnA={handleAddQnA}
          onAnswerQnA={handleAnswerQnA}
          allProjects={projects}
          onSelectProject={(p) => setSelectedProject(p)}
        />
      )}

      {/* Project Form Modal (Register & Edit) */}
      {formModalOpen && (
        <ProjectFormModal
          initialProject={editingProject}
          currentPersona={currentPersona}
          allProjects={projects}
          onSave={handleSaveProject}
          onClose={() => {
            setFormModalOpen(false);
            setEditingProject(null);
          }}
          onViewSimilarProject={(p) => {
            setSelectedProject(p);
          }}
        />
      )}

      {/* Print Report Modal */}
      {printModalOpen && (
        <PrintReportModal
          project={printTargetProject}
          projects={projects}
          currentPersona={currentPersona}
          onClose={() => setPrintModalOpen(false)}
        />
      )}

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onSelectProjectById={(id) => {
          const found = projects.find((p) => p.id === id);
          if (found) setSelectedProject(found);
        }}
      />

      {/* Saved Bookmarks Modal */}
      <SavedProjectsModal
        isOpen={savedProjectsModalOpen}
        onClose={() => setSavedProjectsModalOpen(false)}
        savedProjects={savedProjects}
        onSelectProject={(p) => setSelectedProject(p)}
        onRemoveBookmark={(id, e) => handleToggleBookmark(id, e)}
      />

      {/* Public Official Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          setLoginPromptMessage(undefined);
        }}
        personas={MOCK_USERS}
        currentPersona={isLoggedIn ? currentPersona : null}
        onLogin={handleLogin}
        promptMessage={loginPromptMessage}
      />

      {/* Asan-si Official Footer with Representative Phone (디터브/푸터) */}
      <Footer />
    </div>
  );
}
