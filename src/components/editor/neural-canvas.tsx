"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  List,
  Hash,
  AtSign,
  Smile,
  Image,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Linkedin,
  Instagram,
  Eye,
  Wand2,
  Save,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { generateContent } from "@/actions/ai";
import ReactMarkdown from "react-markdown";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


const platformTemplates = {
  linkedin: {
    maxChars: 3000,
    label: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  instagram: {
    maxChars: 2200,
    label: "Instagram",
    icon: Instagram,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
};

interface NeuralCanvasProps {
  initialPlatform?: "linkedin" | "instagram";
}

export function NeuralCanvas({ initialPlatform = "linkedin" }: NeuralCanvasProps) {
  const [platform, setPlatform] = useState<"linkedin" | "instagram">(
    initialPlatform
  );
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const template = platformTemplates[platform];

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Update platform when prop changes (URL navigation)
  useEffect(() => {
    setPlatform(initialPlatform);
  }, [initialPlatform]);

  const simulateTyping = useCallback((text: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsGenerating(true);
    setContent("");

    let index = 0;
    intervalRef.current = setInterval(() => {
      if (index < text.length) {
        setContent(text.slice(0, index + 1));
        index++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsGenerating(false);
      }
    }, 20);
  }, []);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);

    // Call AI Agent
    const result = await generateContent(content);

    if (result.success && result.content) {
      simulateTyping(result.content);
    } else {
      // Optional: Show error toast
      console.error("AI Generation failed");
      setIsGenerating(false);
    }
  };

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    const newContent =
      content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(newContent);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + before.length + selected.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!content.trim() || !user) return;
    setIsSaving(true);

    // Create a title based on the first few words
    const title = content.split(' ').slice(0, 5).join(' ') + '...';

    try {
      const { error } = await supabase.from('generated_content').insert({
        user_id: user.id,
        type: platform, // 'linkedin' | 'instagram'
        title: title || `Post ${platformTemplates[platform].label}`,
        content: {
          text: content,
          platform: platform,
          date: new Date().toISOString()
        }
      });

      if (error) throw error;
      alert("Texto salvo na biblioteca!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar texto.");
    } finally {
      setIsSaving(false);
    }
  };


  // Preview Logic
  const [isExpanded, setIsExpanded] = useState(false);
  const PREVIEW_LIMIT = 280;
  const shouldTruncate = content.length > PREVIEW_LIMIT;
  const displayContent = isExpanded || !shouldTruncate ? content : content.slice(0, PREVIEW_LIMIT) + "...";

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Editor */}
      <div className="flex-1 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="glass rounded-t-2xl border-b border-border px-4 py-3">
          {/* ... (toolbar content unchanged) ... */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Platform selector */}
              {(
                Object.entries(platformTemplates) as [
                  "linkedin" | "instagram",
                  (typeof platformTemplates)["linkedin"],
                ][]
              ).map(([key, tmpl]) => (
                <button
                  key={key}
                  onClick={() => setPlatform(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                    platform === key
                      ? `${tmpl.bgColor} ${tmpl.color}`
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tmpl.icon className="h-3.5 w-3.5" />
                  {tmpl.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => insertText("**", "**")}
                aria-label="Negrito"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => insertText("_", "_")}
                aria-label="Itálico"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => insertText("\n- ")}
                aria-label="Lista"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => insertText("#")}
                aria-label="Hashtag"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Hash className="h-4 w-4" />
              </button>
              <button
                onClick={() => insertText("@")}
                aria-label="Menção"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <AtSign className="h-4 w-4" />
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label="Emoji"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full border-none p-0 bg-transparent shadow-none" sideOffset={5} align="start">
                  <EmojiPicker
                    theme={"dark" as any}
                    onEmojiClick={(emojiData) => insertText(emojiData.emoji)}
                    lazyLoadEmojis={true}
                  />
                </PopoverContent>
              </Popover>

              <button
                onClick={() => insertText("[imagem]")}
                aria-label="Imagem"
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Image className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Writing area */}
        <div className="glass flex-1 rounded-b-2xl p-6 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => !isGenerating && setContent(e.target.value)}
            placeholder="Comece a escrever ou peça para a IA gerar..."
            className={cn(
              "h-full w-full resize-none bg-transparent text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none pb-16",
              isGenerating && "typing-cursor"
            )}
            readOnly={isGenerating}
          />

          {/* Bottom bar */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-white/5">
            <span className="text-xs text-muted-foreground pl-2">
              {content.length} / {template.maxChars} caracteres
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
                className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors hover:bg-white/10"
              >
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => setContent("")}
                className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors hover:bg-white/10"
              >
                <RotateCcw className="h-3 w-3" />
                Limpar
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors hover:bg-white/10"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {copied ? "Copiado!" : "Copiar"}
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-lg bg-electric px-4 py-1.5 text-xs font-medium text-white transition-all hover:bg-electric/80 neon-glow disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3.5 w-3.5" />
                    Gerar com IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Preview */}
      {showPreview && (
        <div className="w-full lg:w-[380px] shrink-0 h-[400px] lg:h-auto">
          <div className="glass rounded-2xl p-4 h-full overflow-y-auto custom-scrollbar">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Eye className="h-4 w-4 text-neon" />
                Preview
              </h4>
              <button
                onClick={() => setShowPreview(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Esconder
              </button>
            </div>

            {/* Mock social card */}
            <div className="rounded-xl bg-white/5 p-4">
              {/* Profile header */}
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-electric/30 flex items-center justify-center">
                  <span className="text-sm font-semibold text-neon">U</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Usuário
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {platform === "linkedin"
                      ? "Tech Leader • 5k+ seguidores"
                      : "@usuario • 12k seguidores"}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line break-words">
                {content ? (
                  <ReactMarkdown
                    components={{
                      strong: ({ node, ...props }) => <span className="font-bold text-gray-100" {...props} />,
                      em: ({ node, ...props }) => <span className="italic text-gray-300" {...props} />,
                      a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
                    }}
                  >
                    {displayContent}
                  </ReactMarkdown>
                ) : (
                  <span className="text-muted-foreground/50 italic">
                    O conteúdo aparecerá aqui...
                  </span>
                )}
              </div>

              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-xs text-electric hover:underline font-medium"
                >
                  {isExpanded ? "Ver menos" : "Ver mais"}
                </button>
              )}

              {/* Engagement mock */}
              <div className="mt-4 flex items-center gap-4 border-t border-border/30 pt-3">
                {platform === "linkedin" ? (
                  <>
                    <span className="text-xs text-muted-foreground">
                      👍 Curtir
                    </span>
                    <span className="text-xs text-muted-foreground">
                      💬 Comentar
                    </span>
                    <span className="text-xs text-muted-foreground">
                      🔄 Repostar
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ✉️ Enviar
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground">♡</span>
                    <span className="text-xs text-muted-foreground">💬</span>
                    <span className="text-xs text-muted-foreground">✈️</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      🔖
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show preview button when hidden */}
      {!showPreview && (
        <button
          onClick={() => setShowPreview(true)}
          className="fixed right-6 top-1/2 -translate-y-1/2 rounded-l-xl glass px-2 py-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
