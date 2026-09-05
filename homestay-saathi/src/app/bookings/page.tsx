"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../../lib/db';
import { queueMutation } from '../../lib/sync/syncEngine';
import { Booking, PaymentStatus, LedgerEntry } from '../../lib/types';
import { translations } from '../../lib/i18n/translations';
import { formatINR, formatDate, calculateNights } from '../../lib/utils';
import { 
  CalendarPlus, 
  Calendar, 
  CalendarDays, 
  Phone, 
  Trash2, 
  Edit3, 
  Check, 
  ChevronRight, 
  UserPlus, 
  Search 
} from 'lucide-react';
import { BookingsModalForm } from '../../components/BookingsModalForm';

export default function BookingsPage() {
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const currentLang = syncMeta?.preferredLanguage || 'en';
  const t = translations[currentLang];

  const bookings = useLiveQuery(() => db.bookings.toArray(), []) || [];
  const todayStr = new Date().toISOString().split('T')[0];

  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Filter bookings
  const filteredBookings = bookings
    .filter((b) => {
      if (activeFilter === 'upcoming') return b.checkOut >= todayStr;
      if (activeFilter === 'past') return b.checkOut < todayStr;
      return true;
    })
    .filter((b) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.guestName.toLowerCase().includes(q) ||
        (b.guestPhone && b.guestPhone.includes(q)) ||
        (b.notes && b.notes.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  const handleOpenNew = () => {
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, b: Booking) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBooking(b);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, b: Booking) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete booking for ${b.guestName}?`)) return;

    await db.bookings.delete(b.id);
    await queueMutation({
      operationId: generateUUID(),
      entity: 'booking',
      entityId: b.id,
      operation: 'delete',
      payload: { id: b.id },
    });
  };

  const handleQuickTogglePayment = async (e: React.MouseEvent, b: Booking) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus: PaymentStatus = b.paymentStatus === 'settled' ? 'pending' : 'settled';
    const nowISO = new Date().toISOString();

    await db.bookings.update(b.id, {
      paymentStatus: newStatus,
      updatedAt: nowISO,
      syncStatus: 'pending',
    });

    await queueMutation({
      operationId: generateUUID(),
      entity: 'booking',
      entityId: b.id,
      operation: 'update',
      payload: { id: b.id, paymentStatus: newStatus },
    });

    // Auto-update linked ledger entry
    if (newStatus === 'settled') {
      const existingLedger = await db.ledgerEntries.where('sourceBookingId').equals(b.id).first();
      if (existingLedger) {
        await db.ledgerEntries.update(existingLedger.id, {
          status: 'settled',
          syncStatus: 'pending',
        });
      } else {
        const ledgerId = generateUUID();
        const newLedger: LedgerEntry = {
          id: ledgerId,
          type: 'income',
          amount: b.amount,
          description: `Room stay payment: ${b.guestName}`,
          status: 'settled',
          sourceBookingId: b.id,
          createdAt: nowISO,
          syncStatus: 'pending',
        };
        await db.ledgerEntries.add(newLedger);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#153224] font-outfit flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-[#2A5D44]" />
            <span>{t.bookings.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5B51] mt-0.5">
            Offline booking records & cash status
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 bg-[#153224] hover:bg-[#1E4633] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4 text-amber-300" />
          <span>{t.bookings.newBooking}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#73877B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E8E4DB] text-xs sm:text-sm text-[#111C16] focus:outline-none focus:ring-2 focus:ring-[#153224]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#EBF4EF] p-1 rounded-xl border border-[#D5E5DC]">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#153224] text-white shadow-xs'
                : 'text-[#2A5D44] hover:text-[#153224]'
            }`}
          >
            {t.bookings.allBookings} ({bookings.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'upcoming'
                ? 'bg-[#153224] text-white shadow-xs'
                : 'text-[#2A5D44] hover:text-[#153224]'
            }`}
          >
            {t.bookings.upcoming} ({bookings.filter(b => b.checkOut >= todayStr).length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('past')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'past'
                ? 'bg-[#153224] text-white shadow-xs'
                : 'text-[#2A5D44] hover:text-[#153224]'
            }`}
          >
            {t.bookings.completed} ({bookings.filter(b => b.checkOut < todayStr).length})
          </button>
        </div>
      </div>

      {/* Bookings List or Clean Zero Dummy State */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8E4DB] p-8 sm:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF4EF] text-[#153224] border border-[#D5E5DC] flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#111C16] font-outfit mb-1">
            {t.bookings.noBookings}
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5B51] max-w-md mx-auto mb-6">
            {t.bookings.noBookingsSub}
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 bg-[#153224] hover:bg-[#1E4633] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-amber-300" />
            <span>{t.bookings.newBooking}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((b) => {
            const nights = calculateNights(b.checkIn, b.checkOut);
            const isSettled = b.paymentStatus === 'settled';

            return (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="block bg-white rounded-2xl border border-[#E8E4DB] p-4 sm:p-5 hover:border-[#153224] hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#111C16] font-outfit group-hover:text-[#153224]">
                        {b.guestName}
                      </h3>

                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isSettled
                            ? 'bg-[#EBF4EF] text-[#153224] border-[#2A5D44]'
                            : 'bg-[#FEF3C7] text-[#78350F] border-[#B45309]'
                        }`}
                      >
                        {isSettled ? `✓ ${t.bookings.settled}` : `⏳ ${t.bookings.pending}`}
                      </span>

                      <span className="text-[11px] text-[#73877B] bg-[#F5EFE3] px-2 py-0.5 rounded-md font-medium">
                        {b.guests} {b.guests === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#4A5B51] flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#2A5D44]" />
                        <span>
                          {formatDate(b.checkIn)} → {formatDate(b.checkOut)} ({nights} {t.bookings.nights})
                        </span>
                      </span>

                      {b.guestPhone && (
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#73877B]" />
                          <span>{b.guestPhone}</span>
                        </span>
                      )}
                    </div>

                    {b.notes && (
                      <p className="text-xs text-[#73877B] italic line-clamp-1">
                        &ldquo;{b.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Right Actions & Amount */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F0ECE1]">
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-bold text-[#153224] font-outfit">
                        {formatINR(b.amount)}
                      </div>
                      <div className="text-[10px] text-[#73877B] uppercase font-semibold">
                        Total Tariff
                      </div>
                    </div>

                    {/* Quick Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleQuickTogglePayment(e, b)}
                        title={isSettled ? 'Mark as Pending' : 'Mark as Settled'}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          isSettled
                            ? 'bg-[#EBF4EF] border-[#2A5D44] text-[#153224]'
                            : 'bg-white border-[#E8E4DB] text-[#73877B] hover:text-[#153224] hover:bg-[#EBF4EF]'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(e, b)}
                        title="Edit Booking"
                        className="p-2 rounded-xl bg-white border border-[#E8E4DB] text-[#4A5B51] hover:text-[#153224] hover:bg-[#F5EFE3] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, b)}
                        title="Delete Booking"
                        className="p-2 rounded-xl bg-white border border-[#E8E4DB] text-[#4A5B51] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="p-2 text-[#73877B] group-hover:text-[#153224] group-hover:translate-x-0.5 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      <BookingsModalForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingToEdit={editingBooking}
        currentLang={currentLang}
      />
    </div>
  );
}
