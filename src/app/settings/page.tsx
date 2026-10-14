'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Store, CheckCircle, Plus, Trash2, Tag, MapPin } from 'lucide-react';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [newCategory, setNewCategory] = useState('');

    const [formData, setFormData] = useState({
        shop_name: 'Weavon',
        tagline: 'Elegance in every stitch',
        address: 'Address Pending (Online Store)',
        phone_primary: '0762689223',
        phone_secondary: '0762689223',
        email: 'styleweavon@gmail.com',
        facebook_handle: 'weavon',
        instagram_handle: 'weavonstyle',
        tiktok_handle: 'styleweavon',
        receipt_thank_you_note: 'Thank you for choosing Weavon for your special day!',
    });

    useEffect(() => {
        fetchSettings();
        fetchCategories();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from('shop_settings').select('*').single();
        if (data) setFormData(data);
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('shop_categories').select('*').order('id', { ascending: true });
        if (data) setCategories(data);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        const { error } = await supabase.from('shop_categories').insert({ category_name: newCategory.trim() });
        if (!error) {
            setNewCategory('');
            fetchCategories();
        }
    };

    const handleDeleteCategory = async (id: number) => {
        await supabase.from('shop_categories').delete().eq('id', id);
        fetchCategories();
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSaved(false);

        const { error } = await supabase.from('shop_settings').upsert({
            id: 1,
            ...formData,
            updated_at: new Date().toISOString(),
        });

        setLoading(false);
        if (!error) {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6">
            <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-rose-600" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Weavon - Studio Settings</h1>
                    <p className="text-sm text-slate-500">Manage brand identity & custom product categories</p>
                </div>
            </div>

            {saved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle className="w-5 h-5" /> Settings saved successfully!
                </div>
            )}

            {/* Dynamic Product Categories Management */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4 text-rose-600" /> Custom Product Categories
                </h2>
                <p className="text-xs text-slate-500">Add or remove dress/shawl categories for the billing dropdown.</p>

                <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g. Saree Blouse, Party Gown"
                        className="flex-1 p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 text-sm flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                    {categories.map((cat) => (
                        <span
                            key={cat.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-semibold"
                        >
              {cat.category_name}
                            <button onClick={() => handleDeleteCategory(cat.id)} className="hover:text-rose-900">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </span>
                    ))}
                </div>
            </div>

            {/* General Settings Form */}
            <form onSubmit={handleSaveSettings} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Brand Information</h2>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Brand Name</label>
                    <input
                        type="text"
                        value={formData.shop_name}
                        onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 font-bold text-xl text-slate-800"
                        required
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tagline</label>
                    <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-700 italic"
                    />
                </div>

                {/* Physical Shop Address Field */}
                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" /> Physical Shop / Studio Address
                    </label>
                    <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Physical address (update when physical shop opens)"
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800 text-sm outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
                        <input
                            type="text"
                            value={formData.phone_primary}
                            onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">WhatsApp Number</label>
                        <input
                            type="text"
                            value={formData.phone_secondary}
                            onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-rose-500 text-slate-800"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition shadow-md"
                >
                    {loading ? 'Saving Weavon Settings...' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}