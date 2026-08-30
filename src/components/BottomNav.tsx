import React from 'react';
import { TabScreen } from '../types';
import {
  Home,
  Search,
  PlusCircle,
  Fuel,
  MessageSquare,
  Shield,
  History,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: TabScreen;
  unreadChatCount?: number;
  onNavigate: (tab: TabScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  unreadChatCount,
  onNavigate,
}) => {
  const tabs: {
    id: TabScreen;
    label: string;
    icon: React.ElementType;
    highlight?: boolean;
    badge?: number;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'request', label: 'Rides', icon: Search },
    { id: 'offer', label: 'Offer', icon: PlusCircle, highlight: true },
    { id: 'fuel', label: 'Fuel', icon: Fuel },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadChatCount },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <nav className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-2 shadow-lg">
      <div className="flex items-center justify-around overflow-x-auto no-scrollbar gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl min-w-[48px] transition-all relative select-none active:scale-90 ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                  tab.highlight && !isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                    : isActive
                    ? 'bg-indigo-600 text-white shadow-xs scale-105'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span className="text-[9px] tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>

              {/* Badge */}
              {tab.badge !== undefined && (
                <span className="absolute top-0.5 right-1 min-w-[15px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center shadow-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
