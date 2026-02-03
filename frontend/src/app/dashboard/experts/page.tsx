"use client";

import dynamic from "next/dynamic";
import { UserCheck } from "lucide-react";

const AssetManager = dynamic(
    () => import("@/components/dashboard/assets/asset-manager").then((mod) => mod.AssetManager),
    { ssr: false }
);

export default function ExpertsPage() {
    return (
        <div className="max-w-6xl mx-auto p-8">
            <AssetManager
                title="Especialistas"
                description="Cadastre os autores ou personas que assinarão os conteúdos."
                tableName="experts"
                icon={UserCheck}
                fields={[
                    { name: "name", label: "Nome do Especialista", type: "text", placeholder: "Ex: Fulano de Tal" },
                    { name: "tone_of_voice", label: "Tom de Voz", type: "text", placeholder: "Ex: Autoritário, Amigável, Inspirador" },
                    { name: "archetype", label: "Arquétipo", type: "text", placeholder: "Ex: O Mago, O Governante" },
                    { name: "instagram_handle", label: "Instagram (@)", type: "text", placeholder: "@usuario" },
                    { name: "bio", label: "Mini Bio", type: "textarea", placeholder: "Histórico breve..." },
                ]}
                renderCard={(item) => (
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-electric to-neon flex items-center justify-center shrink-0">
                            <span className="font-bold text-white">{item.name?.[0]}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-white truncate pr-6 leading-tight">{item.name}</h3>
                            <p className="text-xs text-neon mt-0.5">{item.instagram_handle}</p>
                            <div className="mt-3 flex gap-2">
                                <span className="text-[10px] uppercase tracking-wider bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/5">
                                    {item.tone_of_voice || "Neutro"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
