
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Link as LinkIcon, Lock, Loader2, ScanLine } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { VoiceAnalysisChart } from "@/components/dashboard/voice-analysis-chart";

export default function OnboardingPage() {
  const [step, setStep] = useState<"url" | "account" | "radar">("url");
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setAnalyzing(true);
    // Simulate "Deep Scan"
    setTimeout(() => {
      setAnalyzing(false);
      setStep("account");
    }, 2500);
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Simulate creation for UX flow, then go to Radar
    // In real app: call supabase.auth.signUp() here
    setTimeout(() => {
      setLoading(false);
      setStep("radar");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50vh] h-[50vh] bg-electric/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[50vh] h-[50vh] bg-neon/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <div className="w-full max-w-lg relative z-10">

        <AnimatePresence mode="wait">
          {/* Step 1: The First Step (URL) */}
          {step === "url" && (
            <motion.div
              key="step-url"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 relative">
                  {analyzing ? (
                    <ScanLine className="w-8 h-8 text-neon animate-pulse" />
                  ) : (
                    <LinkIcon className="w-8 h-8 text-white" />
                  )}
                  {analyzing && (
                    <span className="absolute inset-0 rounded-2xl border-2 border-neon animate-ping opacity-50" />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Inicie sua Iniciação na Umbra.</h1>
                <p className="text-gray-400">Cole o link do seu perfil principal para começarmos a escanear sua autoridade.</p>
              </div>

              <form onSubmit={handleUrlSubmit} className="relative max-w-md mx-auto">
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/seu-perfil"
                  className="w-full h-14 pl-6 pr-14 rounded-full bg-white/5 border-2 border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-neon focus:ring-4 focus:ring-neon/10 transition-all text-center"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={analyzing}
                />
                <button
                  type="submit"
                  disabled={!url || analyzing}
                  className="absolute right-2 top-2 h-10 w-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                  {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              {analyzing && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-sm text-neon font-mono"
                >
                  Mapeando arquitetura de conteúdo...
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Step 2: Account Creation */}
          {step === "account" && (
            <motion.div
              key="step-account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white">Quase lá, Fundador.</h2>
                <p className="text-sm text-gray-400">Crie suas credenciais para acessar sua Central de Comando.</p>
              </div>

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon/50 focus:bg-white/10 transition-all font-light"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="E-mail Profissional"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon/50 focus:bg-white/10 transition-all font-light"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Senha Forte"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-neon/50 focus:bg-white/10 transition-all font-light"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-electric to-neon text-white font-bold tracking-wide shadow-lg shadow-neon/20 hover:shadow-neon/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Minha Conta"}
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Sneak Peek (Radar) */}
          {step === "radar" && (
            <motion.div
              key="step-radar"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mb-6">
                <Sparkles className="w-12 h-12 text-neon mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">Análise Preliminar Concluída</h2>
                <p className="text-gray-400 max-w-md mx-auto">
                  Identificamos um forte potencial de autoridade técnica no seu perfil.
                </p>
              </div>

              <div className="relative max-w-sm mx-auto aspect-square bg-gradient-to-b from-white/5 to-transparent rounded-full border border-white/10 p-4 mb-8">
                <div className="absolute inset-0 bg-neon/5 rounded-full blur-3xl" />
                <VoiceAnalysisChart />
              </div>

              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-10 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
              >
                Acessar Dashboard
              </button>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
