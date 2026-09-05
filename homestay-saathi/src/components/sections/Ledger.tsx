// Cash Ledger Section (Zero Dummy Data, Offline Income & Expense Tracker)
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, generateUUID } from '../../lib/db';
import { queueMutation } from '../../lib/sync/syncEngine';
import { LedgerEntry, SupportedLanguage } from '../../lib/types';
import { translations } from '../../lib/i18n/translations';
import { formatINR, formatDate } from '../../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock, 
  Plus, 
  Check, 
  Trash2, 
  X, 
  DollarSign, 
  Filter, 
  ReceiptText 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LedgerProps {
  currentLang: SupportedLanguage;
}

export const Ledger: React.FC<LedgerProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const entries = useLiveQuery(() => db.ledgerEntries.reverse().sortBy('createdAt'), []) || [];
  const bookings = useLiveQuery(() => db.bookings.toArray(), []) || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  
  // Modal Form State
  const [type, setType] = useState<'income' | 'expense' | 'adjustment'>('expense');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'settled' | 'pending'>('settled');
  const [sourceBookingId, setSourceBookingId] = useState<string>('');

  // Quick category suggestion chips for Darjeeling homestays
  const quickCategories = [
    { label: '🥦 Fresh Farm Veg & Eggs', desc: 'Fresh farm vegetables, eggs & chicken' },
    { label: '🪵 Firewood / LPG Gas', desc: 'Firewood & kitchen LPG cylinder' },
    { label: '☕ Darjeeling Tea & Bakery', desc: 'Local tea leaves, milk, bakery & snacks' },
    { label: '🧼 Linen & Cleaning', desc: 'Room soap, phenyl, laundry & linen' },
    { label: '🍛 Guest Meal Charges', desc: 'Guest dinner / lunch meal payment' },
    { label: '🚗 Taxi / Driver Commission', desc: 'Local taxi & sightseeing commission' },
    { label: '⚡ Maintenance & Repairs', desc: 'Geyser, solar lamp & homestay repairs' },
  ];

  const quickAmounts = [200, 500, 1000, 1800, 2500, 5000];

  // Calculated Summaries
  const totalIncome = entries
    .filter(e => e.type === 'income' && e.status === 'settled')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter(e => e.type === 'expense' && e.status === 'settled')
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const pendingReceivables = entries
    .filter(e => e.type === 'income' && e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingPayables = entries
    .filter(e => e.type === 'expense' && e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredEntries = entries.filter(entry => {
    if (filterType === 'income') return entry.type === 'income';
    if (filterType === 'expense') return entry.type === 'expense';
    if (filterType === 'pending') return entry.status === 'pending';
    return true;
  });

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setStatus('settled');
    setSourceBookingId('');
    setIsModalOpen(false);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !description.trim()) return;

    const newId = generateUUID();
    const newEntry: LedgerEntry = {
      id: newId,
      type,
      amount: Number(amount),
      description: description.trim(),
      status,
      sourceBookingId: sourceBookingId || undefined,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    await db.ledgerEntries.add(newEntry);
    await queueMutation({
      operationId: generateUUID(),
      entity: 'ledgerEntry',
      entityId: newId,
      operation: 'create',
      payload: newEntry as unknown as Record<string, unknown>,
    });

    if (type === 'income') {
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }

    resetForm();
  };

  const handleToggleStatus = async (entry: LedgerEntry) => {
    const updatedStatus = entry.status === 'settled' ? 'pending' : 'settled';
    await db.ledgerEntries.update(entry.id, {
      status: updatedStatus,
      syncStatus: 'pending',
    });

    await queueMutation({
      operationId: generateUUID(),
      entity: 'ledgerEntry',
      entityId: entry.id,
      operation: 'update',
      payload: { id: entry.id, status: updatedStatus },
    });
  };

  const handleDeleteEntry = async (entry: LedgerEntry) => {
    if (!window.confirm(t.bookings.confirmDelete || 'Delete this transaction record?')) return;
    await db.ledgerEntries.delete(entry.id);
    await queueMutation({
      operationId: generateUUID(),
      entity: 'ledgerEntry',
      entityId: entry.id,
      operation: 'delete',
      payload: { id: entry.id },
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Header & New Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3826] font-outfit flex items-center gap-2">
            <ReceiptText className="w-7 h-7 text-[#2E5339]" />
            {t.ledger.title}
          </h1>
          <p className="text-sm text-stone-600 mt-0.5">
            {currentLang === 'ne' ? 'नगद हिसाब-किताब र दैनिक खर्च ट्र्याकर' :
             currentLang === 'bn' ? 'নগদ আয়-ব্যয় এবং দৈনিক খরচের খাতা' :
             currentLang === 'hi' ? 'दैनिक नकद आय और खर्च का हिसाब' :
             'Offline cash register for room income & daily village expenses'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-[#2E5339] hover:bg-[#24422e] text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all active:scale-[0.98] min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>{t.ledger.addExpense}</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.ledger.income}
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-outfit">
            {formatINR(totalIncome)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            {entries.filter(e => e.type === 'income').length} {currentLang === 'ne' ? 'आम्दानी रेकर्ड' : 'received transactions'}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.ledger.expense}
            </span>
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-rose-700 font-outfit">
            {formatINR(totalExpense)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            {entries.filter(e => e.type === 'expense').length} {currentLang === 'ne' ? 'खर्च रेकर्ड' : 'paid expenses'}
          </p>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {t.ledger.balance}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#2E5339]/10 flex items-center justify-center text-[#2E5339]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-bold font-outfit ${netBalance >= 0 ? 'text-[#2E5339]' : 'text-rose-600'}`}>
            {formatINR(netBalance)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            {netBalance >= 0 ? 'Cash in hand / surplus' : 'Current deficit'}
          </p>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              {currentLang === 'ne' ? 'उठ्न बाँकी' : currentLang === 'bn' ? 'বকেয়া পাওনা' : currentLang === 'hi' ? 'बकाया राशि' : 'Pending Due'}
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-800 font-outfit">
            {formatINR(pendingReceivables)}
          </p>
          <p className="text-[11px] text-amber-600 mt-1">
            {entries.filter(e => e.status === 'pending').length} {currentLang === 'ne' ? 'पेन्डिङ कारोबार' : 'unsettled items'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-sm">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl font-medium transition-all min-h-[40px] whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-[#2E5339] text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {t.bookings.allBookings || 'All'} ({entries.length})
        </button>

        <button
          onClick={() => setFilterType('income')}
          className={`px-4 py-2 rounded-xl font-medium transition-all min-h-[40px] whitespace-nowrap ${
            filterType === 'income'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {t.ledger.income} ({entries.filter(e => e.type === 'income').length})
        </button>

        <button
          onClick={() => setFilterType('expense')}
          className={`px-4 py-2 rounded-xl font-medium transition-all min-h-[40px] whitespace-nowrap ${
            filterType === 'expense'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {t.ledger.expense} ({entries.filter(e => e.type === 'expense').length})
        </button>

        <button
          onClick={() => setFilterType('pending')}
          className={`px-4 py-2 rounded-xl font-medium transition-all min-h-[40px] whitespace-nowrap ${
            filterType === 'pending'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          {t.ledger.pendingStatus} ({entries.filter(e => e.status === 'pending').length})
        </button>
      </div>

      {/* Transaction List or Clean Zero-Dummy-Data Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#2E5339]/10 text-[#2E5339] flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-1">
            {t.ledger.noEntries}
          </h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
            {t.ledger.noEntriesSub}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#2E5339] hover:bg-[#24422e] text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all min-h-[48px]"
          >
            <Plus className="w-5 h-5" />
            <span>{t.ledger.addExpense}</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="divide-y divide-stone-100">
            {filteredEntries.map((entry) => {
              const isIncome = entry.type === 'income';
              const isSettled = entry.status === 'settled';

              return (
                <div
                  key={entry.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                        isIncome
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-stone-900 text-sm sm:text-base truncate">
                          {entry.description}
                        </h4>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            isSettled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isSettled ? t.ledger.settledStatus : t.ledger.pendingStatus}
                        </span>
                        {entry.sourceBookingId && (
                          <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                            {t.ledger.sourceBooking}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {formatDate(entry.createdAt.split('T')[0])}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-base sm:text-lg font-bold font-outfit ${
                          isIncome ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatINR(entry.amount)}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(entry)}
                        title={t.ledger.toggleSettled}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          isSettled
                            ? 'text-stone-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteEntry(entry)}
                        title={t.bookings.deleteBooking || 'Delete'}
                        className="w-9 h-9 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
              <h3 className="text-lg font-bold text-stone-900 font-outfit flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-[#2E5339]" />
                {t.ledger.addExpense}
              </h3>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2.5 px-3 rounded-xl font-medium text-sm border transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                      type === 'expense'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold shadow-sm'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>{t.ledger.expense} (Paid)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2.5 px-3 rounded-xl font-medium text-sm border transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                      type === 'income'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-sm'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>{t.ledger.income} (Received)</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  {t.ledger.expenseAmount} (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 850"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-lg font-bold font-outfit text-stone-900"
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto mt-2 pb-1 no-scrollbar">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors whitespace-nowrap"
                    >
                      +₹{q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description & Quick Categories */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  {t.ledger.expenseDescription} *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Farm fresh vegetables & milk for breakfast"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-900"
                />

                {/* Homestay Category Suggestions */}
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] text-stone-400 font-medium">Quick Homestay Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickCategories.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setDescription(cat.desc)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200/80 text-stone-700 hover:bg-[#2E5339]/10 hover:border-[#2E5339]/30 transition-colors"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('settled')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      status === 'settled'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    ✓ {t.ledger.settledStatus} (Paid in Cash / UPI)
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('pending')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      status === 'pending'
                        ? 'bg-amber-50 border-amber-500 text-amber-800'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    ⏳ {t.ledger.pendingStatus} (Pay Later / Udhar)
                  </button>
                </div>
              </div>

              {/* Optional Link to Booking */}
              {bookings.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                    Link with Guest Booking (Optional)
                  </label>
                  <select
                    value={sourceBookingId}
                    onChange={(e) => setSourceBookingId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#2E5339] text-stone-800 text-sm bg-white"
                  >
                    <option value="">-- No specific booking --</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.guestName} ({b.checkIn} to {b.checkOut}) - ₹{b.amount}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 px-4 rounded-xl border border-stone-200 font-medium text-stone-700 hover:bg-stone-50 min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#2E5339] hover:bg-[#24422e] text-white font-medium shadow-sm active:scale-[0.98] transition-all min-h-[48px]"
                >
                  {t.ledger.saveExpense}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
