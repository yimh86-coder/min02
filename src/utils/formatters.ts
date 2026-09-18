import { ProjectStatus, SecurityLevel, ProjectCategory } from '../types';

export function formatBudget(millions: number): string {
  if (millions >= 10000) {
    const eok = Math.floor(millions / 100);
    return `${(eok / 100).toFixed(1)}조 원 (${millions.toLocaleString()}백만 원)`;
  }
  if (millions >= 100) {
    const eok = millions / 100;
    return `${eok % 1 === 0 ? eok.toFixed(0) : eok.toFixed(1)}억 원`;
  }
  return `${millions.toLocaleString()}백만 원`;
}

export function formatFullBudget(millions: number): string {
  if (millions >= 100) {
    const eok = Math.floor(millions / 100);
    const remainder = millions % 100;
    return remainder > 0 ? `${eok}억 ${remainder}백만 원` : `${eok}억 원`;
  }
  return `${millions.toLocaleString()}백만 원`;
}

export function getStatusBadge(status: ProjectStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'planning':
      return { label: '기획 중', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'in_progress':
      return { label: '진행 중', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'completed':
      return { label: '완료', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'on_hold':
      return { label: '보류', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { label: '미정', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getSecurityBadge(level: SecurityLevel): { label: string; bg: string; text: string; iconName: string } {
  switch (level) {
    case 'public':
      return { label: '전체 공개', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', iconName: 'Globe' };
    case 'internal':
      return { label: '내부 공개 (지자체망)', bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', iconName: 'Shield' };
    case 'confidential':
      return { label: '대외비 (비공개)', bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', iconName: 'Lock' };
  }
}

export function getCategoryBadgeColor(category: ProjectCategory): string {
  switch (category) {
    case '복지·보건':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    case '스마트·디지털':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case '교통·도시':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case '환경·에너지':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case '문화·관광':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case '경제·일자리':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case '안전·재난':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}
