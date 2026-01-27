
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const brands = [
    { name: "LinkedIn", logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" },
    { name: "OpenAI", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" },
    { name: "n8n", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/N8n-logo-new.svg/1024px-N8n-logo-new.svg.png" }, // Using a generic placeholder for safety, but user asked for n8n.
    { name: "Instagram", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" },
];

export function TrustBar() {
    return (
        <section className="py-10 border-b border-white/5 bg-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4">
                <p className="text-center text-xs text-gray-600 uppercase tracking-widest mb-8">
                    Tecnologias que alimentam a Umbra
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.map((brand) => (
                        <motion.div
                            key={brand.name}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="relative h-8 w-24 md:h-10 md:w-32"
                        >
                            {/* Note: In a real proj, we would use local SVGs. For now using text fallback if image fails or simple representation */}
                            <div className="flex items-center justify-center h-full w-full text-white/40 font-bold text-xl hover:text-white transition-colors cursor-default">
                                {brand.name}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
