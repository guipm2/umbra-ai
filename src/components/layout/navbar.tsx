
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/20 transition-colors group-hover:bg-electric/30">
                            <Sparkles className="h-4 w-4 text-neon" />
                        </div>
                        <span className="font-bold text-white tracking-wide">Umbra</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <Link href="#" className="hover:text-neon transition-colors">
                            Features
                        </Link>
                        <Link href="#" className="hover:text-neon transition-colors">
                            Pricing
                        </Link>
                        <Link href="#" className="hover:text-neon transition-colors">
                            About
                        </Link>
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
                            <Link href="#" onClick={() => setMobileMenuOpen(false)}>
                                Features
                            </Link>
                            <Link href="#" onClick={() => setMobileMenuOpen(false)}>
                                Pricing
                            </Link>
                            <Link href="#" onClick={() => setMobileMenuOpen(false)}>
                                About
                            </Link>
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
