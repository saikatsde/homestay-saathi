// Bookings Section (Zero Dummy Data, Offline CRUD & Ledger Linking)
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../../lib/db';
import { queueMutation } from '../../lib/sync/syncEngine';
import { Booking, SupportedLanguage, PaymentStatus, LedgerEntry } from '../../lib/types';
import { translations } from '../../lib/i18n/translations';
import { formatINR, formatDate, calculateNights } from '../../lib/utils';
import { 
  CalendarPlus, 
  Calendar, 
  Phone, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  CalendarRange 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingsProps {
  currentLang: SupportedLanguage;
  isNewModalOpen: boolean;
  onCloseNewModal: () => void;
  onOpenNewModal: () => void;
}

export const Bookings: React.FC<BookingsProps> = ({
  currentLang,
  isNewModalOpen,
  onCloseNewModal,
  onOpenNewModal,
}) => {
  const t = translations[currentLang];
  const bookings = useLiveQuery(() => db.bookings.toArray(), []) || [];
  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const todayStr = new Date().toISOString().split('T')[0];

  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(2);
  const [amount, setAmount] = useState(() => syncMeta?.defaultPrice || 1800);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
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
    setEditingBooking(null);
  };

  const handleOpenEdit = (b: Booking) => {
    setEditingBooking(b);
    setGuestName(b.guestName);
    setGuestPhone(b.guestPhone || '');
    setCheckIn(b.checkIn);
    setCheckOut(b.checkOut);
    setGuests(b.guests);
    setAmount(b.amount);
    setPaymentStatus(b.paymentStatus);
    setNotes(b.notes || '');
    onOpenNewModal();
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const nowISO = new Date().toISOString();

    if (editingBooking) {
      const updated: Booking = {
        ...editingBooking,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim() || undefined,
        checkIn,
        checkOut,
        guests: Number(guests),
        amount: Number(amount),
        paymentStatus,
        notes: notes.trim() || undefined,
        updatedAt: nowISO,
        syncStatus: 'pending',
      };

      await db.bookings.put(updated);
      await queueMutation('booking', updated.id, 'update', updated as any);

      const linkedLedger = await db.ledgerEntries.where('sourceBookingId').equals(updated.id).first();
      if (linkedLedger) {
        const updatedLedger: LedgerEntry = {
          ...linkedLedger,
          amount: Number(amount),
          status: paymentStatus === 'settled' ? 'settled' : 'pending',
          description: `Booking: ${updated.guestName} (${calculateNights(checkIn, checkOut)} Nights)`,
          syncStatus: 'pending',
        };
        await db.ledgerEntries.put(updatedLedger);
        await queueMutation('ledgerEntry', updatedLedger.id, 'update', updatedLedger as any);
      }
    } else {
      const bookingId = generateUUID();
      const newBooking: Booking = {
        id: bookingId,
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

      await db.bookings.put(newBooking);
      await queueMutation('booking', bookingId, 'create', newBooking as any);

      // Create linked Cash Ledger Income Entry
      const ledgerId = generateUUID();
      const newLedgerEntry: LedgerEntry = {
        id: ledgerId,
        type: 'income',
        sourceBookingId: bookingId,
        amount: Number(amount),
        description: `Booking: ${newBooking.guestName} (${calculateNights(checkIn, checkOut)} Nights)`,
        status: paymentStatus === 'settled' ? 'settled' : 'pending',
        createdAt: nowISO,
        syncStatus: 'pending',
      };

      await db.ledgerEntries.put(newLedgerEntry);
      await queueMutation('ledgerEntry', ledgerId, 'create', newLedgerEntry as any);

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    resetForm();
    onCloseNewModal();
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm(t.bookings.confirmDelete)) {
      await db.bookings.delete(id);
      await queueMutation('booking', id, 'delete', { id });
      
      const linkedLedger = await db.ledgerEntries.where('sourceBookingId').equals(id).first();
      if (linkedLedger) {
        await db.ledgerEntries.delete(linkedLedger.id);
        await queueMutation('ledgerEntry', linkedLedger.id, 'delete', { id: linkedLedger.id });
      }
    }
  };

  const handleToggleSettled = async (b: Booking) => {
    const nextStatus: PaymentStatus = b.paymentStatus === 'settled' ? 'pending' : 'settled';
    const nowISO = new Date().toISOString();

    const updated: Booking = {
      ...b,
      paymentStatus: nextStatus,
      updatedAt: nowISO,
      syncStatus: 'pending',
    };

    await db.bookings.put(updated);
    await queueMutation('booking', b.id, 'update', updated as any);

    const linkedLedger = await db.ledgerEntries.where('sourceBookingId').equals(b.id).first();
    if (linkedLedger) {
      const updatedLedger: LedgerEntry = {
        ...linkedLedger,
        status: nextStatus === 'settled' ? 'settled' : 'pending',
        syncStatus: 'pending',
      };
      await db.ledgerEntries.put(updatedLedger);
      await queueMutation('ledgerEntry', linkedLedger.id, 'update', updatedLedger as any);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'upcoming') return b.checkOut >= todayStr;
    if (activeFilter === 'past') return b.checkOut < todayStr;
    return true;
  }).sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());

  return (
    <div className="space-y-5 pb-20 md:pb-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-saathi-tea-950 font-sans">
            {t.bookings.title}
          </h2>
          <p className="text-xs text-saathi-mist-700">
            {bookings.length} total bookings recorded locally on this phone
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            onOpenNewModal();
          }}
          className="btn-primary cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" />
          <span>{t.bookings.newBooking}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white rounded-xl p-1 border border-saathi-warm-200/80 w-full sm:w-auto shadow-sm">
        {(['all', 'upcoming', 'past'] as const).map((filter) => (
          <button
            type="button"
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              activeFilter === filter
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-saathi-mist-700 hover:text-emerald-900'
            }`}
          >
            {filter === 'all'
              ? t.bookings.allBookings
              : filter === 'upcoming'
              ? t.bookings.upcoming
              : t.bookings.completed}
          </button>
        ))}
      </div>

      {/* Booking List & Clean Empty State */}
      {filteredBookings.length === 0 ? (
        <div className="card-saathi text-center py-14 text-saathi-mist-700 space-y-3">
          <CalendarRange className="w-12 h-12 text-[#A1C3A5] mx-auto" />
          <div>
            <h4 className="font-bold text-sm text-saathi-tea-950">
              {t.bookings.noBookings}
            </h4>
            <p className="text-xs text-saathi-mist-700 mt-1">
              {t.bookings.noBookingsSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              onOpenNewModal();
            }}
            className="btn-primary text-xs py-2 px-4 cursor-pointer"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>{t.bookings.newBooking}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const nights = calculateNights(b.checkIn, b.checkOut);
            const isSettled = b.paymentStatus === 'settled';

            return (
              <div
                key={b.id}
                className="card-saathi relative flex flex-col justify-between hover:border-emerald-500 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-base text-saathi-tea-950 flex items-center gap-2">
                        <span>{b.guestName}</span>
                        {b.syncStatus === 'pending' && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                            Offline Draft
                          </span>
                        )}
                      </h3>
                      {b.guestPhone && (
                        <p className="text-xs text-saathi-mist-700 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-700" />
                          <span>{b.guestPhone}</span>
                        </p>
                      )}
                    </div>

                    <span
                      className={`badge-pill ${
                        isSettled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {isSettled ? `✅ ${t.bookings.settled}` : `⏳ ${t.bookings.pending}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-[#FFFCF8] p-2.5 rounded-xl border border-saathi-warm-200/60 my-3 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Dates:</span>
                      <span className="font-semibold text-saathi-tea-900">
                        {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                      </span>
                      <span className="text-gray-500 block text-[10px] mt-0.5">
                        ({nights} {t.bookings.nights})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Guests & Amount:</span>
                      <span className="font-semibold text-saathi-tea-900 block">
                        {b.guests} Guests
                      </span>
                      <span className="font-black text-emerald-900 text-sm">
                        {formatINR(b.amount)}
                      </span>
                    </div>
                  </div>

                  {b.notes && (
                    <p className="text-xs text-saathi-mist-700 italic bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 mb-3">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F7E7D1] gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSettled(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      isSettled
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-emerald-800 text-white hover:bg-emerald-900'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSettled ? 'Mark Pending' : t.bookings.markSettled}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      title={t.bookings.editBooking}
                      className="p-2 rounded-lg text-saathi-mist-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBooking(b.id)}
                      title={t.bookings.deleteBooking}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New / Edit Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-elevated border border-saathi-warm-200 relative max-h-[95vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onCloseNewModal();
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-saathi-tea-950 mb-1">
              {editingBooking ? t.bookings.editBooking : t.bookings.newBooking}
            </h3>
            <p className="text-xs text-saathi-mist-700 mb-4">
              {t.bookings.savedOfflineConfirm}
            </p>

            <form onSubmit={handleSaveBooking} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-saathi-tea-950 block mb-1">
                  {t.bookings.guestName} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Karmakar"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-saathi-warm-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-saathi-tea-950 block mb-0.5">
                  {t.bookings.guestPhone}
                </label>
                <span className="text-[11px] text-gray-500 block mb-1">
                  {t.bookings.guestPhoneOptional}
                </span>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-saathi-warm-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-saathi-tea-950 block mb-1">
                    {t.bookings.checkIn} *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-saathi-warm-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-saathi-tea-950 block mb-1">
                    {t.bookings.checkOut} *
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-saathi-warm-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-saathi-tea-950 block mb-1">
                    {t.bookings.guests}
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-10 h-10 rounded-l-xl bg-saathi-warm-200 font-bold text-base hover:bg-saathi-warm-300 transition cursor-pointer"
                    >
                      –
                    </button>
                    <div className="w-12 h-10 border-y border-saathi-warm-300 flex items-center justify-center font-bold text-sm">
                      {guests}
                    </div>
                    <button
                      type="button"
                      onClick={() => setGuests(guests + 1)}
                      className="w-10 h-10 rounded-r-xl bg-saathi-warm-200 font-bold text-base hover:bg-saathi-warm-300 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-saathi-tea-950 block mb-1">
                    {t.bookings.amount} *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-saathi-warm-300 text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-saathi-tea-950 block mb-1">
                  {t.bookings.paymentStatus}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pending', 'partial', 'settled'] as const).map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setPaymentStatus(status)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold capitalize border transition cursor-pointer ${
                        paymentStatus === status
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                          : 'bg-[#FFFCF8] text-saathi-mist-700 border-saathi-warm-300 hover:bg-saathi-warm-100'
                      }`}
                    >
                      {status === 'pending'
                        ? t.bookings.pending
                        : status === 'partial'
                        ? t.bookings.partial
                        : t.bookings.settled}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-saathi-tea-950 block mb-1">
                  {t.bookings.notes}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.bookings.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-saathi-warm-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-sm font-bold shadow-md cursor-pointer"
                >
                  {t.bookings.saveBooking}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
