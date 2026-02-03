
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useSpring, animate } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        setMobileMenuOpen(false);

        const element = document.getElementById(id);
        if (element) {
            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 100;

            animate(window.scrollY, targetPosition, {
                type: "spring",
                stiffness: 50,
                damping: 15,
                mass: 1,
                onUpdate: (latest) => window.scrollTo(0, latest)
            });
        }
    };

    const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        animate(window.scrollY, 0, {
            type: "spring",
            stiffness: 50,
            damping: 15,
            mass: 1,
            onUpdate: (latest) => window.scrollTo(0, latest)
        });
    };

    // Regra 1: Não mostrar no Dashboard (após login)
    if (pathname?.startsWith("/dashboard")) return null;

    // Regra 2: Em Login/Onboarding, mostrar apenas botão de retorno
    if (pathname === "/login" || pathname === "/onboarding") {
        return (
            <nav className="fixed top-6 left-6 z-50">
                <Link
                    href="/"
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-neon hover:scale-110 transition-transform shadow-[0_0_15px_-3px_rgba(224,130,255,0.3)]"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
            </nav>
        );
    }

    // Regra 3: Navbar Padrão (Landing Page)
    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`fixed top-4 left-0 right-0 z-50 mx-auto w-full max-w-5xl px-4 transition-all duration-300 ${isScrolled ? "py-0" : "py-2"
                    }`}
            >
                <div
                    className={`relative flex items-center justify-between rounded-full border border-white/10 px-6 py-3 shadow-lg backdrop-blur-md transition-all duration-300 ${isScrolled ? "bg-black/80" : "bg-white/5"
                        }`}
                >
                    {/* Logo */}
                    <a href="#" onClick={scrollToTop} className="flex items-center gap-2 group cursor-pointer">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/20 transition-colors group-hover:bg-electric/30">
                            <Sparkles className="h-4 w-4 text-neon" />
                        </div>
                        <span className="font-bold text-white tracking-wide">Umbra</span>
                    </a>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <a href="#features-grid" className="hover:text-neon transition-colors cursor-pointer" onClick={(e) => scrollToSection(e, 'features-grid')}>
                            Funcionalidades
                        </a>
                        <a href="#use-cases" className="hover:text-neon transition-colors cursor-pointer" onClick={(e) => scrollToSection(e, 'use-cases')}>
                            Exemplos
                        </a>
                        <a href="#pricing" className="hover:text-neon transition-colors cursor-pointer" onClick={(e) => scrollToSection(e, 'pricing')}>
                            Planos
                        </a>
                    </div>

                    {/* User Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="px-5 py-2 rounded-full bg-white/10 border border-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-5 py-2 rounded-full bg-gradient-to-r from-electric to-neon text-white text-sm font-bold shadow-lg shadow-neon/20 hover:shadow-neon/40 hover:scale-105 transition-all"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 text-center text-xl font-medium text-white">
                            <a href="#features-grid" onClick={(e) => scrollToSection(e, 'features-grid')}>
                                Funcionalidades
                            </a>
                            <a href="#use-cases" onClick={(e) => scrollToSection(e, 'use-cases')}>
                                Exemplos
                            </a>
                            <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')}>
                                Planos
                            </a>
                            <hr className="border-white/10" />
                            <Link
                                href={user ? "/dashboard" : "/login"}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-neon"
                            >
                                {user ? "Go to Dashboard" : "Login / Signup"}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
