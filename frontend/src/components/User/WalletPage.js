import React, { useState, useEffect } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  Wallet,
  CreditCard,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../Services/api';

// Static payment methods for Methods tab
const PAYMENT_METHODS = [
  {
    id: 'CARD',
    label: 'Card (Stripe)',
    description: 'Pay using Visa, Mastercard and other supported cards via Stripe.',
    badge: 'Recommended',
    color: 'from-slate-900 to-slate-700',
  },
  {
    id: 'ESEWA',
    label: 'eSewa',
    description: 'Instant wallet payments via eSewa for users in Nepal.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'KHALTI',
    label: 'Khalti',
    description: 'Pay using Khalti wallet with QR and one-tap flows.',
    color: 'from-violet-500 to-indigo-600',
  },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [selectedMethod, setSelectedMethod] = useState('esewa');
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);
  const navigate = useNavigate();

  const balance = 1250;
  const thisMonthSpend = 3245.75;
  const cashback = 162.29;
  const quickTopups = [500, 100, 200, 5000];

  useEffect(() => {
    (async () => {
      try {
        const data = await paymentService.listMyPayments();
       console.log('listMyPayments data =', data);
        // [{id, type, title, datetime, amount, paymentMethod?}, ...]
        setTransactions(data);
      } catch (e) {
        console.error('Failed to load transactions', e);
      } finally {
        setLoadingTx(false);
      }
    })();
  }, []);

  if (loadingTx) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-gray-500">Loading wallet…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar with back button */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
            <span className="font-semibold text-slate-900">BijuliYatra</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => navigate('/ev-owner/dashboard')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              ← Back to dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Page header */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Wallet &amp; Payments
        </h1>
        <p className="text-sm text-gray-500">
          Manage your wallet balance and payment methods.
        </p>
      </div>

      {/* Tabs + content */}
      <div className="max-w-6xl mx-auto px-6 pb-10 space-y-6">
        {/* Tabs bar */}
        <div className="bg-white rounded-xl shadow-sm border flex items-center">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === 'wallet'
                ? 'text-emerald-600 border-emerald-500 bg-emerald-50/40'
                : 'text-gray-500 border-transparent hover:text-gray-800'
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === 'methods'
                ? 'text-emerald-600 border-emerald-500 bg-emerald-50/40'
                : 'text-gray-500 border-transparent hover:text-gray-800'
            }`}
          >
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === 'transactions'
                ? 'text-emerald-600 border-emerald-500 bg-emerald-50/40'
                : 'text-gray-500 border-transparent hover:text-gray-800'
            }`}
          >
            Transactions
          </button>
        </div>

        {activeTab === 'wallet' && (
          <WalletTab
            balance={balance}
            thisMonthSpend={thisMonthSpend}
            cashback={cashback}
            quickTopups={quickTopups}
            transactions={transactions.slice(0, 4)} // recent 4
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
            onSelectTx={setSelectedTx}
          />
        )}

        {activeTab === 'methods' && (
          <PaymentMethodsTab methods={PAYMENT_METHODS} />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab
            transactions={transactions}
            onSelectTx={setSelectedTx}
          />
        )}
      </div>

      {selectedTx && (
        <TransactionDetailsModal
          tx={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}

/* Wallet tab: summary + recent list */
function WalletTab({
  balance,
  thisMonthSpend,
  cashback,
  quickTopups,
  transactions,
  selectedMethod,
  setSelectedMethod,
  onSelectTx,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Balance + methods */}
        <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase text-gray-500 mb-1">
              Current balance
            </p>
            <p className="text-3xl font-bold text-gray-900">
              NPR
              {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Choose a method to add money.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['esewa', 'khalti', 'card'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    selectedMethod === m
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                      : 'border-slate-200 text-gray-600 hover:border-emerald-500'
                  }`}
                >
                  {m === 'esewa' && 'eSewa'}
                  {m === 'khalti' && 'Khalti'}
                  {m === 'card' && 'Card / Visa'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700">
              <PlusCircle className="w-5 h-5" />
              Add Money ({selectedMethod === 'card' ? 'Card' : selectedMethod})
            </button>
            <button className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 text-gray-800 font-semibold rounded-xl hover:bg-slate-50">
              <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs uppercase text-gray-500 mb-1">This month</p>
            <p className="text-2xl font-bold text-gray-900">
              NPR
              {thisMonthSpend.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total spent on charging sessions
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs uppercase text-gray-500 mb-1">
              Cashback earned
            </p>
            <p className="text-2xl font-bold text-gray-900">
              NPR
              {cashback.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              From recent charging and offers
            </p>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Recent Transactions
            </h2>
            <button className="text-xs text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
              View all
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <TransactionList transactions={transactions} onSelectTx={onSelectTx} />
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Quick Top-up
          </h2>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {quickTopups.map((amt) => (
              <button
                key={amt}
                className="py-2 border rounded-lg text-sm font-semibold text-gray-700 hover:border-emerald-500 hover:text-emerald-600"
              >
                NPR{amt}
              </button>
            ))}
          </div>
          <button className="w-full py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Add Money
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">
            Special Offer
          </h2>
          <p className="text-xs text-gray-600 mb-2">
            Add NPR2000 or more and get 10% extra cashback on your next charging
            session.
          </p>
          <p className="text-[11px] text-gray-400">Valid till Jan 31, 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Manage saved payment methods
            </p>
            <p className="text-xs text-gray-500">
              Configure card (Stripe), eSewa, and Khalti for faster checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Payment Methods tab */
function PaymentMethodsTab({ methods }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Choose and manage how you pay for charging sessions.
        </p>
        <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Secure payments
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`relative flex-1 min-w-[240px] max-w-sm rounded-2xl text-white p-5 bg-gradient-to-r ${m.color}`}
          >
            {m.badge && (
              <span className="absolute top-3 right-4 text-[11px] bg-white/20 px-2 py-1 rounded-full">
                {m.badge}
              </span>
            )}
            <p className="text-xs uppercase tracking-wide opacity-80">
              {m.id === 'CARD' ? 'Stripe Card' : m.label}
            </p>
            <p className="mt-3 text-lg font-semibold">{m.label}</p>
            <p className="mt-2 text-xs opacity-90">{m.description}</p>
            <div className="mt-5 flex items-center justify-between text-[11px] opacity-80">
              <span>Tap to configure in settings</span>
              <span>Fast &amp; secure</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Linked methods
        </p>
        <div className="space-y-2">
          {methods.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>{m.label}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button className="text-gray-500 hover:text-gray-700">
                  Make default
                </button>
                <button className="text-red-500 hover:text-red-600">
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Transactions tab */
function TransactionsTab({ transactions, onSelectTx }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-gray-800">
            All Transactions
          </h2>
          <p className="text-xs text-gray-500">
            View your complete wallet transaction history.
          </p>
        </div>
        <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50">
          Export
        </button>
      </div>

      <TransactionList transactions={transactions} onSelectTx={onSelectTx} />
    </div>
  );
}

/* Helper to pretty-print payment method */
function formatPaymentMethod(method) {
  if (!method) return 'N/A';
  const m = method.toUpperCase();
  if (m === 'ESEWA') return 'Paid via eSewa';
  if (m === 'KHALTI') return 'Paid via Khalti';
  if (m === 'CARD' || m === 'STRIPE') return 'Paid via Card (Stripe)';
  return `Paid via ${method}`;
}

/* Reusable transaction list */
function TransactionList({ transactions, onSelectTx }) {
  return (
    <div className="divide-y divide-gray-100">
      {transactions.map((tx) => (
        <button
          key={tx.id}
          type="button"
          onClick={() => onSelectTx && onSelectTx(tx)}
          className="w-full flex items-center justify-between py-3 text-left hover:bg-slate-50 px-1"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                tx.type === 'debit'
                  ? 'bg-red-50 text-red-500'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {tx.type === 'debit' ? (
                <ArrowUpCircle className="w-4 h-4" />
              ) : (
                <ArrowDownCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{tx.title}</p>
              <p className="text-[11px] text-gray-500">{tx.datetime}</p>
              <p className="text-[11px] text-gray-400">
                {formatPaymentMethod(tx.paymentMethod)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={`text-sm font-semibold ${
                tx.amount < 0 ? 'text-red-500' : 'text-emerald-600'
              }`}
            >
              {tx.amount < 0
                ? `- NPR${Math.abs(tx.amount).toFixed(2)}`
                : `+ NPR${tx.amount.toFixed(2)}`}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Completed</p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* Modal: transaction details */
function TransactionDetailsModal({ tx, onClose }) {
  if (!tx) return null;

  const methodLabel = formatPaymentMethod(tx.paymentMethod);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
        <button
          type="button"
          className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className="text-xl font-semibold text-slate-900 mb-2">
          Transaction Details
        </h2>
        <p className="text-xs text-slate-500 mb-4">ID {tx.id}</p>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-[11px] text-slate-500 mb-0.5">Title</p>
            <p className="font-medium text-slate-900">{tx.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-slate-500 mb-0.5">Type</p>
              <p className="font-medium text-slate-900">
                {tx.type === 'debit' ? 'Debit (money out)' : 'Credit (money in)'}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 mb-0.5">Amount</p>
              <p
                className={`font-semibold ${
                  tx.amount < 0 ? 'text-red-500' : 'text-emerald-600'
                }`}
              >
                {tx.amount < 0
                  ? `- NPR${Math.abs(tx.amount).toFixed(2)}`
                  : `+ NPR${tx.amount.toFixed(2)}`}
              </p>
            </div>
          </div>

          <div>
            <p className="text-[11px] text-slate-500 mb-0.5">
              Date &amp; Time
            </p>
            <p className="font-medium text-slate-900">{tx.datetime}</p>
          </div>

          <div>
            <p className="text-[11px] text-slate-500 mb-0.5">
              Payment Method
            </p>
            <p className="font-medium text-slate-900">{methodLabel}</p>
          </div>

          {/* Add more fields here if your PaymentDTO includes them (e.g. bookingId) */}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
