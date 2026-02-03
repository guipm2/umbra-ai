
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";

type ExampleType = 'text' | 'image';

interface Example {
    prompt: string;
    response: string;
    type: ExampleType;
    imageSrc?: string;
}

const examples: Example[] = [
    {
        prompt: "Crie um post para LinkedIn sobre como a IA está mudando o desenvolvimento frontend, com tom analítico.",
        response: "A fronteira do frontend está se expandindo. 🚀 Com a IA generativa, não estamos apenas codando interfaces, estamos orquestrando experiências adaptativas. A chave não é substituir o dev, mas potenciar a criatividade através da automação inteligente. #Frontend #AI #DevTools",
        type: 'text'
    },
    {
        prompt: "Gere uma imagem futurista para a capa desse post, mostrando um cérebro digital conectado à nuvem.",
        response: "Aqui está uma visualização conceitual da simbiose entre mente humana e infraestrutura digital. Pronta para uso em alta resolução.",
        type: 'image',
        imageSrc: "/assets/3d/hero_ai_mind.png"
    },
    {
        prompt: "Escreva uma thread analisando as tendências de UX para 2026.",
        response: "UX em 2026: A Era da Antecipação. 🔮 1/5 Interfaces passivas morreram. O novo padrão é adaptabilidade contextual. 2/5 Micro-interações preditivas: O app sabe o que você quer antes do clique. 3/5...",
        type: 'text'
    }
];

export function UseCases() {
    const [currentExample, setCurrentExample] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [displayedPrompt, setDisplayedPrompt] = useState("");

    useEffect(() => {
        const startDemo = async () => {
            // Reset
            setDisplayedPrompt("");
            setShowResponse(false);
            setIsTyping(true);

            // Type Prompt
            const prompt = examples[currentExample].prompt;
            for (let i = 0; i <= prompt.length; i++) {
                setDisplayedPrompt(prompt.slice(0, i));
                await new Promise(r => setTimeout(r, 30));
            }

            setIsTyping(false);

            // Loading Simulation
            await new Promise(r => setTimeout(r, 1500));
            setShowResponse(true);

            // Wait before next
            await new Promise(r => setTimeout(r, 5000));
            setCurrentExample((prev) => (prev + 1) % examples.length);
        };

        startDemo();
        return () => { };
    }, [currentExample]);

    return (
        <section id="use-cases" className="py-24 bg-black relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-16">

                    {/* Text Content */}
                    <div className="w-full md:w-1/2">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Exemplos Reais. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-neon">
                                Resultados Reais.
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-8">
                            Veja como a Umbra se adapta a diferentes contextos e plataformas,
                            mantendo sempre a qualidade e a voz da sua marca pessoal.
                        </p>

                        <div className="space-y-4">
                            {examples.map((ex, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer ${currentExample === idx
                                        ? "bg-white/10 border-neon/50"
                                        : "bg-white/5 border-white/5 hover:bg-white/10"
                                        }`}
                                    onClick={() => setCurrentExample(idx)}
                                >
                                    <div className="flex items-center gap-3">
                                        {ex.type === 'image' ? <ImageIcon className="w-4 h-4 text-neon" /> : <Sparkles className="w-4 h-4 text-gray-500" />}
                                        <p className="text-sm text-gray-300 line-clamp-1">{ex.prompt}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Simulator */}
                    <div className="w-full md:w-1/2">
                        <div className="relative rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl aspect-[4/5] md:aspect-square overflow-hidden flex flex-col shadow-2xl shadow-neon/10">

                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <div className="ml-4 text-xs font-mono text-gray-500">umbra_agent_v2.exe</div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                {/* User Message */}
                                <div className="flex justify-end">
                                    <div className="bg-white/10 text-white p-4 rounded-2xl rounded-tr-sm max-w-[80%]">
                                        <p className="text-sm">{displayedPrompt}</p>
                                        {isTyping && <span className="animate-pulse">|</span>}
                                    </div>
                                </div>

                                {/* AI Response */}
                                <AnimatePresence>
                                    {showResponse && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="flex justify-start items-start gap-4"
                                        >
                                            <div className="h-10 w-10 rounded-xl bg-electric/20 flex items-center justify-center shrink-0">
                                                <Sparkles className="h-5 w-5 text-neon" />
                                            </div>
                                            <div className="glass p-5 rounded-2xl rounded-tl-sm text-gray-300 text-sm leading-relaxed border border-neon/20 shadow-[0_0_15px_-5px_rgba(224,130,255,0.2)] w-full">
                                                <p className="mb-3">{examples[currentExample].response}</p>

                                                {examples[currentExample].type === 'image' && examples[currentExample].imageSrc && (
                                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/10 mt-2">
                                                        <Image
                                                            src={examples[currentExample].imageSrc}
                                                            alt="Generated Image"
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!showResponse && !isTyping && displayedPrompt && (
                                    <div className="flex justify-start items-center ml-14">
                                        <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Input Area (Visual Only) */}
                            <div className="p-4 border-t border-white/5 bg-white/5">
                                <div className="h-12 rounded-xl bg-black/50 border border-white/10 flex items-center px-4 justify-between">
                                    <div className="h-2 w-24 bg-white/10 rounded-full" />
                                    <Send className="h-4 w-4 text-gray-600" />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
