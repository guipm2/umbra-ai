import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/components/auth/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Umbra AI - Sua Presença Digital Inteligente",
  description:
    "Gerencie sua presença digital com IA. Análise de perfil e geração autônoma de conteúdo para LinkedIn e Instagram via Umbra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
        <AuthProvider>
          <Navbar />
          <div className="pt-12">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
