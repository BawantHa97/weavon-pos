'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Send, Calculator, ShoppingBag } from 'lucide-react';
import jsPDF from 'jspdf';

export default function NewOrderPage() {
    const [shopSettings, setShopSettings] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Order Details State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [fittingDate, setFittingDate] = useState('');
    const [designType, setDesignType] = useState('');
    const [customNotes, setCustomNotes] = useState('');

    // Cost & Profit Calculator State
    const [fabricCost, setFabricCost] = useState<number>(4500);
    const [materialCost, setMaterialCost] = useState<number>(1500);
    const [laborHours, setLaborHours] = useState<number>(6);
    const [hourlyRate, setHourlyRate] = useState<number>(1000);
    const [designFee, setDesignFee] = useState<number>(5000);
    const [hiddenMargin, setHiddenMargin] = useState<number>(20); // 20% Buffer
    const [loyaltyDiscount, setLoyaltyDiscount] = useState<number>(10); // 10% Discount illusion
    const [advancePaid, setAdvancePaid] = useState<number>(5000);

    useEffect(() => {
        fetchShopSettings();
        fetchCategories();
    }, []);

    const fetchShopSettings = async () => {
        const { data } = await supabase.from('shop_settings').select('*').single();
        if (data) setShopSettings(data);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('shop_categories').select('*').order('id', { ascending: true });
        if (data && data.length > 0) {
            setCategories(data);
            setDesignType(data[0].category_name);
        }
    };

    // Live Dynamic Calculations
    const baseCost = fabricCost + materialCost + laborHours * hourlyRate + designFee;
    const actualCostWithBuffer = baseCost * (1 + hiddenMargin / 100);
    const rawSellingPrice = actualCostWithBuffer * 1.35;
    const markedPrice = rawSellingPrice / (1 - loyaltyDiscount / 100);
    const finalSellingPrice = markedPrice * (1 - loyaltyDiscount / 100);
    const netProfit = finalSellingPrice - actualCostWithBuffer;
    const balanceDue = finalSellingPrice - advancePaid;

    const handleSaveOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const orderNumber = `WV-${Date.now().toString().slice(-5)}`;

        // Save Order to Supabase Database
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                customer_name: customerName,
                customer_phone: customerPhone,
                event_date: eventDate || null,
                fitting_date: fittingDate || null,
                total_amount: Math.round(finalSellingPrice),
                advance_amount: Math.round(advancePaid),
                balance_amount: Math.round(balanceDue),
                estimated_profit: Math.round(netProfit),
                status: 'PENDING',
                order_source: 'SHOP',
                custom_notes: customNotes,
            })
            .select()
            .single();

        if (!orderError && orderData) {
            await supabase.from('custom_order_pricing').insert({
                order_id: orderData.id,
                fabric_cost: fabricCost,
                material_cost: materialCost,
                labor_hours: laborHours,
                hourly_rate: hourlyRate,
                design_type: designType,
                design_fee: designFee,
                hidden_margin_percent: hiddenMargin,
                loyalty_discount_percent: loyaltyDiscount,
                net_profit: Math.round(netProfit),
            });

            // Auto Generate & Download PDF Invoice
            generatePDFInvoice(orderNumber);
        }

        setLoading(false);
    };

    const generatePDFInvoice = (orderNumber: string) => {
        const doc = new jsPDF({
            unit: 'mm',
            format: [80, 160], // 80mm Thermal Receipt Layout
        });

        const shopName = shopSettings?.shop_name || 'Weavon';
        const tagline = shopSettings?.tagline || 'Elegance in every stitch';

        // Header Branding
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(shopName, 40, 12, { align: 'center' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(tagline, 40, 16, { align: 'center' });

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`WhatsApp/Call: ${shopSettings?.phone_primary || '0762689223'}`, 40, 20, { align: 'center' });
        doc.text(`Email: ${shopSettings?.email || 'styleweavon@gmail.com'}`, 40, 24, { align: 'center' });

        doc.line(5, 27, 75, 27);

        // Order Header
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`Order #: ${orderNumber}`, 5, 32);
        doc.text(`Customer: ${customerName}`, 5, 37);
        doc.text(`Phone: ${customerPhone}`, 5, 42);
        if (eventDate) doc.text(`Event Date: ${eventDate}`, 5, 47);

        doc.line(5, 50, 75, 50);

        // Item Details
        doc.setFontSize(8);
        doc.text(`Item: Custom ${designType}`, 5, 56);
        doc.text(`Marked Price: LKR ${Math.round(markedPrice).toLocaleString()}`, 5, 62);
        if (loyaltyDiscount > 0) {
            doc.text(`Loyalty Discount (${loyaltyDiscount}%): -LKR ${Math.round(markedPrice - finalSellingPrice).toLocaleString()}`, 5, 67);
        }

        doc.line(5, 71, 75, 71);

        // Financial Breakdown
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Amount: LKR ${Math.round(finalSellingPrice).toLocaleString()}`, 5, 77);
        doc.text(`Advance Paid: LKR ${Math.round(advancePaid).toLocaleString()}`, 5, 83);
        doc.text(`Balance Due: LKR ${Math.round(balanceDue).toLocaleString()}`, 5, 89);

        doc.line(5, 93, 75, 93);

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(shopSettings?.receipt_thank_you_note || 'Thank you for choosing Weavon!', 40, 100, { align: 'center' });
        doc.text(`Insta: @weavonstyle | TikTok: @styleweavon`, 40, 104, { align: 'center' });

        doc.save(`Weavon_Invoice_${orderNumber}.pdf`);
    };

    const handleWhatsAppShare = () => {
        if (!customerPhone) return alert('Please enter customer phone number first!');

        const formattedPhone = customerPhone.replace(/^0/, '94');
        const message = `Hi ${customerName}, Thank you for ordering with Weavon! ✨%0A%0A*Order Summary:*%0A- Item: Custom ${designType}%0A- Total Amount: LKR ${Math.round(finalSellingPrice).toLocaleString()}%0A- Advance Paid: LKR ${Math.round(advancePaid).toLocaleString()}%0A- Balance Due: LKR ${Math.round(balanceDue).toLocaleString()}%0A%0AWeavon - Elegance in every stitch 🧵`;

        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    };

    return (
        <div className="max-w-xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen space-y-4">

            {/* Studio Header Card */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-rose-200 shadow-sm bg-white">
                        <img src="/logo/weavon.jpeg" alt="Weavon Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">New Custom Order</h1>
                        <p className="text-xs text-slate-500">Weavon • Devindi Hashara 🐶</p>
                    </div>
                </div>
                <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200">
          Order Billing
        </span>
            </div>

            <form onSubmit={handleSaveOrder} className="space-y-4">

                {/* Section 1: Customer Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h2 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" /> 1. Customer Details
                    </h2>
                    <div>
                        <label className="text-xs font-semibold text-slate-700">Customer Name</label>
                        <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Sewwandi Udara"
                            className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm text-slate-800"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                            <input
                                type="text"
                                required
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="0771234567"
                                className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-700">Design Category</label>
                            <select
                                value={designType}
                                onChange={(e) => setDesignType(e.target.value)}
                                className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-sm text-slate-800 bg-white"
                            >
                                {categories.length === 0 ? (
                                    <option value="Custom Order">Custom Order</option>
                                ) : (
                                    categories.map((cat) => (
                                        <option key={cat.id} value={cat.category_name}>
                                            {cat.category_name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium text-slate-600">Event Date</label>
                            <input
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-lg text-sm text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600">Fitting Date</label>
                            <input
                                type="date"
                                value={fittingDate}
                                onChange={(e) => setFittingDate(e.target.value)}
                                className="w-full mt-1 p-2 border rounded-lg text-sm text-slate-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Cost & Dynamic Profit Calculator */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h2 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Calculator className="w-4 h-4" /> 2. Cost & Profit Calculator
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-600">Fabric Cost (LKR)</label>
                            <input
                                type="number"
                                value={fabricCost}
                                onChange={(e) => setFabricCost(Number(e.target.value))}
                                className="w-full mt-1 p-2 border rounded-lg text-sm text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-600">Threads & Materials (LKR)</label>
                            <input
                                type="number"
                                value={materialCost}
                                onChange={(e) => setMaterialCost(Number(e.target.value))}
                                className="w-full mt-1 p-2 border rounded-lg text-sm text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-600">Labor Hours Spent</label>
                            <input
                                type="number"
                                value={laborHours}
                                onChange={(e) => setLaborHours(Number(e.target.value))}
                                className="w-full mt-1 p-2 border rounded-lg text-sm text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-600">Hourly Labor Rate (LKR)</label>
                            <input
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(Number(e.target.value))}
                                className="w-full mt-1 p-2 border rounded-lg text-sm text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-600">Design Fee (LKR)</label>
                            <input
                                type="number"
                                value={designFee}
                                onChange={(e) => setDesignFee(Number(e.target.value))}
                                className="w-full mt-1 p-2 border rounded-lg text-sm text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-600">Loyalty Discount (%)</label>
                            <input
                                type="number"
                                value={loyaltyDiscount}
                                onChange={(e) => setLoyaltyDiscount(Number(e.target.value))}
                                className="w-full mt-1 p-2 border rounded-lg text-sm text-slate-800"
                            />
                        </div>
                    </div>

                    {/* Real-time Profit Preview Box */}
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Calculated Selling Price:</span>
                            <span className="font-bold text-slate-900">LKR {Math.round(finalSellingPrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-bold">
                            <span>Net Estimated Profit for Weavon:</span>
                            <span>LKR {Math.round(netProfit).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Section 3: Advance Payment & Balance */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h2 className="text-xs font-bold text-rose-600 uppercase tracking-wider">3. Payment & Advance</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-700">Advance Paid (LKR)</label>
                            <input
                                type="number"
                                value={advancePaid}
                                onChange={(e) => setAdvancePaid(Number(e.target.value))}
                                className="w-full mt-1 p-2.5 border rounded-lg text-sm font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-700">Remaining Balance</label>
                            <div className="mt-1 p-2.5 bg-slate-100 rounded-lg font-bold text-rose-600 text-sm border border-slate-200">
                                LKR {Math.round(balanceDue).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        {loading ? 'Saving Weavon Order...' : 'Save Order & Download PDF Receipt'}
                    </button>

                    <button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm"
                    >
                        <Send className="w-4 h-4" /> Share Order Summary via WhatsApp
                    </button>
                </div>

            </form>
        </div>
    );
}