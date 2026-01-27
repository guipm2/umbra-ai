
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        // Basic validation
        if (isSignup && !name.trim()) {
            setMessage("Por favor, insira seu nome.");
            setLoading(false);
            return;
        }

        const options: any = {
            emailRedirectTo: `${location.origin}/auth/callback`,
        };

        if (isSignup) {
            options.data = { full_name: name };
        }

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options,
        });

        if (error) {
            setMessage("Erro ao enviar link. Tente novamente: " + error.message);
        } else {
            setMessage(isSignup
                ? "Conta criada! Verifique seu email para acessar."
                : "Link de acesso enviado para seu email!"
            );
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
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
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-electric/20 mb-4">
                        <Sparkles className="w-6 h-6 text-neon" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isSignup ? "Criar conta Umbra" : "Bem-vindo ao Umbra AI"}
                    </h1>
                    <p className="text-gray-400">
                        {isSignup ? "Comece sua jornada de influência" : "Acesse seu painel de controle"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <AnimatePresence>
                        {isSignup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">Nome Completo</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-transparent transition-all"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-transparent transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-semibold shadow-lg shadow-neon/25 hover:shadow-neon/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignup ? "Criar Conta" : "Enviar Link Mágico")}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-sm text-gray-400 hover:text-white transition-colors underline decoration-dotted"
                    >
                        {isSignup ? "Já tem uma conta? Entrar" : "Não tem conta? Cadastre-se"}
                    </button>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-6 p-4 rounded-xl text-center text-sm ${message.includes("Erro") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}
                    >
                        {message}
                    </motion.div>
                )}

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500">
                        Ao continuar, você concorda com nossos <br /> Termos de Serviço e Política de Privacidade.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
