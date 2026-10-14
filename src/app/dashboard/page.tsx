'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminDashboardPage() {
    const [shopSettings, setShopSettings] = useState<any>(null);
    const [currentMonth, setCurrentMonth] = useState('2026-10');
    const [expenses, setExpenses] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    // Expense Form State
    const [expenseName, setExpenseName] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');

    useEffect(() => {
        fetchDashboardData();
        fetchShopSettings();
    }, [currentMonth]);

    const fetchShopSettings = async () => {
        const { data } = await supabase.from('shop_settings').select('*').single();
        if (data) setShopSettings(data);
    };

    const fetchDashboardData = async () => {
        // 1. Fetch Expenses for selected month
        const { data: expData } = await supabase
            .from('monthly_expenses')
            .select('*')
            .eq('month_year', currentMonth);
        if (expData) setExpenses(expData);

        // 2. Fetch Orders
        const { data: ordData } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (ordData) setOrders(ordData);
    };

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!expenseName || !expenseAmount) return;

        const { error } = await supabase.from('monthly_expenses').insert({
            expense_name: expenseName,
            amount: parseFloat(expenseAmount),
            month_year: currentMonth,
        });

        if (!error) {
            setExpenseName('');
            setExpenseAmount('');
            fetchDashboardData();
        }
    };

    const handleDeleteExpense = async (id: number) => {
        await supabase.from('monthly_expenses').delete().eq('id', id);
        fetchDashboardData();
    };

    // Financial Calculations
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalSales = orders.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    const totalAdvances = orders.reduce((sum, item) => sum + Number(item.advance_amount || 0), 0);
    const totalEstimatedProfit = orders.reduce((sum, item) => sum + Number(item.estimated_profit || 0), 0);

    // Breakeven percentage
    const breakevenProgress = totalExpenses > 0 ? Math.min(Math.round((totalSales / totalExpenses) * 100), 100) : 100;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">

            {/* Professional Header with Weavon Logo & Owner Welcome */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3.5">
                    {/* Real Weavon Logo Image */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-rose-200 shadow-sm bg-white flex items-center justify-center">
                        <img
                            src="/logo/weavon.jpeg"
                            alt="Weavon Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900">{shopSettings?.shop_name || 'Weavon'}</h1>
                            <span className="text-[11px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                Owner Studio
              </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Welcome back, <span className="font-semibold text-slate-800">Devindi Hashara 🐶</span> ✨
                        </p>
                    </div>
                </div>

                <input
                    type="month"
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    className="p-2 border rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-rose-500 text-slate-800 bg-slate-50"
                />
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Sales</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">LKR {totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Fixed Expenses</p>
                    <p className="text-lg font-bold text-rose-600 mt-1">LKR {totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Collected Advance</p>
                    <p className="text-lg font-bold text-emerald-600 mt-1">LKR {totalAdvances.toLocaleString()}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Profit</p>
                    <p className="text-lg font-bold text-indigo-600 mt-1">LKR {totalEstimatedProfit.toLocaleString()}</p>
                </div>
            </div>

            {/* Breakeven Progress Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">Breakeven Meter (Shop Rent & Bills Covered)</span>
                    <span className={breakevenProgress >= 100 ? 'text-emerald-600' : 'text-amber-600'}>
            {breakevenProgress}% Covered
          </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${
                            breakevenProgress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${breakevenProgress}%` }}
                    />
                </div>
                <p className="text-[11px] text-slate-500 italic">
                    {totalSales >= totalExpenses
                        ? '🎉 Breakeven Reached! Current sales are generating Net Profit.'
                        : `Need LKR ${(totalExpenses - totalSales).toLocaleString()} more in sales to cover fixed monthly overheads.`}
                </p>
            </div>

            {/* Recent Orders List Table */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-rose-600" /> Recent Custom Orders
                    </h2>
                    <span className="text-xs text-slate-500 font-medium">{orders.length} Orders total</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 uppercase border-b">
                        <tr>
                            <th className="p-2.5">Order #</th>
                            <th className="p-2.5">Customer</th>
                            <th className="p-2.5">Total (LKR)</th>
                            <th className="p-2.5">Advance</th>
                            <th className="p-2.5">Status</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-slate-400 italic">
                                    No orders placed yet. Create your first order!
                                </td>
                            </tr>
                        ) : (
                            orders.slice(0, 5).map((ord) => (
                                <tr key={ord.id} className="hover:bg-slate-50/50">
                                    <td className="p-2.5 font-bold text-rose-600">{ord.order_number}</td>
                                    <td className="p-2.5 font-semibold text-slate-800">{ord.customer_name}</td>
                                    <td className="p-2.5 font-bold">LKR {Number(ord.total_amount).toLocaleString()}</td>
                                    <td className="p-2.5 text-emerald-600 font-semibold">LKR {Number(ord.advance_amount).toLocaleString()}</td>
                                    <td className="p-2.5">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-medium">
                        {ord.status}
                      </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fixed Monthly Expenses Form & List */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fixed Monthly Expenses ({currentMonth})</h2>

                <form onSubmit={handleAddExpense} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="e.g. Shop Rent, Electricity Bill, Packaging"
                        value={expenseName}
                        onChange={(e) => setExpenseName(e.target.value)}
                        className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                    />
                    <input
                        type="number"
                        placeholder="Amount (LKR)"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        className="w-32 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold hover:bg-rose-700 transition flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </form>

                {/* Expenses List */}
                <div className="divide-y divide-slate-100 text-xs">
                    {expenses.length === 0 ? (
                        <p className="text-slate-400 py-3 italic text-center">No fixed expenses added for this month yet.</p>
                    ) : (
                        expenses.map((exp) => (
                            <div key={exp.id} className="py-2.5 flex justify-between items-center">
                                <span className="font-semibold text-slate-700">{exp.expense_name}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-slate-900">LKR {Number(exp.amount).toLocaleString()}</span>
                                    <button
                                        onClick={() => handleDeleteExpense(exp.id)}
                                        className="text-rose-500 hover:text-rose-700 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}