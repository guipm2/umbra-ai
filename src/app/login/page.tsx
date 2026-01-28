
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Lock, Key, Mail } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [isRecovery, setIsRecovery] = useState(false);
    const [useMagicLink, setUseMagicLink] = useState(false); // Default to Password for cleaner UX

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // 0. PASSWORD RECOVERY FLOW
            if (isRecovery) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${location.origin}/auth/callback?next=/dashboard/settings`,
                });
                if (error) throw error;
                setMessage("Email de recuperação enviado! Verifique sua caixa de entrada.");
            }
            // 1. SIGNUP FLOW (Always requires Password)
            else if (isSignup) {
                if (!name.trim()) throw new Error("Por favor, insira seu nome.");
                if (!password || password.length < 6) throw new Error("A senha deve ter no mínimo 6 caracteres.");

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name },
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;
                setMessage("Conta criada! Verifique seu email para confirmar.");
            }
            // 2. LOGIN FLOW
            else {
                // 2a. Magic Link Login
                if (useMagicLink) {
                    const { error } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            emailRedirectTo: `${location.origin}/auth/callback`,
                        },
                    });
                    if (error) throw error;
                    setMessage("Link mágico enviado! Verifique seu email.");
                }
                // 2b. Password Login
                else {
                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                    if (error) throw error;
                    router.push("/dashboard");
                    router.refresh(); // Ensure auth state updates
                }
            }
        } catch (error: unknown) {
            setMessage((error as Error).message || "Ocorreu um erro durante a autenticação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden pt-16">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[50vh] h-[50vh] bg-electric/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[50vh] h-[50vh] bg-neon/10 rounded-full blur-[100px] animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 rounded-3xl glass-strong border border-white/10 relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-electric/20 mb-4 shadow-lg shadow-electric/20">
                        <Lock className="w-6 h-6 text-neon" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isRecovery ? "Recuperar Acesso" : (isSignup ? "Criar Credenciais" : "Acesso Restrito")}
                    </h1>
                    <p className="text-gray-400 font-light">
                        {isRecovery ? "Enviaremos um link para resetar sua senha." : (isSignup ? "Junte-se à revolução Umbra." : "Bem-vindo de volta, agente.")}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Name: Only for Signup */}
                    <AnimatePresence>
                        {isSignup && !isRecovery && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative group mb-1">
                                    <input
                                        id="name"
                                        name="name"
                                        autoComplete="name"
                                        aria-label="Nome Completo"
                                        type="text"
                                        placeholder="Nome Completo"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Email: Always visible */}
                    <div className="relative group">
                        <input
                            id="email"
                            name="email"
                            autoComplete="email"
                            aria-label="Email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:bg-white/10 transition-all"
                        />
                    </div>

                    {/* Password: For Signup OR Login via Password (NOT Recovery) */}
                    <AnimatePresence mode="wait">
                        {(!useMagicLink || isSignup) && !isRecovery && (
                            <motion.div
                                key="password-field"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative group pt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        autoComplete={isSignup ? "new-password" : "current-password"}
                                        aria-label="Senha"
                                        type="password"
                                        placeholder="Senha Segura"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required={(!useMagicLink || isSignup) && !isRecovery}
                                        minLength={6}
                                        className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Actions: Magic Link Toggle & Forgot Password */}
                    {!isSignup && !isRecovery && (
                        <div className="flex items-center justify-between text-xs">
                            <button
                                type="button"
                                onClick={() => {
                                    setUseMagicLink(!useMagicLink);
                                    setMessage("");
                                }}
                                className="text-electric hover:text-neon transition-colors flex items-center gap-1"
                            >
                                {useMagicLink ? (
                                    <>
                                        <Key className="w-3 h-3" /> Usar Senha
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-3 h-3" /> Usar Magic Link
                                    </>
                                )}
                            </button>

                            {!useMagicLink && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRecovery(true);
                                        setMessage("");
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    Esqueci minha senha
                                </button>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-bold tracking-wide shadow-lg shadow-neon/25 hover:shadow-neon/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            isRecovery ? "Enviar Email de Recuperação" :
                                (isSignup ? "Criar Conta" : (useMagicLink ? "Enviar Link Mágico" : "Acessar"))
                        )}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    {isRecovery && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsRecovery(false);
                                setMessage("");
                            }}
                            className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            Voltar para Login
                        </button>
                    )}
                </form>

                <AnimatePresence>
                    {/* Footer Links (Only show if NOT in recovery mode) */}
                    {!isRecovery && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="mt-8 flex flex-col gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-2 text-gray-500">Ou continue com</span></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white text-sm font-medium">
                                        Google
                                    </button>
                                    <button className="flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white text-sm font-medium">
                                        LinkedIn
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => {
                                        setIsSignup(!isSignup);
                                        setMessage("");
                                        setUseMagicLink(false); // Reset to default on switch
                                    }}
                                    className="text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    {isSignup ? "Já tem conta? " : "Novo por aqui? "}
                                    <span className="text-neon underline decoration-dotted underline-offset-4 font-medium">
                                        {isSignup ? "Fazer Login" : "Cadastrar Agora"}
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mt-4 p-3 rounded-lg text-center text-xs font-medium border ${message.includes("verifique") || message.includes("enviado") ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
                        >
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
