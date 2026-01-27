"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

const quickSuggestions = [
  "Analise meu último post",
  "Crie um carrossel sobre IA",
  "Mude o tom para mais técnico",
  "Sugira hashtags trending",
  "Agende posts da semana",
];

const initialMessages: Message[] = [
  {
    id: "1",
    role: "ai",
    content:
      "Olá! Sou sua Umbra AI. Posso analisar seu perfil, gerar conteúdo personalizado e otimizar sua presença digital. O que deseja fazer?",
    timestamp: new Date(),
  },
];

export function AiChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: getAiResponse(messageText),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Abrir chat da Umbra AI"
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-electric/20 backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-2xl shadow-electric/20"
        >
          <div className="relative h-12 w-12 transition-transform duration-500 group-hover:rotate-12">
            <Image
              src="/assets/3d/chat_assistant_icon.png"
              alt="Umbra AI Assistant"
              fill
              className="object-contain drop-shadow-[0_0_15px_rgba(157,80,187,0.5)]"
            />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-neon" />
          </span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 flex flex-col glass-strong rounded-2xl neon-glow transition-all duration-300",
            isExpanded
              ? "bottom-4 right-4 left-4 top-4 md:left-auto md:w-[600px]"
              : "bottom-4 right-4 left-4 h-[80vh] md:bottom-6 md:right-6 md:left-auto md:w-[400px] md:h-[560px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/20">
                <Sparkles className="h-4 w-4 text-neon" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Umbra AI
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Central de Comando
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" role="log" aria-live="polite" aria-label="Mensagens do chat">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-electric/20 text-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-neon animate-bounce [animation-delay:0ms]" />
                    <div className="h-2 w-2 rounded-full bg-neon animate-bounce [animation-delay:150ms]" />
                    <div className="h-2 w-2 rounded-full bg-neon animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-border/50">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="shrink-0 rounded-full bg-electric/10 px-3 py-1.5 text-[11px] font-medium text-neon/80 transition-all hover:bg-electric/20 hover:text-neon whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte à Umbra..."
                aria-label="Mensagem para a Umbra AI"
                rows={1}
                className="flex-1 resize-none rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-electric/50"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                aria-label="Enviar mensagem"
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                  input.trim()
                    ? "bg-electric text-white hover:bg-electric/80 neon-glow"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getAiResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("analis") || lower.includes("último post")) {
    return "Analisei seu último post no LinkedIn. O engajamento está 23% acima da média! Seu tom foi 78% técnico e 22% conversacional. Sugiro manter essa proporção — está funcionando muito bem para seu público.";
  }
  if (lower.includes("carrossel") || lower.includes("carousel")) {
    return "Vou criar um carrossel sobre IA com 8 slides. Estrutura sugerida:\n\n1. Hook visual impactante\n2. O problema que a IA resolve\n3-6. 4 aplicações práticas\n7. Dados e resultados\n8. CTA forte\n\nDeseja que eu gere o conteúdo completo?";
  }
  if (lower.includes("tom") || lower.includes("tone")) {
    return "Entendido! Ajustei o tom dos próximos posts para um estilo mais técnico. Os drafts na sua grade de conteúdo já foram atualizados. Quer revisar as mudanças?";
  }
  if (lower.includes("hashtag")) {
    return "Aqui estão as hashtags trending no seu nicho:\n\n#InteligênciaArtificial #TechBrasil #Inovação #FuturoDoTrabalho #IA2025 #Produtividade #StartupLife\n\nSugiro usar 5-7 hashtags por post no LinkedIn e 15-20 no Instagram.";
  }
  if (lower.includes("agend") || lower.includes("semana")) {
    return "Criei um calendário otimizado para a semana:\n\n📅 Seg 09h - LinkedIn (artigo técnico)\n📅 Ter 12h - Instagram (carrossel)\n📅 Qua 08h - LinkedIn (case study)\n📅 Qui 18h - Instagram (reel script)\n📅 Sex 09h - LinkedIn (reflexão)\n\nDeseja ajustar algum horário?";
  }
  return "Entendi! Vou processar sua solicitação. Com base no seu perfil e histórico de engajamento, posso criar conteúdo personalizado ou ajustar sua estratégia. O que mais posso fazer por você?";
}
