"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Linkedin,
  Instagram,
  Zap,
  BrainCircuit,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function isValidProfileUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (
      u.hostname.includes("linkedin.com") ||
      u.hostname.includes("instagram.com")
    );
  } catch {
    return false;
  }
}

export default function OnboardingPage() {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!url.trim()) return;
    if (!isValidProfileUrl(url.trim())) {
      setUrlError("Insira uma URL válida do LinkedIn ou Instagram");
      return;
    }
    setUrlError("");
    setIsAnalyzing(true);
    setStep(0);

    let currentStep = 0;
    intervalRef.current = setInterval(() => {
      currentStep++;
      setStep(currentStep);
      if (currentStep >= 4) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        timeoutRef.current = setTimeout(() => {
          setIsAnalyzing(false);
          router.push("/dashboard");
        }, 1000);
      }
    }, 1200);
  }, [url, router]);

  const steps = [
    "Conectando ao perfil...",
    "Analisando tom de voz...",
    "Mapeando tópicos principais...",
    "Criando sua persona digital...",
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-deep bg-grid-pattern">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-electric/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-neon/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6 relative h-32 w-32 animate-float">
            <Image
              src="/assets/3d/hero_ai_mind.png"
              alt="Umbra AI Mind"
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(157,80,187,0.6)]"
              priority
            />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground neon-text">
            Umbra AI
          </h1>
          <p className="text-center text-lg text-muted-foreground">
            Sua presença digital, potencializada por inteligência artificial
          </p>
        </div>

        {/* Main input card */}
        <div className="glass-strong rounded-3xl p-8 neon-glow">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Vamos começar a mágica
            </h2>
            <p className="text-sm text-muted-foreground">
              Cole o link do seu perfil para analisarmos sua presença digital
            </p>
          </div>

          {/* Platform selector pills */}
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-pink-500/10 px-4 py-2 text-sm text-pink-400">
              <Instagram className="h-4 w-4" />
              Instagram
            </div>
          </div>

          {/* Input */}
          <div className="relative mb-6">
            <label htmlFor="profile-url" className="sr-only">
              URL do perfil
            </label>
            <div className="gradient-border rounded-2xl">
              <input
                id="profile-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError("");
                }}
                placeholder="https://linkedin.com/in/seu-perfil"
                className={cn(
                  "w-full rounded-2xl bg-deep/80 px-6 py-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none",
                  urlError && "ring-1 ring-destructive"
                )}
                disabled={isAnalyzing}
                aria-describedby={urlError ? "url-error" : undefined}
                aria-invalid={urlError ? true : undefined}
              />
            </div>
            {urlError && (
              <p id="url-error" role="alert" className="mt-2 text-xs text-destructive">{urlError}</p>
            )}
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={!url.trim() || isAnalyzing}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold transition-all",
              url.trim() && !isAnalyzing
                ? "bg-electric text-white hover:bg-electric/90 neon-glow-strong"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Analisar Perfil
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          {/* Analysis steps */}
          {isAnalyzing && (
            <div className="mt-6 space-y-3">
              {steps.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-500",
                    step > i
                      ? "bg-electric/10 text-neon"
                      : step === i
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground/30"
                  )}
                >
                  {step > i ? (
                    <div className="h-5 w-5 rounded-full bg-electric/30 flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-neon" />
                    </div>
                  ) : step === i ? (
                    <Loader2 className="h-5 w-5 animate-spin text-neon" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-muted" />
                  )}
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: BrainCircuit,
              title: "IA Personalizada",
              desc: "Aprende seu estilo único",
            },
            {
              icon: Zap,
              title: "Conteúdo Autônomo",
              desc: "Posts gerados automaticamente",
            },
            {
              icon: TrendingUp,
              title: "Crescimento Real",
              desc: "Engajamento otimizado por dados",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-xl p-4 text-center transition-all hover:neon-glow"
            >
              <feature.icon className="mx-auto mb-2 h-6 w-6 text-neon" />
              <h3 className="mb-1 text-sm font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Automation Flow Section */}
        <div className="mt-16 text-center">
          <div className="relative mx-auto h-48 w-full max-w-lg opacity-80 transition-opacity hover:opacity-100">
            <Image
              src="/assets/3d/automation_flow_diagram.png"
              alt="Fluxo de Automação Umbra"
              fill
              className="object-contain drop-shadow-[0_0_20px_rgba(157,80,187,0.3)]"
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground/50">Fluxo de processamento autônomo</p>
        </div>
      </div>
    </div>
  );
}
