import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Calendar,
  Plus,
  Check,
  Share2,
  MoreHorizontal,
  Pencil,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useGoal } from "../hooks/useGoals";
import { useAuthStore } from "../store/useAuthStore";
import { ROUTES, GOAL_CATEGORIES, MOOD_CONFIG } from "../constants";
import { cn, formatDate, todayISO } from "../utils";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkInsApi } from "../lib/api/checkins";
import { streaksApi } from "../lib/api/streaks";
import type { Milestone, StreakDay, MoodScore } from "../types";

// ─── Streak heat map ──────────────────────────────────────────────────────────
const HeatMap = ({ goalId }: { goalId: string }) => {
  const { data: days = [] } = useQuery({
    queryKey: ["heatmap", goalId],
    queryFn: () => streaksApi.heatmap(goalId, 91),
  });

  // Build a 91-day grid ending today
  const today = new Date();
  const cells = Array.from({ length: 91 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (90 - i));
    const iso = d.toISOString().split("T")[0];
    const day = days.find((s: StreakDay) => s.date === iso);
    return {
      iso,
      checked: day?.checked_in ?? false,
      freeze: day?.freeze_used ?? false,
    };
  });

  const COLORS = {
    empty: "bg-surface-100",
    done: "bg-brand-500",
    freeze: "bg-blue-200",
  };

  return (
    <div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(13, 1fr)" }}
      >
        {cells.map((c) => (
          <div
            key={c.iso}
            title={c.iso}
            className={cn(
              "aspect-square rounded-sm transition-colors",
              c.freeze ? COLORS.freeze : c.checked ? COLORS.done : COLORS.empty,
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <div className="w-3 h-3 rounded-sm bg-surface-100" /> Missed
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <div className="w-3 h-3 rounded-sm bg-brand-500" /> Checked in
        </div>
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <div className="w-3 h-3 rounded-sm bg-blue-200" /> Freeze used
        </div>
      </div>
    </div>
  );
};

// ─── Milestone item ───────────────────────────────────────────────────────────
const MilestoneItem = ({ ms, goalId }: { ms: Milestone; goalId: string }) => {
  const qc = useQueryClient();

  const toggle = async () => {
    await supabase
      .from("milestones")
      .update({
        completed: !ms.completed,
        completed_at: !ms.completed ? new Date().toISOString() : null,
      })
      .eq("id", ms.id);
    qc.invalidateQueries({ queryKey: ["goals", goalId] });
    toast.success(ms.completed ? "Milestone unmarked" : "Milestone done ✓");
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:bg-surface-50",
        ms.completed ? "border-surface-100 opacity-60" : "border-surface-200",
      )}
      onClick={toggle}
    >
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
          ms.completed
            ? "bg-brand-500 border-brand-500 text-white"
            : "border-surface-300",
        )}
      >
        {ms.completed && <Check size={11} />}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            ms.completed && "line-through text-surface-400",
          )}
        >
          {ms.title}
        </p>
        {ms.due_date && (
          <p className="text-xs text-surface-400 mt-0.5">
            <Calendar size={10} className="inline mr-1" />
            {ms.completed ? "Done" : "Due"} {formatDate(ms.due_date)}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Add milestone form ───────────────────────────────────────────────────────
const AddMilestone = ({
  goalId,
  userId,
  onDone,
}: {
  goalId: string;
  userId: string;
  onDone: () => void;
}) => {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await supabase.from("milestones").insert({
      goal_id: goalId,
      user_id: userId,
      title: title.trim(),
      due_date: due || null,
      completed: false,
      sort_order: Date.now(),
    });
    qc.invalidateQueries({ queryKey: ["goals", goalId] });
    toast.success("Milestone added");
    onDone();
    setSaving(false);
  };

  return (
    <div className="border border-brand-200 bg-brand-50 rounded-xl p-3 space-y-2">
      <input
        className="input bg-white text-sm"
        placeholder="Milestone title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && save()}
      />
      <div className="flex gap-2">
        <input
          className="input bg-white text-sm flex-1"
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
        <button
          className="btn-primary text-sm"
          onClick={save}
          disabled={saving || !title.trim()}
        >
          {saving ? "…" : "Add"}
        </button>
        <button className="btn-secondary text-sm" onClick={onDone}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Check-in modal ───────────────────────────────────────────────────────────
const CheckInModal = ({
  goalId,
  goalType,
  onClose,
}: {
  goalId: string;
  goalType: string;
  onClose: () => void;
}) => {
  const qc = useQueryClient();
  const { profile } = useAuthStore();
  const [mood, setMood] = useState<MoodScore>(3);
  const [note, setNote] = useState("");
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await checkInsApi.create({
        goal_id: goalId,
        user_id: profile.id,
        date: todayISO(),
        mood,
        note: note.trim() || undefined,
        progress_update: goalType === "milestone" ? progress : undefined,
      });

      // Upsert streak day
      await supabase.from("streak_days").upsert({
        goal_id: goalId,
        user_id: profile.id,
        date: todayISO(),
        checked_in: true,
        freeze_used: false,
      });

      // Increment streak on goal (best effort, RPC may not exist yet)
      try {
        await supabase.rpc("increment_streak", { goal_id: goalId });
      } catch {
        /* ok */
      }

      qc.invalidateQueries({ queryKey: ["goals", goalId] });
      qc.invalidateQueries({ queryKey: ["heatmap", goalId] });
      qc.invalidateQueries({ queryKey: ["checkin-today", goalId] });
      toast.success(
        mood >= 4
          ? "Checked in: you're on fire 🔥"
          : mood === 3
            ? "Checked in. Keep going 💪"
            : "Checked in. Showing up on hard days counts most.",
      );
      onClose();
    } catch {
      toast.error("Check-in failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-surface-900">Check in</h3>
          <button onClick={onClose} className="btn-ghost p-1 text-surface-400">
            ✕
          </button>
        </div>

        {/* Mood */}
        <div>
          <p className="text-sm font-medium text-surface-700 mb-3">
            How are you feeling?
          </p>
          <div className="flex justify-between gap-2">
            {(
              Object.entries(MOOD_CONFIG) as [string, (typeof MOOD_CONFIG)[1]][]
            ).map(([score, cfg]) => (
              <button
                key={score}
                onClick={() => setMood(Number(score) as MoodScore)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all",
                  mood === Number(score)
                    ? "border-brand-500 bg-brand-50"
                    : "border-surface-200 hover:border-surface-300",
                )}
              >
                <span className="text-xl">{cfg.emoji}</span>
                <span className="text-xs text-surface-500">{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress (milestone only) */}
        {goalType === "milestone" && (
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
          </div>
        )}

        {/* Note */}
        <div>
          <p className="text-sm font-medium text-surface-700 mb-2">
            Note{" "}
            <span className="text-surface-400 font-normal">(optional)</span>
          </p>
          <textarea
            className="input resize-none text-sm"
            rows={2}
            placeholder="What did you do today? How did it go?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={300}
          />
        </div>

        <button
          className="btn-primary w-full"
          onClick={submit}
          disabled={saving}
        >
          {saving ? "Saving…" : "Submit check-in"}
        </button>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const { data, isLoading } = useGoal(id!);

  const [addingMs, setAddingMs] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Has user checked in today?
  const { data: todayCI } = useQuery({
    queryKey: ["checkin-today", id],
    enabled: !!id && !!profile?.id,
    queryFn: () => checkInsApi.todayForGoal(id!, profile!.id),
  });

  // Recent check-ins
  const { data: recentCIs = [] } = useQuery({
    queryKey: ["checkins", id],
    enabled: !!id,
    queryFn: () => checkInsApi.listForGoal(id!, 5),
  });

  if (isLoading)
    return (
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-4 bg-surface-100 rounded w-3/4 mb-3" />
            <div className="h-3 bg-surface-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );

  if (!data)
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-surface-500">Goal not found.</p>
        <button
          className="btn-secondary mt-4"
          onClick={() => navigate(ROUTES.GOALS)}
        >
          Back to goals
        </button>
      </div>
    );

  const goal = data;
  const milestones = (data.milestones ?? []) as Milestone[];
  const cat = GOAL_CATEGORIES.find((c) => c.value === goal.category)!;
  const doneMsCount = milestones.filter((m) => m.completed).length;

  const archiveGoal = async () => {
    await supabase
      .from("goals")
      .update({ status: "archived" })
      .eq("id", goal.id);
    qc.invalidateQueries({ queryKey: ["goals"] });
    navigate(ROUTES.GOALS);
    toast.success("Goal archived");
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.GOALS)}
          className="btn-ghost p-2 -ml-2"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1" />
        <button
          className="btn-ghost p-2"
          onClick={() => navigate(`/goals/${goal.id}/edit`)}
        >
          <Pencil size={16} />
        </button>
        <div className="relative">
          <button
            className="btn-ghost p-2"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 bg-white border border-surface-200 rounded-xl shadow-lg w-40 py-1 z-10">
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  setMenuOpen(false);
                  archiveGoal();
                }}
              >
                Archive goal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero card */}
      <div className="card p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="badge"
              style={{ background: cat.bg, color: cat.color }}
            >
              {cat.label}
            </span>
            <span className="badge badge-gray">
              {goal.type === "habit" ? "🔁 Habit" : "🎯 Milestone"}
            </span>
          </div>
          {goal.target_date && (
            <span className="text-xs text-surface-400 shrink-0 ml-2">
              Due {formatDate(goal.target_date)}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-surface-900 mt-3 mb-1">
          {goal.title}
        </h1>
        {goal.description && (
          <p className="text-sm text-surface-500 mb-4">{goal.description}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame
                size={16}
                className={
                  goal.current_streak > 0
                    ? "text-orange-500"
                    : "text-surface-300"
                }
              />
              <span className="text-xl font-bold text-surface-900">
                {goal.current_streak}
              </span>
            </div>
            <p className="text-xs text-surface-400">Day streak</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-surface-900 mb-1">
              {goal.longest_streak}
            </div>
            <p className="text-xs text-surface-400">Best streak</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-brand-600 mb-1">
              {goal.type === "milestone"
                ? `${goal.progress}%`
                : `${goal.freeze_count}`}
            </div>
            <p className="text-xs text-surface-400">
              {goal.type === "milestone" ? "Progress" : "Freezes left"}
            </p>
          </div>
        </div>

        {/* Progress bar, milestone only */}
        {goal.type === "milestone" && (
          <div className="mt-4">
            <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Streak heat map */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-4">
          Streak history last 91 days
        </h2>
        <HeatMap goalId={goal.id} />
      </div>

      {/* Milestones milestone goals only */}
      {goal.type === "milestone" && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wide">
                Milestones
              </h2>
              {milestones.length > 0 && (
                <p className="text-xs text-surface-400 mt-0.5">
                  {doneMsCount} of {milestones.length} done
                </p>
              )}
            </div>
            <button
              className="btn-ghost text-xs gap-1.5"
              onClick={() => setAddingMs(true)}
            >
              <Plus size={14} /> Add
            </button>
          </div>

          <div className="space-y-2">
            {milestones
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((ms) => (
                <MilestoneItem key={ms.id} ms={ms} goalId={goal.id} />
              ))}
            {milestones.length === 0 && !addingMs && (
              <p className="text-sm text-surface-400 text-center py-4">
                No milestones yet, break your goal into steps.
              </p>
            )}
            {addingMs && profile && (
              <AddMilestone
                goalId={goal.id}
                userId={profile.id}
                onDone={() => setAddingMs(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Recent check-ins */}
      {recentCIs.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-4">
            Recent check-ins
          </h2>
          <div className="space-y-3">
            {recentCIs.map((ci: any) => {
              const mood = MOOD_CONFIG[ci.mood as MoodScore];
              return (
                <div
                  key={ci.id}
                  className="flex gap-3 py-2 border-b border-surface-100 last:border-0"
                >
                  <div className="text-xs text-surface-400 w-14 shrink-0 pt-0.5">
                    {ci.date}
                  </div>
                  <div className="flex-1 min-w-0">
                    {ci.note && (
                      <p className="text-sm text-surface-800 mb-1">{ci.note}</p>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{mood?.emoji}</span>
                      <span className="text-xs text-surface-400">
                        {mood?.label}
                      </span>
                      {ci.progress_update != null && (
                        <span className="text-xs text-surface-400 ml-2">
                          → {ci.progress_update}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex gap-3 pb-6">
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm transition-all",
            todayCI
              ? "bg-brand-50 text-brand-600 border-2 border-brand-200"
              : "btn-primary",
          )}
          onClick={() => !todayCI && setCheckingIn(true)}
          disabled={!!todayCI}
        >
          {todayCI ? (
            <>
              <CheckCircle2 size={18} /> Checked in today
            </>
          ) : (
            <>
              <Circle size={18} /> Check in today
            </>
          )}
        </button>

        <button
          className="btn-secondary px-4 flex items-center gap-2"
          onClick={() => toast("Shareable card, coming in V2 🎉")}
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Check-in modal */}
      {checkingIn && (
        <CheckInModal
          goalId={goal.id}
          goalType={goal.type}
          onClose={() => setCheckingIn(false)}
        />
      )}
    </div>
  );
}
