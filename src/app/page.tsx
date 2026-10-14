'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PlusCircle, LayoutDashboard, Settings, Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeStartupPage() {
  const [shopSettings, setShopSettings] = useState<any>(null);

  useEffect(() => {
    fetchShopSettings();
  }, []);

  const fetchShopSettings = async () => {
    const { data } = await supabase.from('shop_settings').select('*').single();
    if (data) setShopSettings(data);
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-6 relative overflow-hidden">

          {/* Subtle Decorative Background Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-200/50 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-200/50 rounded-full blur-2xl" />

          {/* Brand Logo & Owner Avatar */}
          <div className="flex flex-col items-center space-y-3 relative z-10">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-rose-300 shadow-md bg-white">
              <img src="/logo/weavon.jpeg" alt="Weavon Studio Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {shopSettings?.shop_name || 'WEAVON'}
              </h1>
              <p className="text-xs font-semibold text-rose-600 italic tracking-wide mt-0.5">
                "{shopSettings?.tagline || 'Elegance in every stitch'}"
              </p>
            </div>
          </div>

          {/* Welcome Greeting */}
          <div className="bg-rose-50/80 border border-rose-200/60 p-3.5 rounded-2xl">
            <p className="text-xs text-slate-600">
              Welcome back, <span className="font-bold text-slate-800">Devindi Hashara 🐶</span> ✨
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">What would you like to do today?</p>
          </div>

          {/* Quick Launch Action Buttons */}
          <div className="space-y-3 relative z-10">
            <Link
                href="/orders/new"
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-between group text-sm"
            >
              <div className="flex items-center gap-3">
                <PlusCircle className="w-5 h-5 text-rose-200" />
                <span>Create New Order & Bill</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <Link
                href="/dashboard"
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-sm transition flex items-center justify-between group text-sm"
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
                <span>Admin & Growth Dashboard</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <Link
                href="/settings"
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Brand & Category Settings</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Footer info */}
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold pt-2">
            Weavon POS Studio • Version 1.0
          </p>

        </div>
      </div>
  );
}