import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Store, PlusCircle, LayoutDashboard, Home } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Weavon POS - Elegance in Every Stitch',
  description: 'Custom Order Billing & Management System for Weavon',
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en">
      <body className={`${inter.className} bg-slate-100 text-slate-800 pb-20`}>
      {/* Header Bar with Home Navigation */}
      <header className="bg-white border-b px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-rose-200">
            <img src="/logo/weavon.jpeg" alt="Weavon" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 tracking-wide leading-none">WEAVON</h1>
            <p className="text-[9px] text-rose-600 font-semibold italic">Elegance in every stitch</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Startup Home Direct Link */}
          <Link
              href="/"
              className="p-2 text-slate-600 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-lg border transition flex items-center gap-1 text-xs font-semibold"
          >
            <Home className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </header>

      {/* Main Pages Content */}
      <main>{children}</main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2.5 z-50 shadow-lg max-w-md mx-auto">
        <Link href="/" className="flex flex-col items-center text-slate-600 hover:text-rose-600 transition">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </Link>

        <Link href="/orders/new" className="flex flex-col items-center text-slate-600 hover:text-rose-600 transition">
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">New Order</span>
        </Link>

        <Link href="/dashboard" className="flex flex-col items-center text-slate-600 hover:text-rose-600 transition">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Dashboard</span>
        </Link>

        <Link href="/settings" className="flex flex-col items-center text-slate-600 hover:text-rose-600 transition">
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Settings</span>
        </Link>
      </nav>
      </body>
      </html>
  );
}