
import { Hero3D } from "@/components/landing/hero-3d";
import { TrustBar } from "@/components/landing/trust-bar";
import { ProcessSection } from "@/components/landing/process-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { UseCases } from "@/components/landing/use-cases";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-neon/30 pt-20 selection:text-white pb-20">
      <Hero3D />
      <TrustBar />
      <ProcessSection />
      <FeaturesGrid />
      <UseCases />
      <div id="pricing">
        <Pricing />
      </div>

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
    </div>
  );
}
