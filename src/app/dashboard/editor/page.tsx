"use client";

import { NeuralCanvas } from "@/components/editor/neural-canvas";

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
        <NeuralCanvas />
      </div>
    </div>
  );
}
