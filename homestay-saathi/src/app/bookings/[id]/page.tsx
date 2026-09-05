"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../../../lib/db';
import { queueMutation } from '../../../lib/sync/syncEngine';
import { Booking, PaymentStatus, LedgerEntry } from '../../../lib/types';
import { translations } from '../../../lib/i18n/translations';
import { formatINR, formatDate, calculateNights } from '../../../lib/utils';
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Share2, 
  ReceiptText, 
  AlertCircle,
  FileText,
  User
} from 'lucide-react';
import { BookingsModalForm } from '../../../components/BookingsModalForm';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const syncMeta = useLiveQuery(() => db.syncMeta.get('singleton'), []);
  const currentLang = syncMeta?.preferredLanguage || 'en';
  const t = translations[currentLang];

  const booking = useLiveQuery(() => (id ? db.bookings.get(id) : undefined), [id]);
  const linkedLedger = useLiveQuery(
    () => (id ? db.ledgerEntries.where('sourceBookingId').equals(id).first() : undefined),
    [id]
  );

  const [isEditOpen, setIsEditOpen] = useState(false);

  // If ID is loaded but not in database, show clean Not Found state
  if (booking === null || (booking === undefined && typeof window !== 'undefined')) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] flex items-center justify-center shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-outfit text-[#153224]">
            Booking Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5B51] mt-1 max-w-sm mx-auto">
            The booking record you are looking for (ID: <code className="font-mono text-xs">{id}</code>) does not exist or was deleted.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 bg-[#153224] hover:bg-[#1E4633] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Bookings</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center p-6">
        <div className="text-xs sm:text-sm text-[#4A5B51] font-medium animate-pulse">
          Loading booking details...
        </div>
      </div>
    );
  }

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const isSettled = booking.paymentStatus === 'settled';

  const handleTogglePayment = async () => {
    const newStatus: PaymentStatus = isSettled ? 'pending' : 'settled';
    const nowISO = new Date().toISOString();

    await db.bookings.update(booking.id, {
      paymentStatus: newStatus,
      updatedAt: nowISO,
      syncStatus: 'pending',
    });

    await queueMutation({
      operationId: generateUUID(),
      entity: 'booking',
      entityId: booking.id,
      operation: 'update',
      payload: { id: booking.id, paymentStatus: newStatus },
    });

    if (newStatus === 'settled') {
      if (linkedLedger) {
        await db.ledgerEntries.update(linkedLedger.id, {
          status: 'settled',
          syncStatus: 'pending',
        });
      } else {
        const ledgerId = generateUUID();
        const newEntry: LedgerEntry = {
          id: ledgerId,
          type: 'income',
          amount: booking.amount,
          description: `Room stay payment: ${booking.guestName}`,
          status: 'settled',
          sourceBookingId: booking.id,
          createdAt: nowISO,
          syncStatus: 'pending',
        };
        await db.ledgerEntries.add(newEntry);
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the booking for ${booking.guestName}?`)) return;

    await db.bookings.delete(booking.id);
    await queueMutation({
      operationId: generateUUID(),
      entity: 'booking',
      entityId: booking.id,
      operation: 'delete',
      payload: { id: booking.id },
    });

    router.push('/bookings');
  };

  const handleShareWhatsApp = () => {
    const text = `Namaste ${booking.guestName}! Your stay at ${syncMeta?.homestayName || 'our homestay'} is confirmed for ${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)} (${nights} nights). Total Tariff: ₹${booking.amount}. We look forward to hosting you!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Back Nav & Actions */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4A5B51] hover:text-[#153224] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp Confirmation</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="p-2 rounded-xl bg-white border border-[#E8E4DB] text-[#4A5B51] hover:text-[#153224] hover:bg-[#F5EFE3] transition cursor-pointer"
            title="Edit Booking"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-xl bg-white border border-[#E8E4DB] text-[#4A5B51] hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
            title="Delete Booking"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-[#E8E4DB] p-6 sm:p-7 shadow-sm space-y-6">
        {/* Header with Name & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0ECE1]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#73877B] uppercase tracking-wider">
                Guest Stay Record
              </span>
              <span className="text-xs text-[#73877B]">·</span>
              <span className="text-xs font-mono text-[#73877B]">
                ID: {booking.id.slice(0, 8)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-outfit text-[#111C16]">
              {booking.guestName}
            </h1>
          </div>

          <button
            type="button"
            onClick={handleTogglePayment}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isSettled
                ? 'bg-[#EBF4EF] border-[#2A5D44] text-[#153224] hover:bg-[#DDF0E5]'
                : 'bg-[#FEF3C7] border-[#B45309] text-[#78350F] hover:bg-[#FDEBB3]'
            }`}
          >
            {isSettled ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            <span>{isSettled ? '✓ Paid & Settled' : '⏳ Payment Due (Click to Settle)'}</span>
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stay Dates */}
          <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E4DB] space-y-1">
            <span className="text-xs font-bold text-[#4A5B51] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#2A5D44]" />
              Check-in / Check-out
            </span>
            <div className="text-sm font-bold text-[#111C16]">
              {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
            </div>
            <div className="text-xs text-[#73877B]">
              Total Stay: {nights} {nights === 1 ? 'Night' : 'Nights'}
            </div>
          </div>

          {/* Guests & Phone */}
          <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E4DB] space-y-1">
            <span className="text-xs font-bold text-[#4A5B51] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#2A5D44]" />
              Guests & Contact
            </span>
            <div className="text-sm font-bold text-[#111C16]">
              {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
            </div>
            <div className="text-xs text-[#4A5B51]">
              {booking.guestPhone ? (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{booking.guestPhone}</span>
                </span>
              ) : (
                <span className="italic text-[#73877B]">No phone recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="p-5 rounded-2xl bg-[#F5EFE3] border border-[#DFC08F] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#4A5B51] uppercase tracking-wider">
              Total Booking Tariff
            </span>
            <span className="text-2xl font-bold font-outfit text-[#153224]">
              {formatINR(booking.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#4A5B51] pt-2 border-t border-[#DFC08F]/50">
            <span>Payment Status:</span>
            <span className="font-bold">
              {isSettled ? 'Paid in Full' : 'Pending Payment'}
            </span>
          </div>
        </div>

        {/* Special Notes */}
        {booking.notes && (
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#4A5B51] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#73877B]" />
              Special Notes / Guest Requests
            </span>
            <p className="text-sm text-[#111C16] bg-[#FBF9F4] p-3.5 rounded-xl border border-[#E8E4DB] leading-relaxed">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Linked Cash Ledger Card */}
        <div className="p-4 rounded-2xl bg-white border border-[#E8E4DB] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#153224] uppercase tracking-wider flex items-center gap-1.5">
              <ReceiptText className="w-4 h-4 text-[#2A5D44]" />
              Linked Cash Ledger
            </span>

            <Link
              href="/ledger"
              className="text-xs font-semibold text-[#2A5D44] hover:underline"
            >
              View Full Ledger →
            </Link>
          </div>

          {linkedLedger ? (
            <div className="text-xs text-[#4A5B51] flex items-center justify-between py-1">
              <span>{linkedLedger.description}</span>
              <span className="font-bold text-emerald-800">
                +{formatINR(linkedLedger.amount)} ({linkedLedger.status})
              </span>
            </div>
          ) : (
            <p className="text-xs text-[#73877B]">
              {isSettled
                ? 'No separate ledger record found.'
                : 'Payment is currently pending. Marking as settled will automatically record this income in your Cash Ledger.'}
            </p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <BookingsModalForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        bookingToEdit={booking}
        currentLang={currentLang}
      />
    </div>
  );
}
