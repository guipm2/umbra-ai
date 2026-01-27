"use client";

import { useSearchParams } from "next/navigation";
import { NeuralCanvas } from "@/components/editor/neural-canvas";
import { Suspense } from "react";

function EditorContent() {
  const searchParams = useSearchParams();
  const template = searchParams.get("template");
  const initialPlatform = (template === "instagram" ? "instagram" : "linkedin") as "linkedin" | "instagram";

  return <NeuralCanvas initialPlatform={initialPlatform} />;
}

export default function EditorPage() {
  return (
    <div className="h-[calc(100vh-48px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Neural Canvas</h1>
        <p className="text-sm text-muted-foreground">
          Editor inteligente com preview em tempo real
        </p>
      </div>
      <div className="h-[calc(100%-60px)]">
        <Suspense fallback={<div>Carregando editor...</div>}>
          <EditorContent />
        </Suspense>
      </div>
    </div>
  );
}
