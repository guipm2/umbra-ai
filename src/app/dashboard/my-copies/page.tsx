"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import {
    LayoutGrid,
    List,
    Search,
    Filter,
    Video,
    Image as ImageIcon,
    Mail,
    MessageSquare,
    Calendar,
    ArrowRight,
    Trash2,
    Copy,
    Check,
    Layers,
    FileText
} from "lucide-react";
import ReactMarkdown from "react-markdown";

type GeneratedContent = {
    id: string;
    type: 'ugc' | 'static' | 'email' | 'message' | 'linkedin' | 'instagram';
    title: string | null;
    content: any;
    created_at: string;
    campaigns?: { name: string };
};

export default function MyCopiesPage() {
    const { user } = useAuth();
    const [copies, setCopies] = useState<GeneratedContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState<'all' | 'ugc' | 'static' | 'email' | 'message' | 'linkedin' | 'instagram'>('all');
    const [search, setSearch] = useState("");
    const [selectedCopy, setSelectedCopy] = useState<GeneratedContent | null>(null);

    // CRUD
    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta copy?")) return;

        try {
            const { error } = await supabase.from('generated_content').delete().eq('id', id);

            if (error) {
                console.error(error);
                alert("Erro ao deletar.");
            } else {
                setCopies(prev => prev.filter(c => c.id !== id));
                if (selectedCopy?.id === id) setSelectedCopy(null);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const getCopyText = (copy: GeneratedContent) => {
        if (!copy.content) return "";

        switch (copy.type) {
            case 'ugc':
                return `HOOK: ${copy.content.hook}\n\n` +
                    (copy.content.scenes || []).map((s: any, i: number) => `CENA ${i + 1}\nVisual: ${s.visual}\nAudio: ${s.audio}`).join('\n\n');
            case 'static':
                return `HEADLINE: ${copy.content.headline}\n\nCORPO:\n${copy.content.body}\n\nVISUAL: ${copy.content.image_suggestion}`;
            case 'email':
                return `ASSUNTO: ${copy.content.subject_line}\nPREHEADER: ${copy.content.preheader}\n\nCORPO:\n${copy.content.body_content}\n\nCTA: ${copy.content.cta_button}`;
            case 'message':
                return (copy.content.variations || []).map((v: any) => `[${v.label}]\n${v.text}`).join('\n\n-------------------\n\n');
            case 'linkedin':
            case 'instagram':
                return copy.content.text || "";
            default:
                return JSON.stringify(copy.content, null, 2);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCopies();
        }
    }, [user]);

    async function fetchCopies() {
        setLoading(true);
        let query = supabase
            .from('generated_content')
            .select('*, campaigns(name)')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('type', filter);
        }

        const { data, error } = await query;

        if (error) {
            console.error(error);
        } else {
            setCopies(data || []);
        }
        setLoading(false);
    }

    // Refetch when filter changes
    useEffect(() => {
        if (user) fetchCopies();
    }, [filter]);

    const filteredCopies = copies.filter(copy => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        // Search in title, type, campaign name, or content JSON string
        return (
            copy.title?.toLowerCase().includes(searchLower) ||
            copy.campaigns?.name.toLowerCase().includes(searchLower) ||
            JSON.stringify(copy.content).toLowerCase().includes(searchLower)
        );
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'ugc': return <Video className="h-4 w-4" />;
            case 'static': return <ImageIcon className="h-4 w-4" />;
            case 'email': return <Mail className="h-4 w-4" />;
            case 'message': return <MessageSquare className="h-4 w-4" />;
            case 'linkedin': return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>;
            case 'instagram': return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'ugc': return 'Vídeo UGC';
            case 'static': return 'Anúncio Estático';
            case 'email': return 'E-mail';
            case 'message': return 'Mensagem';
            case 'linkedin': return 'Post LinkedIn';
            case 'instagram': return 'Post Instagram';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'ugc': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'static': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
            case 'email': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'message': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'linkedin': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'instagram': return 'text-pink-500 bg-pink-500/10 border-pink-500/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // --- Detail View Helpers ---
    const renderCopyContent = (copy: GeneratedContent) => {
        if (!copy.content) return null;

        if (copy.type === 'ugc') {
            return (
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Hook</h4>
                        <p className="text-white text-lg">"{copy.content.hook}"</p>
                    </div>
                    <div className="space-y-2">
                        {(copy.content.scenes || []).map((scene: any, i: number) => (
                            <div key={i} className="grid grid-cols-2 gap-4 p-3 bg-black/20 rounded border border-white/5">
                                <div>
                                    <span className="text-[10px] text-gray-500 uppercase">Visual</span>
                                    <p className="text-sm text-gray-300">{scene.visual}</p>
                                </div>
                                <div className="border-l border-white/5 pl-4">
                                    <span className="text-[10px] text-gray-500 uppercase">Áudio</span>
                                    <p className="text-sm text-white font-medium">"{scene.audio}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        if (copy.type === 'static') {
            return (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-xs font-bold text-pink-400 uppercase mb-1">Headline</h4>
                        <p className="text-2xl font-bold text-white">{copy.content.headline}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Corpo</h4>
                        <p className="text-gray-300 whitespace-pre-line">{copy.content.body}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Sugestão Visual</h4>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10 border-dashed text-gray-400 italic">
                            {copy.content.image_suggestion}
                        </div>
                    </div>
                </div>
            )
        }
        if (copy.type === 'email') {
            return (
                <div className="bg-white text-gray-900 p-6 rounded-lg">
                    <div className="border-b border-gray-200 pb-4 mb-4">
                        <p className="text-sm text-gray-600">Assunto: <span className="font-bold text-black">{copy.content.subject_line}</span></p>
                        <p className="text-xs text-gray-500 mt-1">{copy.content.preheader}</p>
                    </div>
                    <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{copy.content.body_content}</ReactMarkdown>
                    </div>
                    <div className="mt-6 text-center">
                        <span className="inline-block px-4 py-2 bg-green-600 text-white text-xs font-bold rounded uppercase">
                            {copy.content.cta_button}
                        </span>
                    </div>
                </div>
            )
        }
        if (copy.type === 'message') {
            return (
                <div className="grid gap-4">
                    {(copy.content.variations || []).map((v: any, i: number) => (
                        <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <span className="text-xs font-bold text-yellow-500 uppercase mb-2 block">{v.label}</span>
                            <p className="text-white whitespace-pre-wrap">{v.text}</p>
                        </div>
                    ))}
                </div>
            )
        }
        if (copy.type === 'linkedin' || copy.type === 'instagram') {
            return (
                <div className="bg-white/5 p-6 rounded-lg border border-white/10 prose prose-invert max-w-none text-gray-300">
                    <ReactMarkdown>
                        {copy.content.text}
                    </ReactMarkdown>
                </div>
            );
        }
        return <pre className="text-xs text-gray-500">{JSON.stringify(copy.content, null, 2)}</pre>;
    };


    return (
        <div className="max-w-[1800px] mx-auto p-6 md:p-8 h-[calc(100vh-64px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Layers className="h-6 w-6 text-neon" />
                        Minhas Copys
                    </h1>
                    <p className="text-gray-400 mt-1">Histórico de todas as gerações salvas no projeto.</p>
                </div>

                <div className="flex items-center gap-3 bg-black/20 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setView('grid')}
                        className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por título, campanha ou conteúdo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                    {['all', 'ugc', 'static', 'email', 'message', 'linkedin', 'instagram'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${filter === t
                                ? 'bg-white/10 border-white/20 text-white'
                                : 'bg-transparent border-transparent text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {t === 'all' ? 'Todos' : getTypeLabel(t)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-2">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredCopies.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/5 mb-4">
                            <Layers className="h-8 w-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-400">Nenhum conteúdo encontrado</h3>
                        <p className="text-sm text-gray-500">Gere novas copys no menu lateral para vê-las aqui.</p>
                    </div>
                ) : (
                    <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
                        {filteredCopies.map((copy) => (
                            <div
                                key={copy.id}
                                onClick={() => setSelectedCopy(copy)}
                                className={`group cursor-pointer rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 hover:border-neon/20 transition-all overflow-hidden flex flex-col ${view === 'list' ? 'flex-row items-center gap-6 p-4' : 'p-6'}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${getTypeColor(copy.type)}`}>
                                        {getTypeIcon(copy.type)}
                                        {getTypeLabel(copy.type)}
                                    </div>
                                    {view === 'grid' && (
                                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(copy.created_at)}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold truncate group-hover:text-neon transition-colors mb-1">
                                        {copy.title || "Sem título"}
                                    </h3>
                                    {copy.campaigns && (
                                        <p className="text-xs text-gray-500 mb-3">
                                            Campanha: {copy.campaigns.name}
                                        </p>
                                    )}
                                    {view === 'grid' && (
                                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                                            {copy.content.text || JSON.stringify(copy.content)}
                                        </p>
                                    )}
                                </div>

                                {view === 'list' && (
                                    <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
                                        <span>{formatDate(copy.created_at)}</span>
                                        <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-neon" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal / Drawer */}
            {selectedCopy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCopy(null)} />
                    <div className="relative w-full max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 rounded-t-2xl">
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${getTypeColor(selectedCopy.type)}`}>
                                    {getTypeIcon(selectedCopy.type)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">{selectedCopy.title || getTypeLabel(selectedCopy.type)}</h2>
                                    <p className="text-xs text-gray-400 flex items-center gap-2">
                                        {formatDate(selectedCopy.created_at)}
                                        {selectedCopy.campaigns && <span>• {selectedCopy.campaigns.name}</span>}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCopy(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors">
                                <span className="sr-only">Fechar</span>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {renderCopyContent(selectedCopy)}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-2xl flex justify-between gap-3">
                            <button
                                onClick={() => handleDelete(selectedCopy.id)}
                                className="px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Deletar
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const text = getCopyText(selectedCopy);
                                        navigator.clipboard.writeText(text);
                                        alert("Texto copiado!");
                                    }}
                                    className="px-4 py-2 rounded-lg bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors flex items-center gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copiar Texto
                                </button>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(selectedCopy.content, null, 2));
                                        alert("JSON copiado!");
                                    }}
                                    className="px-4 py-2 rounded-lg bg-neon text-black font-bold text-xs hover:bg-neon/90 transition-colors flex items-center gap-2 shadow-lg shadow-neon/20"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copiar JSON
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
