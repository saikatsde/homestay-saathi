"use client";

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../lib/db';
import { queueMutation } from '../lib/sync/syncEngine';
import { Booking, SupportedLanguage, PaymentStatus, LedgerEntry } from '../lib/types';
import { translations } from '../lib/i18n/translations';
import { CalendarPlus, X, Check, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingsModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  bookingToEdit?: Booking | null;
  currentLang: SupportedLanguage;
  onSaved?: (bookingId: string) => void;
}

export const BookingsModalForm: React.FC<BookingsModalFormProps> = ({
  isOpen,
  onClose,
  bookingToEdit,
  currentLang,
  onSaved,
}) => {
  const t = translations[currentLang];
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const todayStr = new Date().toISOString().split('T')[0];

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(2);
  const [amount, setAmount] = useState(1800);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (bookingToEdit) {
      setGuestName(bookingToEdit.guestName);
      setGuestPhone(bookingToEdit.guestPhone || '');
      setCheckIn(bookingToEdit.checkIn);
      setCheckOut(bookingToEdit.checkOut);
      setGuests(bookingToEdit.guests);
      setAmount(bookingToEdit.amount);
      setPaymentStatus(bookingToEdit.paymentStatus);
      setNotes(bookingToEdit.notes || '');
    } else {
      setGuestName('');
      setGuestPhone('');
      setCheckIn(todayStr);
      const d = new Date();
      d.setDate(d.getDate() + 2);
      setCheckOut(d.toISOString().split('T')[0]);
      setGuests(2);
      setAmount(syncMeta?.defaultPrice || 1800);
      setPaymentStatus('pending');
      setNotes('');
    }
  }, [bookingToEdit, isOpen, syncMeta, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const nowISO = new Date().toISOString();

    if (bookingToEdit) {
      const updated: Booking = {
        ...bookingToEdit,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim() || undefined,
        checkIn,
        checkOut,
        guests: Number(guests),
        amount: Number(amount),
        paymentStatus,
        notes: notes.trim() || undefined,
        updatedAt: nowISO,
      };

      await db.bookings.put(updated);
      await queueMutation({
        operationId: generateUUID(),
        entity: 'booking',
        entityId: updated.id,
        operation: 'update',
        payload: updated as unknown as Record<string, unknown>,
      });

      // Update linked ledger entry if payment is settled
      if (paymentStatus === 'settled') {
        const existingLedger = await db.ledgerEntries.where('sourceBookingId').equals(updated.id).first();
        if (existingLedger) {
          await db.ledgerEntries.update(existingLedger.id, {
            amount: Number(amount),
            status: 'settled',
            syncStatus: 'pending',
          });
        } else {
          const ledgerId = generateUUID();
          const newLedger: LedgerEntry = {
            id: ledgerId,
            type: 'income',
            amount: Number(amount),
            description: `Room stay payment: ${guestName.trim()}`,
            status: 'settled',
            sourceBookingId: updated.id,
            createdAt: nowISO,
            syncStatus: 'pending',
          };
          await db.ledgerEntries.add(newLedger);
        }
      }

      onSaved?.(updated.id);
    } else {
      const newId = generateUUID();
      const newBooking: Booking = {
        id: newId,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim() || undefined,
        checkIn,
        checkOut,
        guests: Number(guests),
        amount: Number(amount),
        paymentStatus,
        notes: notes.trim() || undefined,
        createdAt: nowISO,
        updatedAt: nowISO,
        syncStatus: 'pending',
      };

      await db.bookings.add(newBooking);
      await queueMutation({
        operationId: generateUUID(),
        entity: 'booking',
        entityId: newId,
        operation: 'create',
        payload: newBooking as unknown as Record<string, unknown>,
      });

      // Auto-create ledger entry if paid
      if (paymentStatus === 'settled') {
        const ledgerId = generateUUID();
        const newLedger: LedgerEntry = {
          id: ledgerId,
          type: 'income',
          amount: Number(amount),
          description: `Room stay payment: ${guestName.trim()}`,
          status: 'settled',
          sourceBookingId: newId,
          createdAt: nowISO,
          syncStatus: 'pending',
        };
        await db.ledgerEntries.add(newLedger);
      }

      try {
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      } catch {}

      onSaved?.(newId);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E4DB] relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#73877B] hover:text-[#111C16] hover:bg-[#F5EFE3] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#F0ECE1]">
          <div className="w-10 h-10 rounded-xl bg-[#EBF4EF] text-[#153224] flex items-center justify-center font-bold">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#153224] font-outfit">
              {bookingToEdit ? t.bookings.editBooking : t.bookings.newBooking}
            </h3>
            <p className="text-xs text-[#4A5B51]">
              Saved securely on phone · Works 100% offline
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest Name (Clean Placeholder without person names) */}
          <div>
            <label className="block text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-1">
              {t.bookings.guestName} *
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Guest Name / Travel Group"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5DC] focus:outline-none focus:ring-2 focus:ring-[#153224] text-[#111C16] text-sm font-medium"
            />
          </div>

          {/* Guest Phone (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-1">
              {t.bookings.guestPhoneOptional}
            </label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5E5DC] focus:outline-none focus:ring-2 focus:ring-[#153224] text-[#111C16] text-sm"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-1">
                {t.bookings.checkIn} *
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5E5DC] focus:outline-none focus:ring-2 focus:ring-[#153224] text-[#111C16] text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-1">
                {t.bookings.checkOut} *
              </label>
              <input
                type="date"
                required
                min={checkIn}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D5E5DC] focus:outline-none focus:ring-2 focus:ring-[#153224] text-[#111C16] text-sm font-medium"
              />
            </div>
          </div>

          {/* Guests & Total Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-1">
                {t.bookings.guests}
              </label>
              <input
                type="number"
                min="1"
                max="25"
                required
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#D5E5DC] focus:outline-none focus:ring-2 focus:ring-[#153224] text-[#111C16] text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-1">
                {t.bookings.amount} (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#D5E5DC] focus:outline-none focus:ring-2 focus:ring-[#153224] text-[#111C16] text-sm font-bold font-outfit"
              />
            </div>
          </div>

          {/* Payment Status Toggle */}
          <div>
            <label className="block text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-2">
              {t.bookings.paymentStatus}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('settled')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  paymentStatus === 'settled'
                    ? 'bg-[#EBF4EF] border-[#2A5D44] text-[#153224] shadow-xs'
                    : 'border-[#D5E5DC] text-[#4A5B51] hover:bg-[#F5EFE3]'
                }`}
              >
                ✓ {t.bookings.settled} (Paid)
              </button>

              <button
                type="button"
                onClick={() => setPaymentStatus('pending')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  paymentStatus === 'pending'
                    ? 'bg-[#FEF3C7] border-[#B45309] text-[#78350F] shadow-xs'
                    : 'border-[#D5E5DC] text-[#4A5B51] hover:bg-[#F5EFE3]'
                }`}
              >
                ⏳ {t.bookings.pending} (Due)
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#4A5B51] uppercase tracking-wider mb-1">
              {t.bookings.notes}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vegetarian meals requested, arriving by shared jeep"
              className="w-full px-3 py-2 rounded-xl border border-[#D5E5DC] focus:outline-none focus:ring-2 focus:ring-[#153224] text-[#111C16] text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#F0ECE1]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#D5E5DC] text-xs font-semibold text-[#4A5B51] hover:bg-[#F5EFE3] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#153224] hover:bg-[#1E4633] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              {bookingToEdit ? t.bookings.editBooking : t.bookings.saveBooking}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
