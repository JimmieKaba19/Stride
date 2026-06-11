import { useEffect, useState } from "react";
import { Flame, Share2, X } from "lucide-react";
import { cn } from "../../utils";
import { STREAK_UNLOCKS } from "../../constants";
import toast from "react-hot-toast";

interface Props {
  streak: number;
  goalName: string;
  onClose: () => void;
}

// Simple confetti burst using CSS
const Confetti = () => {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = [
    "#3B6D11",
    "#97C459",
    "#f59e0b",
    "#3b82f6",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-sm animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            background: colors[i % colors.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${0.6 + Math.random() * 0.8}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
};

const MILESTONE_MESSAGES: Record<
  number,
  { title: string; sub: string; emoji: string }
> = {
  7: {
    title: "One week strong!",
    sub: "You showed up every day for a week. That's not luck, that's discipline.",
    emoji: "🔥",
  },
  14: {
    title: "Two weeks in!",
    sub: "Halfway to 30. You're building something real here.",
    emoji: "💪",
  },
  30: {
    title: "30-day streak!",
    sub: "One month of showing up. Most people quit before this. You didn't.",
    emoji: "🏆",
  },
  60: {
    title: "60 days. Unstoppable.",
    sub: "Two months straight. This is a habit now, it's part of who you are.",
    emoji: "⚡",
  },
  90: {
    title: "90 days. Legend.",
    sub: "A full quarter of consistency. You've earned the right to call this a strength.",
    emoji: "🌟",
  },
  180: {
    title: "Half a year!",
    sub: "180 days of showing up. That's commitment most people only dream about.",
    emoji: "🎯",
  },
  365: {
    title: "One full year!!",
    sub: "A year. 365 days. You didn't just build a habit, you built a new identity.",
    emoji: "👑",
  },
};

export const StreakCelebration = ({ streak, goalName, onClose }: Props) => {
  const [visible, setVisible] = useState(false);
  const msg = MILESTONE_MESSAGES[streak];
  const unlock = STREAK_UNLOCKS[streak];

  useEffect(() => {
    // Slight delay so animation feels intentional
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleShare = () => {
    const text = `Day ${streak}, ${goalName}. Still going. 🔥\n\nBuilding momentum with Stride.`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard, ready to share!");
    }
  };

  if (!msg) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          "relative bg-white rounded-3xl w-full max-w-sm p-8 text-center transition-all duration-500 overflow-hidden",
          visible ? "scale-100 opacity-100" : "scale-90 opacity-0",
        )}
      >
        <Confetti />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-surface-300 hover:text-surface-500"
        >
          <X size={18} />
        </button>

        {/* Streak badge */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-brand-100 rounded-full animate-ping opacity-30" />
          <div className="relative w-24 h-24 bg-brand-50 rounded-full flex flex-col items-center justify-center border-2 border-brand-200">
            <Flame size={28} className="text-orange-500 mb-0.5" />
            <span className="text-2xl font-black text-brand-700 leading-none">
              {streak}
            </span>
          </div>
        </div>

        <div className="text-4xl mb-3">{msg.emoji}</div>
        <h2 className="text-2xl font-black text-surface-900 mb-2">
          {msg.title}
        </h2>
        <p className="text-surface-500 text-sm leading-relaxed mb-2">
          {msg.sub}
        </p>

        {/* Goal name */}
        <div className="inline-block bg-surface-50 rounded-xl px-4 py-2 mb-4">
          <p className="text-xs text-surface-400 mb-0.5">Goal</p>
          <p className="text-sm font-semibold text-surface-800">{goalName}</p>
        </div>

        {/* Feature unlock */}
        {unlock && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 mb-5 text-left">
            <p className="text-xs font-semibold text-brand-600 mb-0.5">
              🎁 Unlocked
            </p>
            <p className="text-sm text-brand-700">{unlock}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 btn-primary gap-2" onClick={handleShare}>
            <Share2 size={15} /> Share this
          </button>
          <button className="btn-secondary px-4" onClick={onClose}>
            Keep going →
          </button>
        </div>
      </div>
    </div>
  );
};
