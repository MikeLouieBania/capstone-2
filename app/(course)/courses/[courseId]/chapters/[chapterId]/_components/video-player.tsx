"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  playbackId: string | null;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
}

export const VideoPlayer = ({
  playbackId,
  courseId,
  chapterId,
  nextChapterId,
  completeOnEnd,
  isLocked,
  title,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const handleVideoReady = () => {
    setIsReady(true);
  };

  const handleVideoEnd = async () => {
    if (completeOnEnd) {
      try {
        await fetch(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed: true }),
        });

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      } catch (error) {
        console.error("Failed to mark chapter as complete:", error);
      }
    }
  };

  return (
    <div className="relative aspect-video">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}
      {!isLocked && playbackId && (
        <video
          src={playbackId}
          controls
          className={cn(
            "w-full h-full",
            !isReady && "hidden"
          )}
          onCanPlay={handleVideoReady}
          onEnded={handleVideoEnd}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};