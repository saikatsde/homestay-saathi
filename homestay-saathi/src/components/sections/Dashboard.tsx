// Dashboard Section (Zero Dummy Data, Live Dexie Queries)
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { 
  CalendarPlus, 
  Languages, 
  Wallet, 
  CheckSquare, 
  FileText, 
  Tag, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { formatINR, formatDate } from '../../lib/utils';
import { SupportedLanguage } from '../../lib/types';
import { translations } from '../../lib/i18n/translations';
import { NavTab } from '../Navigation';

interface DashboardProps {
  currentLang: SupportedLanguage;
  onNavigate: (tab: NavTab) => void;
  onOpenNewBookingModal: () => void;
  onOpenProfileSetup: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentLang,
  onNavigate,
  onOpenNewBookingModal,
  onOpenProfileSetup,
}) => {
  const t = translations[currentLang];
  const todayStr = new Date().toISOString().split('T')[0];

  const bookings = useLiveQuery(() => db.bookings.toArray(), []) || [];
  const ledgerEntries = useLiveQuery(() => db.ledgerEntries.toArray(), []) || [];
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const checklistItems = useLiveQuery(() => db.checklistItems.toArray(), []) || [];

  const checkingInToday = bookings.filter(b => b.checkIn === todayStr);
  const checkingOutToday = bookings.filter(b => b.checkOut === todayStr);
  const stayingToday = bookings.filter(b => b.checkIn < todayStr && b.checkOut > todayStr);

  const totalIncome = ledgerEntries
    .filter(e => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = ledgerEntries
    .filter(e => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const pendingPayments = bookings
    .filter(b => b.paymentStatus === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const completedChecklist = checklistItems.filter(i => i.done).length;
  const totalChecklist = checklistItems.length;

  return (
    <div className="space-y-5 pb-20 md:pb-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#24412D] to-[#0E1C13] text-white rounded-3xl p-6 shadow-card relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
          <span className="text-9xl">🌿</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-emerald-900/80 text-emerald-200 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium tracking-wide">
                {syncMeta?.location || t.dashboard.homestayLabel}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Offline Ready</span>
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#FDF6EC] font-sans">
              {t.dashboard.welcome}, {syncMeta?.homestayName || (syncMeta?.hostName ? `${syncMeta.hostName}'s Homestay` : t.dashboard.homestayLabel)}
            </h2>
            <p className="text-xs md:text-sm text-[#C7DBC9] mt-1 max-w-xl">
              {t.dashboard.savedOfflineNotice}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 shrink-0 text-right">
            <div className="text-[11px] uppercase tracking-wider text-[#C7DBC9]">
              {t.dashboard.totalEarnings}
            </div>
            <div className="text-2xl font-black text-[#FDF6EC] font-sans">
              {formatINR(netBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Activity / Clean Empty State */}
      <div className="card-saathi border-l-4 border-l-emerald-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base md:text-lg text-saathi-tea-950 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <span>{t.dashboard.todayTitle}</span>
          </h3>
          <span className="text-xs text-saathi-mist-700 font-medium">
            {formatDate(todayStr)}
          </span>
        </div>

        {bookings.length === 0 ? (
          /* Clean zero dummy data onboarding empty state */
          <div className="py-6 px-4 text-center bg-[#FFFCF8] rounded-2xl border border-dashed border-[#EDD3B0] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E5EDE6] text-[#2E5339] flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-saathi-tea-950">
                {t.dashboard.noBookingsYetTitle}
              </h4>
              <p className="text-xs text-saathi-mist-700 mt-0.5 max-w-md mx-auto">
                {t.dashboard.noBookingsYetSub}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenNewBookingModal}
                className="btn-primary text-xs py-2 px-3.5"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>{t.dashboard.newBooking}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('listing')}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.dashboard.listingAssistant}</span>
              </button>
            </div>
          </div>
        ) : checkingInToday.length === 0 && checkingOutToday.length === 0 && stayingToday.length === 0 ? (
          <div className="text-xs text-saathi-mist-700 py-4 text-center bg-[#FFFCF8] rounded-xl border border-saathi-warm-200/60">
            {t.dashboard.noCheckinsToday}
          </div>
        ) : (
          <div className="space-y-2.5">
            {checkingInToday.map((b) => (
              <div
                key={b.id}
                onClick={() => onNavigate('bookings')}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 cursor-pointer hover:bg-emerald-100/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    IN
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">{b.guestName}</h4>
                    <p className="text-xs text-emerald-800">
                      {b.guests} guests · {b.paymentStatus === 'pending' ? '₹' + b.amount + ' Pending' : 'Paid'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800">
                  <span>View</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}

            {checkingOutToday.map((b) => (
              <div
                key={b.id}
                onClick={() => onNavigate('bookings')}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200/80 cursor-pointer hover:bg-amber-100/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    OUT
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-amber-950">{b.guestName}</h4>
                    <p className="text-xs text-amber-800">
                      Check-out today · Total ₹{b.amount}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                  <span>View</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingPayments > 0 && (
          <div className="mt-3 pt-3 border-t border-[#F7E7D1] flex items-center justify-between text-xs">
            <span className="text-saathi-mist-700 font-medium">
              ⚠️ {t.dashboard.pendingPayment}:
            </span>
            <span className="font-bold text-amber-800 text-sm">
              {formatINR(pendingPayments)}
            </span>
          </div>
        )}
      </div>

      {/* 6 Quick Action Cards */}
      <div>
        <h3 className="font-bold text-sm uppercase tracking-wider text-saathi-mist-700 mb-3 px-1">
          {t.dashboard.quickActions}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onOpenNewBookingModal}
            className="card-saathi p-4 flex flex-col items-start justify-between text-left hover:border-emerald-500 hover:shadow-md active:scale-95 group transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-saathi-tea-950 block">
                {t.dashboard.newBooking}
              </span>
              <span className="text-[11px] text-saathi-mist-700">Offline CRUD</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('translate')}
            className="card-saathi p-4 flex flex-col items-start justify-between text-left hover:border-blue-500 hover:shadow-md active:scale-95 group transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-saathi-tea-950 block">
                {t.dashboard.translateMessage}
              </span>
              <span className="text-[11px] text-saathi-mist-700">4 Languages</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('ledger')}
            className="card-saathi p-4 flex flex-col items-start justify-between text-left hover:border-amber-500 hover:shadow-md active:scale-95 group transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-saathi-tea-950 block">
                {t.dashboard.cashLedger}
              </span>
              <span className="text-[11px] text-saathi-mist-700">Income & Expenses</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('checklist')}
            className="card-saathi p-4 flex flex-col items-start justify-between text-left hover:border-emerald-500 hover:shadow-md active:scale-95 group transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-saathi-tea-950 block">
                {t.dashboard.hostingChecklist}
              </span>
              <span className="text-[11px] text-saathi-mist-700">
                {completedChecklist}/{totalChecklist} done
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('listing')}
            className="card-saathi p-4 flex flex-col items-start justify-between text-left hover:border-purple-500 hover:shadow-md active:scale-95 group transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-saathi-tea-950 block">
                {t.dashboard.listingAssistant}
              </span>
              <span className="text-[11px] text-saathi-mist-700">AI / Template</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('listing')}
            className="card-saathi p-4 flex flex-col items-start justify-between text-left hover:border-teal-500 hover:shadow-md active:scale-95 group transition cursor-pointer"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-saathi-tea-950 block">
                {t.dashboard.pricingHelp}
              </span>
              <span className="text-[11px] text-saathi-mist-700">Hill Heuristic</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
