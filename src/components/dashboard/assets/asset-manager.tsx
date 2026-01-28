"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Loader2, ChevronRight, Box, Users, UserCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-context";

interface AssetField {
    name: string;
    label: string;
    type: "text" | "textarea" | "number" | "tags";
    placeholder?: string;
}

interface AssetManagerProps {
    title: string;
    description: string;
    tableName: "products" | "audiences" | "experts";
    icon: any;
    fields: AssetField[];
    renderCard: (item: any) => React.ReactNode;
}

export function AssetManager({ title, description, tableName, icon: Icon, fields, renderCard }: AssetManagerProps) {
    const { user } = useAuth();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Form State
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            loadItems();
        }
    }, [user, tableName]);

    async function loadItems() {
        // 1. Try Cache First
        const cacheKey = `aura_assets_${tableName}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setItems(JSON.parse(cached));
            setLoading(false);
        }

        // 2. Fetch Fresh Data
        await fetchItems(cacheKey);
    }

    async function fetchItems(cacheKey?: string) {
        try {
            if (!cacheKey) setLoading(true); // Only show spinner if no cache key (meaning explicit refresh or first load without cache)

            const { data, error } = await supabase
                .from(tableName)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            const freshData = data || [];
            setItems(freshData);

            // 3. Update Cache
            localStorage.setItem(cacheKey || `aura_assets_${tableName}`, JSON.stringify(freshData));

        } catch (error) {
            console.error(`Error fetching ${tableName}:`, error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!user) return;
        setSaving(true);
        try {
            // Handle Tags Transform (String -> Array)
            const processedData = { ...formData };
            fields.forEach(field => {
                if (field.type === 'tags' && typeof processedData[field.name] === 'string') {
                    processedData[field.name] = processedData[field.name].split(',').map((t: string) => t.trim()).filter((t: string) => t);
                }
            });

            const payload = {
                ...processedData,
                user_id: user.id
            };

            if (editingItem) {
                const { error } = await supabase
                    .from(tableName)
                    .update(payload)
                    .eq("id", editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from(tableName)
                    .insert([payload]);
                if (error) throw error;
            }

            // Update Cache Immediately
            const cacheKey = `aura_assets_${tableName}`;
            await fetchItems(cacheKey); // Re-fetch to be safe and update cache

            setIsCreating(false);
            setEditingItem(null);
            setFormData({});
        } catch (error) {
            alert("Erro ao salvar. Verifique o console.");
            console.error(error);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir?")) return;
        try {
            const { error } = await supabase.from(tableName).delete().eq("id", id);
            if (error) throw error;

            // Update State & Cache
            const newItems = items.filter(i => i.id !== id);
            setItems(newItems);
            localStorage.setItem(`aura_assets_${tableName}`, JSON.stringify(newItems));

        } catch (error) {
            console.error(error);
        }
    }

    const openEditor = (item?: any) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({});
        }
        setIsCreating(true);
    };

    const filteredItems = items.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isCreating) {
        return (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setIsCreating(false)} className="text-muted-foreground hover:text-white transition-colors">
                        {title}
                    </button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-white font-medium">{editingItem ? "Editar" : "Novo"}</span>
                </div>

                <div className="glass rounded-xl p-8 border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <Icon className="h-6 w-6 text-neon" />
                        {editingItem ? `Editar ${title}` : `Novo ${title}`}
                    </h2>

                    <div className="space-y-6">
                        {fields.map(field => (
                            <div key={field.name} className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase">{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon/50 min-h-[120px]"
                                        placeholder={field.placeholder}
                                        value={formData[field.name] || ""}
                                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'tags' ? 'text' : field.type}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neon/50"
                                        placeholder={field.placeholder}
                                        value={formData[field.name] || ""}
                                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                            <button
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-neon/10 hover:bg-neon/20 text-neon border border-neon/20 rounded-lg text-sm font-medium transition-colors shadow-none hover:shadow-[0_0_15px_-5px_rgba(224,130,255,0.3)] disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Icon className="h-6 w-6 text-neon" />
                        {title}
                    </h1>
                    <p className="text-gray-400 mt-1">{description}</p>
                </div>
                <button
                    onClick={() => openEditor()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Criar Novo
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                    type="text"
                    placeholder={`Buscar ${title.toLowerCase()}...`}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-neon/50 transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-neon" />
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-white/10 rounded-xl">
                    <p className="text-gray-500">Nenhum item encontrado.</p>
                    <button onClick={() => openEditor()} className="text-neon hover:underline mt-2 text-sm">Criar o primeiro</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="glass group relative rounded-xl border border-white/5 p-5 hover:border-neon/30 transition-all hover:bg-white/5">

                            {renderCard(item)}

                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 p-1 rounded-lg backdrop-blur-sm">
                                <button onClick={() => openEditor(item)} className="p-1.5 text-blue-400 hover:bg-blue-400/20 rounded-md transition-colors">
                                    <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-md transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
