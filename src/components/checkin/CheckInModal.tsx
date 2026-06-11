import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X, Snowflake, CheckCircle2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { checkInsApi } from "../../lib/api/checkins";
import { useAuthStore } from "../../store/useAuthStore";
import { StreakCelebration } from "../streak/StreakCelebration";
import { MOOD_CONFIG, STREAK_MILESTONES } from "../../constants";
import { cn, todayISO } from "../../utils";
import toast from "react-hot-toast";
import type { Goal, MoodScore } from "../../types";

interface Props {
  goal: Goal;
  onClose: () => void;
}

type Mode = "checkin" | "freeze";

export const CheckInModal = ({ goal, onClose }: Props) => {
  const qc = useQueryClient();
  const { profile } = useAuthStore();
  const [mode, setMode] = useState<Mode>("checkin");
  const [mood, setMood] = useState<MoodScore>(3);
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(goal.progress);
  const [saving, setSaving] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);

  const canFreeze = goal.freeze_count > 0;

  const submitCheckIn = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      // Save check-in
      await checkInsApi.create({
        goal_id: goal.id,
        user_id: profile.id,
        date: todayISO(),
        mood,
        note: note.trim() || undefined,
        progress_update: goal.type === "milestone" ? progress : undefined,
      });

      // Record streak day
      await supabase.from("streak_days").upsert({
        goal_id: goal.id,
        user_id: profile.id,
        date: todayISO(),
        checked_in: true,
        freeze_used: false,
      });

      // Increment streak returns new streak count
      let newStreak = goal.current_streak;
      try {
        const { data } = await supabase.rpc("increment_streak", {
          goal_id: goal.id,
        });
        if (typeof data === "number") newStreak = data;
      } catch {
        /* ok */
      }

      // Update progress for milestone goals
      if (goal.type === "milestone" && progress !== goal.progress) {
        await supabase.from("goals").update({ progress }).eq("id", goal.id);
      }

      invalidateAll();

      // Check if we hit a streak milestone
      const hitMilestone = STREAK_MILESTONES.find((m) => m === newStreak);
      if (hitMilestone) {
        setMilestone(hitMilestone);
        setSaving(false);
        return; // celebration modal takes over
      }

      toast.success(
        mood >= 4
          ? "Checked in: you're on fire 🔥"
          : mood === 3
            ? "Checked in. Keep going 💪"
            : "Checked in. Showing up on hard days counts most. 🤝",
      );
      onClose();
    } catch {
      toast.error("Check-in failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const submitFreeze = async () => {
    if (!profile || !canFreeze) return;
    setSaving(true);
    try {
      await supabase.from("streak_days").upsert({
        goal_id: goal.id,
        user_id: profile.id,
        date: todayISO(),
        checked_in: false,
        freeze_used: true,
      });
      await supabase
        .from("goals")
        .update({ freeze_count: goal.freeze_count - 1 })
        .eq("id", goal.id);

      invalidateAll();
      toast.success(
        `Streak protected ❄️ ${goal.freeze_count - 1} freeze${goal.freeze_count - 1 !== 1 ? "s" : ""} remaining`,
      );
      onClose();
    } catch {
      toast.error("Could not apply freeze. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["goals"] });
    qc.invalidateQueries({ queryKey: ["heatmap", goal.id] });
    qc.invalidateQueries({ queryKey: ["checkin-today", goal.id] });
    qc.invalidateQueries({ queryKey: ["checkins", goal.id] });
    qc.invalidateQueries({ queryKey: ["all-checkins-today"] });
  };

  // ── Milestone celebration takes over the screen ───────────────────────────
  if (milestone) {
    return (
      <StreakCelebration
        streak={milestone}
        goalName={goal.title}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm animate-slide-up overflow-hidden">
        {/* Mode tabs */}
        <div className="flex border-b border-surface-100">
          <button
            onClick={() => setMode("checkin")}
            className={cn(
              "flex-1 py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              mode === "checkin"
                ? "text-brand-600 border-b-2 border-brand-500"
                : "text-surface-400 hover:text-surface-600",
            )}
          >
            <CheckCircle2 size={15} /> Check in
          </button>
          <button
            onClick={() => setMode("freeze")}
            className={cn(
              "flex-1 py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              mode === "freeze"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-surface-400 hover:text-surface-600",
            )}
          >
            <Snowflake size={15} /> Use freeze
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                canFreeze
                  ? "bg-blue-100 text-blue-600"
                  : "bg-surface-100 text-surface-400",
              )}
            >
              {goal.freeze_count}
            </span>
          </button>
          <button
            onClick={onClose}
            className="px-4 text-surface-300 hover:text-surface-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Goal name */}
          <div className="bg-surface-50 rounded-xl px-4 py-3">
            <p className="text-xs text-surface-400 mb-0.5">Goal</p>
            <p className="text-sm font-medium text-surface-900 truncate">
              {goal.title}
            </p>
          </div>

          {/* ── CHECK-IN MODE ── */}
          {mode === "checkin" && (
            <>
              <div>
                <p className="text-sm font-medium text-surface-700 mb-3">
                  How are you feeling?
                </p>
                <div className="flex gap-2">
                  {(
                    Object.entries(MOOD_CONFIG) as [
                      string,
                      (typeof MOOD_CONFIG)[1],
                    ][]
                  ).map(([score, cfg]) => (
                    <button
                      key={score}
                      onClick={() => setMood(Number(score) as MoodScore)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all",
                        mood === Number(score)
                          ? "border-brand-500 bg-brand-50"
                          : "border-surface-200 hover:border-surface-300",
                      )}
                    >
                      <span className="text-xl">{cfg.emoji}</span>
                      <span className="text-xs text-surface-500 leading-none">
                        {cfg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {goal.type === "milestone" && (
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm font-medium text-surface-700">
                      Progress update
                    </p>
                    <span className="text-sm font-bold text-brand-600">
                      {progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full accent-brand-500"
                  />
                  <div className="flex justify-between text-xs text-surface-400 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-surface-700 mb-2">
                  Note{" "}
                  <span className="text-surface-400 font-normal">
                    (optional)
                  </span>
                </p>
                <textarea
                  className="input resize-none text-sm"
                  rows={2}
                  placeholder="What did you do? How did it go?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={300}
                />
              </div>

              <button
                className="btn-primary w-full"
                onClick={submitCheckIn}
                disabled={saving}
              >
                {saving ? "Saving…" : "Submit check-in"}
              </button>
            </>
          )}

          {/* ── FREEZE MODE ── */}
          {mode === "freeze" && (
            <>
              <div className="text-center py-2">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Snowflake size={32} className="text-blue-400" />
                </div>
                <h3 className="font-semibold text-surface-900 mb-2">
                  Protect your streak
                </h3>
                <p className="text-sm text-surface-500 leading-relaxed">
                  Life happens. Use a freeze to protect your streak for today,
                  but you still need to check in tomorrow.
                </p>
              </div>

              <div className="bg-surface-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500">Current streak</span>
                  <span className="font-semibold">
                    {goal.current_streak} days 🔥
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Freezes remaining</span>
                  <span
                    className={cn(
                      "font-semibold",
                      canFreeze ? "text-blue-600" : "text-red-500",
                    )}
                  >
                    {goal.freeze_count} {canFreeze ? "❄️" : " none left"}
                  </span>
                </div>
              </div>

              {!canFreeze && (
                <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 text-center">
                  No freezes left this month. Check in or your streak will
                  reset.
                </div>
              )}

              <button
                className={cn(
                  "w-full py-3 rounded-2xl font-medium text-sm transition-all",
                  canFreeze
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-surface-100 text-surface-400 cursor-not-allowed",
                )}
                onClick={submitFreeze}
                disabled={!canFreeze || saving}
              >
                {saving
                  ? "Applying…"
                  : canFreeze
                    ? "Use freeze for today ❄️"
                    : "No freezes available"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
