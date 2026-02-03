"use client";

import dynamic from "next/dynamic";
import { Package } from "lucide-react";

const AssetManager = dynamic(
    () => import("@/components/dashboard/assets/asset-manager").then((mod) => mod.AssetManager),
    { ssr: false }
);

export default function ProductsPage() {
    return (
        <div className="max-w-6xl mx-auto p-8">
            <AssetManager
                title="Meus Produtos"
                description="Gerencie os produtos ou serviços que você vende."
                tableName="products"
                icon={Package}
                fields={[
                    { name: "name", label: "Nome do Produto", type: "text", placeholder: "Ex: Curso de Marketing Digital" },
                    { name: "offer_description", label: "Descrição da Oferta", type: "textarea", placeholder: "O que está sendo entregue?" },
                    { name: "price_info", label: "Preço e Condições", type: "text", placeholder: "Ex: R$ 997 à vista" },
                    { name: "main_promise", label: "Promessa Principal", type: "textarea", placeholder: "Qual a grande transformação?" },
                ]}
                renderCard={(item) => (
                    <div>
                        <h3 className="font-semibold text-white truncate pr-6">{item.name}</h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2 min-h-[40px]">{item.main_promise || item.offer_description}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs bg-electric/10 text-electric px-2 py-1 rounded-md border border-electric/20 font-mono">
                                {item.price_info || "Preço não definido"}
                            </span>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
