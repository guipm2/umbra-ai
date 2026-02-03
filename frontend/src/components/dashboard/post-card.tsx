"use client";

import { useState } from "react";
import {
  Check,
  RefreshCw,
  Edit3,
  Linkedin,
  Instagram,
  Clock,
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  platform: "linkedin" | "instagram";
  content: string;
  scheduledFor?: string;
  status: "pending" | "approved" | "published";
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export function PostCard({
  platform,
  content,
  scheduledFor,
  status,
  engagement,
}: PostCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  const PlatformIcon = platform === "linkedin" ? Linkedin : Instagram;
  const platformColor =
    platform === "linkedin" ? "text-blue-400" : "text-pink-400";
  const platformLabel = platform === "linkedin" ? "LinkedIn" : "Instagram";

  return (
    <div className="glass rounded-xl p-4 transition-all duration-300 hover:neon-glow group">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlatformIcon className={cn("h-4 w-4", platformColor)} />
          <span className="text-xs font-medium text-muted-foreground">
            {platformLabel}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              currentStatus === "pending" &&
                "bg-yellow-500/10 text-yellow-400",
              currentStatus === "approved" &&
                "bg-green-500/10 text-green-400",
              currentStatus === "published" &&
                "bg-electric/15 text-neon"
            )}
          >
            {currentStatus === "pending" && "Pendente"}
            {currentStatus === "approved" && "Aprovado"}
            {currentStatus === "published" && "Publicado"}
          </span>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content preview */}
      <p className="mb-3 text-sm leading-relaxed text-foreground/90 line-clamp-4">
        {content}
      </p>

      {/* Schedule info */}
      {scheduledFor && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Agendado: {scheduledFor}</span>
        </div>
      )}

      {/* Engagement stats */}
      {engagement && (
        <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            {engagement.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {engagement.comments}
          </span>
          <span className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            {engagement.shares}
          </span>
        </div>
      )}

      {/* Actions */}
      {currentStatus === "pending" && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={() => setCurrentStatus("approved")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-electric/15 px-3 py-2 text-xs font-medium text-neon transition-all hover:bg-electric/25 hover:neon-glow"
          >
            <Check className="h-3.5 w-3.5" />
            Aprovar
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            Regerar
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/80 hover:text-foreground">
            <Edit3 className="h-3.5 w-3.5" />
            Editar
          </button>
        </div>
      )}
    </div>
  );
}
