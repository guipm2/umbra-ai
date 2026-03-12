"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-deep px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white">Erro de Autenticação</h1>
                <p className="text-gray-400">
                    Não foi possível completar o login. O link pode ter expirado ou já ter sido utilizado.
                </p>
                <Link
                    href="/login"
                    className="inline-block px-6 py-3 bg-neon text-black font-bold rounded-lg hover:bg-neon/90 transition-colors"
                >
                    Voltar para o Login
                </Link>
            </div>
        </div>
    );
}
