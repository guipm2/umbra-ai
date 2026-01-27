
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
    {
        name: "Starter",
        price: "R$ 0",
        description: "Para quem está começando a explorar IA.",
        features: [
            "5 Posts gerados por mês",
            "Análise básica de perfil",
            "1 Canal (Instagram ou LinkedIn)",
        ],
        highlight: false,
    },
    {
        name: "Pro",
        price: "R$ 49",
        description: "Para criadores que buscam crescimento.",
        features: [
            "Posts ilimitados",
            "Análise avançada de voz e tom",
            "Agendamento automático",
            "Suporte prioritário",
        ],
        highlight: true,
    },
    {
        name: "Enterprise",
        price: "Sob Consulta",
        description: "Para agências e grandes marcas.",
        features: [
            "Múltiplos usuários",
            "API de acesso",
            "Relatórios white-label",
            "Gerente de conta dedicado",
        ],
        highlight: false,
    },
];

export function Pricing() {
    return (
        <section className="py-24 px-4 relative overflow-hidden bg-black">
            {/* Background blobs */}
            <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-electric/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-neon/10 rounded-full blur-[120px]" />

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Escolha seu Plano</h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Planos flexíveis que crescem com você. Cancele a qualquer momento.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className={`relative rounded-3xl p-8 border ${plan.highlight
                                    ? "border-neon bg-white/5 shadow-[0_0_30px_-5px_rgba(224,130,255,0.3)]"
                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                } backdrop-blur-sm flex flex-col transition-all group hover:-translate-y-2`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-electric to-neon text-white text-xs font-bold uppercase tracking-wider">
                                    Recomendado
                                </div>
                            )}

                            <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-white">{plan.price}</span>
                                {plan.price !== "Sob Consulta" && <span className="text-gray-400">/mês</span>}
                            </div>
                            <p className="text-gray-400 text-sm mb-8">{plan.description}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-gray-300 text-sm">
                                        <div className={`p-1 rounded-full ${plan.highlight ? "bg-neon/20 text-neon" : "bg-white/10 text-white"}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-4 rounded-xl font-semibold transition-all ${plan.highlight
                                        ? "bg-gradient-to-r from-electric to-neon text-white shadow-lg shadow-neon/25 hover:shadow-neon/40"
                                        : "bg-white text-black hover:bg-gray-100"
                                    }`}
                            >
                                Começar Agora
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
