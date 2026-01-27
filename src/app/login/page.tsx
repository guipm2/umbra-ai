
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, Lock } from "lucide-react";

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
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-electric/20 mb-4 shadow-lg shadow-electric/20">
                        <Lock className="w-6 h-6 text-neon" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isSignup ? "Iniciação Umbra" : "Retorno à Sombra"}
                    </h1>
                    <p className="text-gray-400 font-light">
                        {isSignup ? "Comece sua jornada de influência" : "Acesse sua central e veja o que a Umbra construiu."}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-5">
                    <AnimatePresence>
                        {isSignup && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="relative group">
                                    <input
                                        id="name"
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

                    <div className="relative group">
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon/50 focus:bg-white/10 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-bold tracking-wide shadow-lg shadow-neon/25 hover:shadow-neon/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignup ? "Iniciar Protocolo" : "Entrar no Dashboard")}
                        {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

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
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        {isSignup ? "Já tem credenciais? " : "Novo por aqui? "}
                        <span className="text-neon underline decoration-dotted underline-offset-4 font-medium">
                            {isSignup ? "Acessar Conta" : "Iniciar Cadastro"}
                        </span>
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
