"use client";

import { AssetManager } from "@/components/dashboard/assets/asset-manager";
import { Users } from "lucide-react";

export default function AudiencesPage() {
    return (
        <div className="max-w-6xl mx-auto p-8">
            <AssetManager
                title="Públicos Alvo"
                description="Defina quem são as pessoas que compram de você."
                tableName="audiences"
                icon={Users}
                fields={[
                    { name: "name", label: "Nome do Público", type: "text", placeholder: "Ex: Jovens Empreendedores" },
                    { name: "description", label: "Descrição Detalhada", type: "textarea", placeholder: "Quem são, o que fazem, o que buscam?" },
                    { name: "age_range", label: "Faixa Etária", type: "text", placeholder: "Ex: 25-34 anos" },
                    { name: "interests", label: "Interesses (Separados por vírgula)", type: "tags", placeholder: "Ex: Marketing, Vendas, Tecnologia" },
                ]}
                renderCard={(item) => (
                    <div>
                        <h3 className="font-semibold text-white truncate pr-6">{item.name}</h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2 min-h-[40px]">{item.description}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-md border border-white/5">
                                {item.age_range || "N/A"}
                            </span>
                            {/* Parse interests if it's a string, assuming input is comma separated */}
                            {/* For simplicity we just show one badge or text in list */}
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
