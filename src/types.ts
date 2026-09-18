export type ProjectCategory =
  | '복지·보건'
  | '스마트·디지털'
  | '교통·도시'
  | '환경·에너지'
  | '문화·관광'
  | '경제·일자리'
  | '안전·재난';

export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold';

export type SecurityLevel = 'public' | 'internal' | 'confidential';

export type UserRole = 'officer' | 'manager' | 'admin';

export interface UserPersona {
  id: string;
  name: string;
  rank: string;
  department: string;
  region: string;
  role: UserRole;
  roleName: string;
  description: string;
  avatarColor: string;
  employeeId?: string;
  email?: string;
}

export interface AttachmentFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'hwp' | 'xlsx' | 'docx';
  uploadedAt: string;
  downloadUrl?: string;
}

export interface ProjectLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  details: string;
}

export interface ProjectQnA {
  id: string;
  author: string;
  authorOrg: string;
  authorEmail: string;
  question: string;
  date: string;
  status: 'waiting' | 'answered';
  answer?: string;
  answeredBy?: string;
  answeredDate?: string;
}

export interface BudgetBreakdown {
  national: number;   // 국비 (백만원)
  provincial: number; // 도비 (백만원)
  municipal: number;  // 시·군·구비 (백만원)
  total: number;      // 합계 (백만원)
}

export interface GeoLocation {
  region: string; // e.g., "서울특별시", "경기도", "부산광역시"
  district?: string; // e.g., "성동구", "수원시", "해운대구"
  address: string;
  lat: number;
  lng: number;
}

export interface Project {
  id: string;
  title: string;
  code: string; // e.g., "PRJ-2025-042"
  region: string; // 광역 지자체
  district: string; // 기초 지자체/시군구
  department: string;
  managerName: string;
  managerRank: string;
  managerContact: string;
  managerEmail: string;
  
  budget: BudgetBreakdown;
  startDate: string;
  endDate: string;
  year: number;
  
  category: ProjectCategory;
  status: ProjectStatus;
  securityLevel: SecurityLevel;
  progressPercent: number;
  
  purpose: string;
  description: string;
  aiSummary?: string; // AI 3줄 요약 전체 텍스트
  aiSummaryLines?: string[]; // AI 3줄 요약 줄단위 배열
  targetBeneficiaries: string;
  expectedEffects: string[];
  tags: string[];
  
  location: GeoLocation;
  attachments: AttachmentFile[];
  logs: ProjectLog[];
  qnaList: ProjectQnA[];
  
  likesCount: number;
  isLiked?: boolean;
  viewsCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  keyword: string;
  region: string;
  district: string; // 아산시 관내 읍·면·동 필터
  department: string;
  category: string;
  status: string;
  year: string;
  budgetRange: string;
  securityLevel: string;
  sortBy: 'latest' | 'budget_desc' | 'budget_asc' | 'likes' | 'progress';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  projectId: string;
  time: string;
  read: boolean;
  type: 'update' | 'qna' | 'alert';
}
