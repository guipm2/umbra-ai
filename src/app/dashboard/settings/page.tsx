
"use client";

import { useState, useEffect } from "react";
import { User, CreditCard, Bell, Shield, LogOut, Loader2, CheckCircle2, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface UserProfile {
    id: string;
    full_name: string | null;
    email: string | null; // From auth.users actually, but useful to display
    cpf_cnpj: string | null;
    birth_date: string | null;
    phone: string | null;
    address_zip: string | null;
    address_street: string | null;
    address_number: string | null;
    address_complement: string | null;
    address_neighborhood: string | null;
    address_city: string | null;
    address_state: string | null;
    avatar_url: string | null;
    bio: string | null;
}

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [profile, setProfile] = useState<UserProfile>({
        id: "",
        full_name: "",
        email: "",
        cpf_cnpj: "",
        birth_date: "",
        phone: "",
        address_zip: "",
        address_street: "",
        address_number: "",
        address_complement: "",
        address_neighborhood: "",
        address_city: "",
        address_state: "",
        avatar_url: "",
        bio: ""
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.push('/login');
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                setProfile({
                    ...data,
                    email: user.email || "",
                    id: user.id
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [router]);

    const handleViaCEP = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();

            if (!data.erro) {
                setProfile(prev => ({
                    ...prev,
                    address_street: data.logradouro,
                    address_neighborhood: data.bairro,
                    address_city: data.localidade,
                    address_state: data.uf,
                    address_zip: cleanCep
                }));
            }
        } catch (error) {
            console.error("ViaCEP Error", error);
        }
    };

    const handleChange = (field: keyof UserProfile, value: string) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        if (field === 'address_zip') {
            // Simple debounce could go here, but for now direct call on blur or length check
            if (value.replace(/\D/g, '').length === 8) {
                handleViaCEP(value);
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            // Filter out email as it's not in profiles
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { email, id, ...updates } = profile;

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', profile.id);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neon" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-white">Configurações</h1>
                <p className="text-sm text-gray-400">Gerencie sua conta e preferências.</p>
            </div>

            <div className="glass rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Sidebar */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-white/5 p-4 space-y-2 shrink-0">
                    {[
                        { id: 'profile', label: 'Dados Pessoais', icon: User },
                        { id: 'billing', label: 'Cobrança', icon: CreditCard },
                        { id: 'notifications', label: 'Notificações', icon: Bell },
                        { id: 'security', label: 'Segurança', icon: Shield },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-electric/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                router.push('/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair da Conta
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto max-h-[800px]">

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Avatar Section */}
                            <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-electric to-neon flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-neon/20 uppercase">
                                    {profile.full_name?.[0] || profile.email?.[0] || "U"}
                                </div>
                                <div>
                                    <button className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg border border-white/5 transition-colors">
                                        Alterar Foto
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Puxado automaticamente do Gravatar se disponível.</p>
                                </div>
                            </div>

                            {/* Personal Info Form */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={profile.full_name || ''}
                                        onChange={(e) => handleChange('full_name', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Email (Login)</label>
                                    <input
                                        type="email"
                                        value={profile.email || ''}
                                        disabled
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">CPF / CNPJ</label>
                                    <input
                                        type="text"
                                        value={profile.cpf_cnpj || ''}
                                        onChange={(e) => handleChange('cpf_cnpj', e.target.value)}
                                        placeholder="000.000.000-00"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Data de Nascimento</label>
                                    <input
                                        type="date"
                                        value={profile.birth_date || ''}
                                        onChange={(e) => handleChange('birth_date', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>

                                <div className="space-y-2 text-white">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={profile.phone || ''}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>

                                <div className="col-span-full space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Bio / Cargo</label>
                                    <input
                                        type="text"
                                        value={profile.bio || ''}
                                        onChange={(e) => handleChange('bio', e.target.value)}
                                        placeholder="Ex: Founder & Developer na Acme Inc."
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-lg font-semibold text-white mb-1">Endereço de Cobrança</h2>
                                <p className="text-sm text-gray-400">Essas informações aparecerão nas suas faturas.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase flex items-center justify-between">
                                        <span>CEP</span>
                                        <span className="text-[10px] text-neon cursor-pointer hover:underline" onClick={() => handleViaCEP(profile.address_zip || "")}>Buscar</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={profile.address_zip || ''}
                                            onChange={(e) => handleChange('address_zip', e.target.value)}
                                            placeholder="00000-000"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                        />
                                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 clickable" onClick={() => handleViaCEP(profile.address_zip || "")} />
                                    </div>
                                </div>

                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Rua</label>
                                    <input
                                        type="text"
                                        value={profile.address_street || ''}
                                        onChange={(e) => handleChange('address_street', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Número</label>
                                    <input
                                        type="text"
                                        value={profile.address_number || ''}
                                        onChange={(e) => handleChange('address_number', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>

                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Complemento</label>
                                    <input
                                        type="text"
                                        value={profile.address_complement || ''}
                                        onChange={(e) => handleChange('address_complement', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Bairro</label>
                                    <input
                                        type="text"
                                        value={profile.address_neighborhood || ''}
                                        onChange={(e) => handleChange('address_neighborhood', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">Cidade</label>
                                    <input
                                        type="text"
                                        value={profile.address_city || ''}
                                        onChange={(e) => handleChange('address_city', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-1 space-y-2">
                                    <label className="text-xs font-medium text-gray-400 uppercase">UF</label>
                                    <input
                                        type="text"
                                        value={profile.address_state || ''}
                                        onChange={(e) => handleChange('address_state', e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {['notifications', 'security'].includes(activeTab) && (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                            <Shield className="h-12 w-12 mb-4 opacity-20" />
                            <p>Esta seção estará disponível na próxima atualização.</p>
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-6 mt-8 border-t border-white/5 flex justify-end gap-3 sticky bottom-0 bg-[#0A0A0B]/80 backdrop-blur-md p-4 -mx-4 -mb-4 rounded-b-xl z-10">
                        <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors" disabled={saving}>Cancelar</button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-neon/10 hover:bg-neon/20 text-neon border border-neon/20 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_-5px_rgba(224,130,255,0.3)] disabled:opacity-50"
                        >
                            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {!saving && success && <CheckCircle2 className="h-4 w-4" />}
                            {saving ? "Salvando..." : success ? "Salvo!" : "Salvar Alterações"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
