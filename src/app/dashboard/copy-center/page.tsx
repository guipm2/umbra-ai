"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Video,
    Image as ImageIcon,
    Smartphone,
    Mail,
    MessageSquare,
    Instagram,
    LayoutTemplate,
    Linkedin,
    FileText,
    Zap
} from "lucide-react";

const tools = [
    {
        id: "ugc",
        title: "Anúncio UGC",
        description: "Roteiros para criadores de conteúdo e influencers.",
        icon: Smartphone,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20",
        href: "/dashboard/generator/ugc",
        status: "Disponível"
    },
    {
        id: "video-ads",
        title: "Anúncio em Vídeo",
        description: "Scripts estruturados para VSLs e anúncios curtos.",
        icon: Video,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20",
        href: "/dashboard/generator/video",
        status: "Em breve"
    },
    {
        id: "static-ads",
        title: "Anúncio Estático",
        description: "Headlines e descrições para banners e imagens.",
        icon: ImageIcon,
        color: "text-pink-400",
        bg: "bg-pink-400/10",
        border: "border-pink-400/20",
        href: "/dashboard/generator/static",
        status: "Disponível"
    },
    {
        id: "emails",
        title: "E-mails",
        description: "Sequências de e-mail marketing e newsletters.",
        icon: Mail,
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20",
        href: "/dashboard/generator/email",
        status: "Disponível"
    },
    {
        id: "messages",
        title: "Mensagens",
        description: "Scripts para direct, WhatsApp e abordagens.",
        icon: MessageSquare,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
        href: "/dashboard/generator/messages",
        status: "Disponível"
    },
    {
        id: "instagram",
        title: "Posts Instagram",
        description: "Legendas e ideias para Reels e Feed.",
        icon: Instagram,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
        border: "border-orange-400/20",
        href: "/dashboard/editor?template=instagram", // Redirects to existing editor
        status: "Integrado"
    },
    {
        id: "landing-page",
        title: "Landing Pages",
        description: "Copy completa para páginas de vendas.",
        icon: LayoutTemplate,
        color: "text-teal-400",
        bg: "bg-teal-400/10",
        border: "border-teal-400/20",
        href: "/dashboard/generator/lp",
        status: "Em breve"
    },
    {
        id: "linkedin",
        title: "LinkedIn Content",
        description: "Posts virais e artigos de liderança.",
        icon: Linkedin,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        href: "/dashboard/editor?template=linkedin", // Redirects to existing editor
        status: "Integrado"
    },
];

import { motion } from "framer-motion";

// ... (keep tools array same)

export default function CopyCenterPage() {
    // Animation Variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto p-8">
            <div className="mb-12 text-center animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-electric/20 to-neon/10 mb-6 neon-glow">
                    <Zap className="h-8 w-8 text-neon" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Central de Copys</h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Escolha o formato de conteúdo que deseja gerar. A IA usará o contexto da sua campanha para criar algo único.
                </p>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {tools.map((tool) => (
                    <motion.div key={tool.id} variants={item}>
                        <Link
                            href={tool.href}
                            className={`group relative flex flex-col p-6 rounded-2xl border bg-black/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${tool.border} hover:bg-white/5 h-full`}
                        >
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${tool.bg} ${tool.color}`}>
                                <tool.icon className="h-6 w-6" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
                            <p className="text-sm text-gray-400 flex-grow mb-4 leading-relaxed">{tool.description}</p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${tool.status === 'Disponível' || tool.status === 'Integrado' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-500'
                                    }`}>
                                    {tool.status}
                                </span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
