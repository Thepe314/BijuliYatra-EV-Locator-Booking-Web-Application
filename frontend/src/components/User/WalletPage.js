import React, { useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  Wallet,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const transactions = [
  {
    id: 1,
    type: 'debit',
    title: 'Charging Session - PowerHub CP',
    datetime: 'Jan 11, 2026 • 10:31 AM',
    amount: -934.5,
  },
  {
    id: 2,
    type: 'credit',
    title: 'Wallet Top-up',
    datetime: 'Jan 10, 2026 • 3:15 PM',
    amount: 2000,
  },
  {
    id: 3,
    type: 'debit',
    title: 'Charging Session - ChargeZone',
    datetime: 'Jan 9, 2026 • 4:32 PM',
    amount: -525,
  },
  {
    id: 4,
    type: 'credit',
    title: 'Cashback Credit',
    datetime: 'Jan 9, 2026 • 4:35 PM',
    amount: 26.25,
  },
  {
    id: 5,
    type: 'debit',
    title: 'Charging Session - EV Point',
    datetime: 'Jan 7, 2026 • 11:05 AM',
    amount: -680,
  },
  {
    id: 6,
    type: 'credit',
    title: 'Referral Bonus',
    datetime: 'Jan 5, 2026 • 9:00 AM',
    amount: 100,
  },
];

const cards = [
  {
    id: 1,
    brand: 'VISA',
    masked: '•••• 4242',
    holder: 'Rajesh Kumar',
    expiry: '12/28',
    color: 'from-blue-500 to-blue-700',
    isDefault: true,
  },
  {
    id: 2,
    brand: 'MASTERCARD',
    masked: '•••• 8765',
    holder: 'Rajesh Kumar',
    expiry: '09/27',
    color: 'from-orange-500 to-red-500',
    isDefault: false,
  },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [selectedMethod, setSelectedMethod] = useState('esewa');
  const navigate = useNavigate();

  const balance = 1250;
  const thisMonthSpend = 3245.75;
  const cashback = 162.29;
  const quickTopups = [500, 100, 200, 5000];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar with back button */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
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
        {/* Tabs bar styled like the reference */}
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
            transactions={transactions.slice(0, 4)}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
        )}

        {activeTab === 'methods' && <PaymentMethodsTab cards={cards} />}

        {activeTab === 'transactions' && (
          <TransactionsTab transactions={transactions} />
        )}
      </div>
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
          <TransactionList transactions={transactions} />
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
              Manage saved cards
            </p>
            <p className="text-xs text-gray-500">
              Add or remove bank cards and UPI accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Payment Methods tab */
function PaymentMethodsTab({ cards }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Manage your saved payment methods.
        </p>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700">
          <PlusCircle className="w-4 h-4" />
          Add Card
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`relative flex-1 min-w-[260px] max-w-sm rounded-2xl text-white p-5 bg-gradient-to-r ${card.color}`}
          >
            {card.isDefault && (
              <span className="absolute top-3 right-4 text-[11px] bg-white/20 px-2 py-1 rounded-full">
                Default
              </span>
            )}
            <p className="text-xs uppercase tracking-wide opacity-80">
              {card.brand}
            </p>
            <p className="mt-4 text-xl font-semibold">{card.masked}</p>
            <div className="mt-6 flex items-end justify-between text-xs">
              <div>
                <p className="opacity-80">Card Holder</p>
                <p className="font-semibold">{card.holder}</p>
              </div>
              <div>
                <p className="opacity-80">Expires</p>
                <p className="font-semibold">{card.expiry}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">Card Actions</p>
        <div className="space-y-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-50"
            >
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>
                  {card.brand} {card.masked}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button className="text-gray-500 hover:text-gray-700">
                  Edit
                </button>
                <button className="text-red-500 hover:text-red-600">
                  Delete
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
function TransactionsTab({ transactions }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-gray-800">All Transactions</h2>
          <p className="text-xs text-gray-500">
            View your complete wallet transaction history.
          </p>
        </div>
        <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50">
          Export
        </button>
      </div>

      <TransactionList transactions={transactions} />
    </div>
  );
}

/* Reusable transaction list */
function TransactionList({ transactions }) {
  return (
    <div className="divide-y divide-gray-100">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between py-3">
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
        </div>
      ))}
    </div>
  );
}
