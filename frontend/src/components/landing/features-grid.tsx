
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { VoiceAnalysisChart } from "@/components/dashboard/voice-analysis-chart";
import { useState, useEffect } from "react";
import { PenTool, Activity, Hash, Sparkles, TrendingUp, Search, MessageSquare } from "lucide-react";

// Demos Scenarios
const scenarios = [
    {
        input: "Post sobre o futuro da IA no desenvolvimento web...",
        tags: [
            { label: "Tech", color: "blue" },
            { label: "Futuro", color: "purple" }
        ],
        score: 98,
        analysis: "Alto potencial de engajamento na comunidade dev.",
        finalOutput: "A IA não é o futuro, é o agora. 🚀 Devs que dominam LLMs não serão substituídos, eles substituirão quem ignora a revolução. A barreira de entrada caiu. E você, está construindo ou apenas observando? #WebDev #AI"
    },
    {
        input: "Thread polêmica: Por que o Clean Code morreu?",
        tags: [
            { label: "Opinião", color: "red" },
            { label: "Viral", color: "orange" }
        ],
        score: 94,
        analysis: "Tópico controverso detectado. Espere muitos comentários.",
        finalOutput: "Clean Code morreu? Não. 💀 Mas a obsessão cega por ele sim. Código limpo que não shippa é apenas poesia inútil. A verdade impopular: Performance e Entregas > Abstrações Perfeitas. Vamos debater? 👇"
    },
    {
        input: "Lançamento do meu novo SaaS de produtividade.",
        tags: [
            { label: "Launch", color: "green" },
            { label: "SaaS", color: "cyan" }
        ],
        score: 91,
        analysis: "Sugestão: Adicione prova social para converter mais.",
        finalOutput: "🚀 Finalmente no ar! Construí esse SaaS em 30 dias trabalhando apenas à noite. O segredo? Foco total em MVP funcional. Quem quiser testar o beta, link nos comentários! #BuildInPublic #SaaS"
    }
];

