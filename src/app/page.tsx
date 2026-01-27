
import { Hero3D } from "@/components/landing/hero-3d";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer"; // Assuming we'll create this or stub it

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black selection:bg-neon selection:text-white">
      <Hero3D />
      {/* Additional sections can verify vertical rhythm */}
      <Pricing />

      <footer className="py-8 bg-black border-t border-white/10 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>© 2026 Umbra AI. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
