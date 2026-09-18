import React from 'react';
import { X, Bell, Bookmark, ExternalLink, Check, Trash2, ArrowRight } from 'lucide-react';
import { NotificationItem, Project } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectProjectById: (projectId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectProjectById,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">구독 사업 알림함</h3>
              <span className="text-[11px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
                {notifications.filter((n) => !n.read).length}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
              >
                모두 읽음
              </button>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                새로운 사업 알림이 없습니다.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProjectById(item.projectId);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                    item.read
                      ? 'bg-white border-slate-200 hover:border-slate-300 opacity-75'
                      : 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-blue-700">{item.title}</span>
                    <span>{item.time}</span>
                  </div>
                  <p className="text-slate-800 text-xs font-medium leading-snug">{item.message}</p>
                  <div className="pt-1 flex items-center text-[10px] text-blue-600 font-semibold">
                    <span>사업 상세보기</span>
                    <ArrowRight className="w-3 h-3 ml-0.5" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