function GhostwriterDemo() {
    const [currentScenario, setCurrentScenario] = useState(0);
    const [text, setText] = useState("");
    const [status, setStatus] = useState("idle"); // idle, typing, analyzing, reasoning, generating, complete
    const [generatedText, setGeneratedText] = useState("");

    useEffect(() => {
        let isCancelled = false;

        const runScenario = async () => {
            if (isCancelled) return;
            const scenario = scenarios[currentScenario];

            // Reset
            setStatus("idle");
            setText("");
            setGeneratedText("");

            // 1. Typing Phase
            setStatus("typing");
            for (let i = 0; i <= scenario.input.length; i++) {
                if (isCancelled) return;
                setText(scenario.input.slice(0, i));
                await new Promise(r => setTimeout(r, 30));
            }

            // 2. Analyzing Phase (Progress Bar)
            if (isCancelled) return;
            setStatus("analyzing");
            await new Promise(r => setTimeout(r, 1000));

            // 3. Reasoning Phase (Tags + Analysis)
            if (isCancelled) return;
            setStatus("reasoning");
            await new Promise(r => setTimeout(r, 2000));

            // 4. Generating Phase (Final Output)
            if (isCancelled) return;
            setStatus("generating");
            const output = scenario.finalOutput;
            for (let i = 0; i <= output.length; i++) {
                if (isCancelled) return;
                setGeneratedText(output.slice(0, i));
                await new Promise(r => setTimeout(r, 15)); // Faster typing for output
            }

            // 5. Complete Phase (Wait)
            setStatus("complete");
            await new Promise(r => setTimeout(r, 5000));

            // Next
            if (isCancelled) return;
            setCurrentScenario(prev => (prev + 1) % scenarios.length);
        };

        runScenario();

        return () => { isCancelled = true; };
    }, [currentScenario]);

    const scenario = scenarios[currentScenario];

    return (
        <div className="bg-black/40 p-5 rounded-xl border border-white/5 h-[400px] flex flex-col relative overflow-hidden group-hover:border-white/10 transition-colors">
            {/* Input Simulation */}
            <div className="mb-4 shrink-0 transition-opacity duration-500" style={{ opacity: status === 'generating' || status === 'complete' ? 0.5 : 1 }}>
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                        <Search className="h-3 w-3 text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Topic Input</span>
                </div>
                <div className="text-sm text-gray-200 h-10 font-medium leading-tight">
                    {text}
                    {status === "typing" && <span className="animate-pulse ml-1">|</span>}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <AnimatePresence mode="wait">
                    {status === "analyzing" && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3 mt-auto"
                        >
                            <div className="flex items-center gap-2 text-xs text-neon animate-pulse">
                                <Sparkles className="h-3 w-3" />
                                <span>Analisando contexto e semântica...</span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded overflow-hidden">
                                <motion.div
                                    className="h-full bg-neon"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {(status === "reasoning" || status === "generating" || status === "complete") && (
                        <motion.div
                            key="reasoning"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-3 shrink-0"
                        >
                            {/* Tags + Visualization */}
                            <div className="flex flex-wrap gap-2">
                                {scenario.tags.map((tag, idx) => (
                                    <span
                                        key={tag.label}
                                        className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1
                                            ${tag.color === 'blue' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' : ''}
                                            ${tag.color === 'purple' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' : ''}
                                            ${tag.color === 'red' ? 'bg-red-500/10 text-red-300 border-red-500/20' : ''}
                                            ${tag.color === 'orange' ? 'bg-orange-500/10 text-orange-300 border-orange-500/20' : ''}
                                            ${tag.color === 'green' ? 'bg-green-500/10 text-green-300 border-green-500/20' : ''}
                                            ${tag.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' : ''}
                                        `}
                                    >
                                        <Hash className="w-2.5 h-2.5" />
                                        {tag.label}
                                    </span>
                                ))}
                            </div>

                            {/* Reasoning Text */}
                            <div className="pt-2 border-t border-white/5 flex gap-2">
                                <div className="mt-0.5"><Sparkles className="h-3 w-3 text-neon" /></div>
                                <p className="text-[11px] text-gray-400 italic leading-snug">
                                    {scenario.analysis}
                                </p>
                            </div>

                            {/* Viral Score (Small) */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="text-[10px] text-gray-500">Predicted Viral Score</span>
                                <span className="text-xs font-bold text-white">{scenario.score}/100</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Final Generated Output */}
                <AnimatePresence>
                    {(status === "generating" || status === "complete") && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-electric/10 rounded-lg p-4 border border-electric/20 relative"
                        >
                            <div className="absolute -top-3 left-3 bg-black px-2 py-0.5 rounded-full border border-electric/30 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 text-neon" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Umbra Draft</span>
                            </div>
                            <p className="text-sm text-gray-200 leading-relaxed">
                                {generatedText}
                                {status === "generating" && <span className="animate-pulse ml-0.5">|</span>}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Background Decorations */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon/5 rounded-full blur-3xl" />
        </div>
    );
}

export function FeaturesGrid() {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">A Diferença Umbra</h2>
                    <p className="text-gray-400">Tecnologia proprietária para quem exige excelência.</p>
                </div>

                <div id="features-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature 1: Personality Radar */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="glass p-1 rounded-3xl overflow-hidden relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-electric/10 to-transparent pointer-events-none" />
                        <div className="p-8 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-white/5"><Activity className="h-5 w-5 text-neon" /></div>
                                <h3 className="text-xl font-bold text-white">Personality Radar</h3>
                            </div>
                            <p className="text-gray-400 mb-6 max-w-sm">
                                Visualize sua essência digital. Identificamos se seu tom é analítico, inspiracional ou casual,
                                para que cada post reforce sua marca.
                            </p>
                            <div className="flex-1 min-h-[300px] w-full relative">
                                <div className="absolute inset-0 overflow-hidden rounded-xl border border-white/5 bg-black/20">
                                    <div className="scale-75 origin-top-left w-[133%] h-[133%]">
                                        <VoiceAnalysisChart />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 2: Auto-Ghostwriter */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="glass rounded-3xl p-8 flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-white/5"><PenTool className="h-5 w-5 text-neon" /></div>
                                <h3 className="text-xl font-bold text-white">Auto-Ghostwriter</h3>
                            </div>
                            <p className="text-gray-400 mb-6 text-sm">
                                Copywriting de alta conversão focado em tech. De posts técnicos a visuais criativos.
                            </p>
                        </div>
                        <GhostwriterDemo />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
