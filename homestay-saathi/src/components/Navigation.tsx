"use client";

// Responsive Navigation using Next.js Links & Route matching
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  FileText,
  Languages,
  CheckSquare,
  Settings as SettingsIcon
} from 'lucide-react';
import { SupportedLanguage } from '../lib/types';
import { translations } from '../lib/i18n/translations';

export type NavTab = 'dashboard' | 'bookings' | 'ledger' | 'listing' | 'translate' | 'checklist' | 'settings';

interface NavigationProps {
  currentLang: SupportedLanguage;
}

export const Navigation: React.FC<NavigationProps> = ({ currentLang }) => {
  const pathname = usePathname();
  const t = translations[currentLang];

  const tabs = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: '/bookings', label: t.nav.bookings, icon: CalendarDays, matchPrefix: true },
    { href: '/ledger', label: t.nav.ledger, icon: Wallet },
    { href: '/listing', label: t.nav.listing, icon: FileText },
    { href: '/translate', label: t.nav.translate, icon: Languages },
    { href: '/checklist', label: t.nav.checklist, icon: CheckSquare },
  ];

  const isTabActive = (tab: typeof tabs[0]) => {
    if (tab.exact) {
      return pathname === tab.href || pathname === '/';
    }
    if (tab.matchPrefix) {
      return pathname.startsWith(tab.href);
    }
    return pathname === tab.href;
  };

  return (
    <>
      {/* Desktop Top Sub-Nav */}
      <nav className="hidden md:block bg-[#1a3d2c] border-b border-[#27573e] text-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = isTabActive(tab);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-3 transition-all cursor-pointer ${isActive
                    ? 'border-[#F59E0B] text-white bg-[#244f39] shadow-inner'
                    : 'border-transparent text-[#D1E7D8] hover:text-white hover:bg-[#204733]'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F59E0B]' : 'text-[#A3CCB0]'}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Fixed Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#153224] border-t border-[#27573e] px-2 py-1.5 shadow-2xl flex items-center justify-around">
        {tabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = isTabActive(tab);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${isActive
                ? 'text-[#F59E0B] font-bold bg-[#244f39]/80'
                : 'text-[#CBE2D4] hover:text-white'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#F59E0B]' : 'text-[#A3CCB0]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {tab.label}
              </span>
            </Link>
          );
        })}
        <Link
          href="/checklist"
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all cursor-pointer min-w-[56px] ${pathname === '/checklist'
            ? 'text-[#F59E0B] font-bold bg-[#244f39]/80'
            : 'text-[#CBE2D4] hover:text-white'
            }`}
        >
          <CheckSquare className={`w-5 h-5 ${pathname === '/checklist' ? 'text-[#F59E0B]' : 'text-[#A3CCB0]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t.nav.checklist}
          </span>
        </Link>
      </nav>
    </>
  );
};
