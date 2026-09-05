"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { 
  CalendarPlus, 
  Languages, 
  Wallet, 
  CheckSquare, 
  FileText, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Sparkles, 
  UserPlus, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { formatINR, formatDate } from '../../lib/utils';
import { translations } from '../../lib/i18n/translations';
import { BookingsModalForm } from '../../components/BookingsModalForm';

export default function DashboardPage() {
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const currentLang = syncMeta?.preferredLanguage || 'en';
  const t = translations[currentLang];

  const todayStr = new Date().toISOString().split('T')[0];
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  const bookings = useLiveQuery(() => db.bookings.toArray(), []) || [];
  const ledgerEntries = useLiveQuery(() => db.ledgerEntries.toArray(), []) || [];
  const checklistItems = useLiveQuery(() => db.checklistItems.toArray(), []) || [];

  const checkingInToday = bookings.filter(b => b.checkIn === todayStr);
  const checkingOutToday = bookings.filter(b => b.checkOut === todayStr);
  const stayingToday = bookings.filter(b => b.checkIn < todayStr && b.checkOut > todayStr);

  const totalIncome = ledgerEntries
    .filter(e => e.type === 'income' && e.status === 'settled')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = ledgerEntries
    .filter(e => e.type === 'expense' && e.status === 'settled')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const pendingPayments = bookings
    .filter(b => b.paymentStatus === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const completedChecklist = checklistItems.filter(i => i.done).length;
  const totalChecklist = checklistItems.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#153224] to-[#0A1A12] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-[#214935] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-[#244f39] text-[#E4F2E9] border border-[#376e52] px-2.5 py-0.5 rounded-full font-semibold">
                {syncMeta?.location || 'Darjeeling Tea Garden'}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#A3CCB0] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Offline Ready</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-outfit text-white tracking-tight">
              {t.dashboard.welcome}, {syncMeta?.homestayName || (syncMeta?.hostName ? `${syncMeta.hostName}'s Homestay` : 'Homestay Host')}
            </h1>

            <p className="text-xs sm:text-sm text-[#CBE2D4] max-w-xl">
              {t.dashboard.savedOfflineNotice}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shrink-0 text-left md:text-right min-w-[160px]">
            <div className="text-[11px] uppercase tracking-wider text-[#A3CCB0] font-semibold">
              {t.dashboard.totalEarnings} (Net)
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-outfit text-white mt-0.5">
              {formatINR(netBalance)}
            </div>
            <div className="text-[11px] text-[#CBE2D4] mt-1">
              Cash balance in hand
            </div>
          </div>
        </div>
      </div>

      {/* Today's Activity / Clean Zero Dummy State */}
      <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <h2 className="font-bold text-base sm:text-lg text-[#153224] font-outfit flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#2A5D44]" />
            <span>{t.dashboard.todayTitle}</span>
          </h2>
          <span className="text-xs text-[#4A5B51] font-semibold bg-[#F5EFE3] px-2.5 py-1 rounded-lg">
            {formatDate(todayStr)}
          </span>
        </div>

        {bookings.length === 0 ? (
          /* Clean Zero Dummy Data State */
          <div className="py-8 px-4 text-center bg-[#FDFBF7] rounded-2xl border border-dashed border-[#DFC08F] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#EBF4EF] text-[#153224] border border-[#D5E5DC] flex items-center justify-center mx-auto shadow-2xs">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#111C16] font-outfit">
                {t.dashboard.noBookingsYetTitle}
              </h3>
              <p className="text-xs sm:text-sm text-[#4A5B51] mt-1 max-w-md mx-auto">
                {t.dashboard.noBookingsYetSub}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsNewBookingOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#153224] hover:bg-[#1E4633] text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4 text-amber-300" />
                <span>{t.dashboard.newBooking}</span>
              </button>

              <Link
                href="/listing"
                className="inline-flex items-center gap-1.5 bg-white hover:bg-[#F5EFE3] text-[#153224] border border-[#D5E5DC] text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#2A5D44]" />
                <span>{t.dashboard.listingAssistant}</span>
              </Link>
            </div>
          </div>
        ) : checkingInToday.length === 0 && checkingOutToday.length === 0 && stayingToday.length === 0 ? (
          <div className="text-xs sm:text-sm text-[#4A5B51] py-6 text-center bg-[#FDFBF7] rounded-xl border border-[#E8E4DB]">
            {t.dashboard.noCheckinsToday}
          </div>
        ) : (
          <div className="space-y-3">
            {checkingInToday.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#EBF4EF] border border-[#D5E5DC] hover:bg-[#DDF0E5] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#153224] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    IN
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111C16] group-hover:text-[#153224]">
                      {b.guestName}
                    </h4>
                    <p className="text-xs text-[#4A5B51]">
                      {b.guests} guests · {b.paymentStatus === 'pending' ? `₹${b.amount} Pending` : 'Settled'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#153224]">
                  <span>Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}

            {checkingOutToday.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] hover:bg-[#FDEBB3] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#B45309] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    OUT
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111C16] group-hover:text-[#B45309]">
                      {b.guestName}
                    </h4>
                    <p className="text-xs text-[#78350F]">
                      Departure today · {b.paymentStatus === 'pending' ? `₹${b.amount} Due` : 'Paid'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#B45309]">
                  <span>Settle Bill</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}

            {stayingToday.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E8E4DB] hover:bg-[#FDFBF7] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4A5B51] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    STAY
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#111C16]">
                      {b.guestName}
                    </h4>
                    <p className="text-xs text-[#4A5B51]">
                      Staying until {b.checkOut}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#4A5B51]">
                  <span>View</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {pendingPayments > 0 && (
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B45309] bg-[#FFFBEB] p-3 rounded-xl border border-[#FDE68A]">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Pending Room Payments:</span>
            </span>
            <span className="font-bold font-outfit text-sm">
              {formatINR(pendingPayments)}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-3">
          {t.dashboard.quickActions}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => setIsNewBookingOpen(true)}
            className="p-4 rounded-2xl bg-white border border-[#E8E4DB] hover:border-[#153224] hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EBF4EF] text-[#153224] flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#111C16] group-hover:text-[#153224]">
                {t.dashboard.newBooking}
              </div>
              <div className="text-[11px] text-[#73877B]">
                Offline CRUD
              </div>
            </div>
          </button>

          <Link
            href="/translate"
            className="p-4 rounded-2xl bg-white border border-[#E8E4DB] hover:border-[#153224] hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#111C16] group-hover:text-blue-800">
                {t.dashboard.translateMessage}
              </div>
              <div className="text-[11px] text-[#73877B]">
                4 Languages & Scenarios
              </div>
            </div>
          </Link>

          <Link
            href="/ledger"
            className="p-4 rounded-2xl bg-white border border-[#E8E4DB] hover:border-[#153224] hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#111C16] group-hover:text-amber-800">
                {t.dashboard.cashLedger}
              </div>
              <div className="text-[11px] text-[#73877B]">
                Income & Expenses
              </div>
            </div>
          </Link>

          <Link
            href="/checklist"
            className="p-4 rounded-2xl bg-white border border-[#E8E4DB] hover:border-[#153224] hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#111C16] group-hover:text-emerald-800">
                {t.dashboard.hostingChecklist}
              </div>
              <div className="text-[11px] text-[#73877B]">
                {completedChecklist}/{totalChecklist} done
              </div>
            </div>
          </Link>

          <Link
            href="/listing"
            className="p-4 rounded-2xl bg-white border border-[#E8E4DB] hover:border-[#153224] hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#111C16] group-hover:text-purple-800">
                {t.dashboard.listingAssistant}
              </div>
              <div className="text-[11px] text-[#73877B]">
                WhatsApp & OTA text
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* New Booking Modal */}
      <BookingsModalForm
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
}
