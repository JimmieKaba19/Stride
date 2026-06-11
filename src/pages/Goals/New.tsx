import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Target,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useCreateGoal } from "../../hooks/useGoals";
import { useAuthStore } from "../../store/useAuthStore";
import { ROUTES, GOAL_CATEGORIES } from "../../constants";
import { cn } from "../../utils";
import type { GoalType, GoalCategory } from "../../types";
import toast from "react-hot-toast";

// ─── Step types ───────────────────────────────────────────────────────────────
const STEPS = ["type", "name", "category", "details", "review"] as const;
type Step = (typeof STEPS)[number];

interface FormState {
  type: GoalType;
  title: string;
  description: string;
  category: GoalCategory;
  target_date: string;
  checkin_time: string;
}

const INITIAL: FormState = {
  type: "habit",
  title: "",
  description: "",
  category: "personal",
  target_date: "",
  checkin_time: "20:00",
};

// ─── Progress bar ─────────────────────────────────────────────────────────────
const StepBar = ({ current }: { current: Step }) => {
  const idx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={cn(
            "h-1 rounded-full flex-1 transition-all duration-300",
            i < idx
              ? "bg-brand-500"
              : i === idx
                ? "bg-brand-400"
                : "bg-surface-200",
          )}
        />
      ))}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NewGoal() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const createGoal = useCreateGoal();
  const [step, setStep] = useState<Step>("type");
  const [form, setForm] = useState<FormState>(INITIAL);

  const set = (key: keyof FormState, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const back = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else navigate(-1);
  };

  const handleSubmit = async () => {
    if (!profile) return;
    try {
      await createGoal.mutateAsync({
        user_id: profile.id,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        category: form.category,
        target_date: form.target_date || undefined,
        checkin_time: form.checkin_time,
        status: "active",
        progress: 0,
        current_streak: 0,
        longest_streak: 0,
        freeze_count: 2,
      });
      toast.success("Goal created, let's build that streak 🔥");
      navigate(ROUTES.GOALS);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  const cat = GOAL_CATEGORIES.find((c) => c.value === form.category)!;

  return (
    <div className="max-w-lg mx-auto px-6 py-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={back} className="btn-ghost p-2 -ml-2">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">New goal</h1>
      </div>

      <StepBar current={step} />

      {/* ── STEP 1: Type ────────────────────────────────────────────────── */}
      {step === "type" && (
        <div className="animate-fade-in space-y-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">What kind of goal?</h2>
            <p className="text-surface-500 text-sm">
              These track differently, pick the right one.
            </p>
          </div>

          <button
            onClick={() => {
              set("type", "habit");
              next();
            }}
            className={cn(
              "w-full text-left p-5 rounded-2xl border-2 transition-all group",
              form.type === "habit"
                ? "border-brand-500 bg-brand-50"
                : "border-surface-200 hover:border-surface-300 bg-white",
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Flame size={20} className="text-orange-500" />
              </div>
              <div>
                <div className="font-semibold text-surface-900">
                  Daily habit
                </div>
                <div className="text-xs text-surface-500">
                  Builds a streak every day
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-surface-300 ml-auto group-hover:text-surface-500 transition-colors"
              />
            </div>
            <p className="text-sm text-surface-500 pl-13">
              Something you do every single day. Missing a day breaks your
              streak.
              <br />
              <span className="text-surface-400 text-xs mt-1 block">
                e.g. "Meditate daily", "Read 20 pages", "Exercise"
              </span>
            </p>
          </button>

          <button
            onClick={() => {
              set("type", "milestone");
              next();
            }}
            className={cn(
              "w-full text-left p-5 rounded-2xl border-2 transition-all group",
              form.type === "milestone"
                ? "border-brand-500 bg-brand-50"
                : "border-surface-200 hover:border-surface-300 bg-white",
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Target size={20} className="text-blue-500" />
              </div>
              <div>
                <div className="font-semibold text-surface-900">
                  Milestone project
                </div>
                <div className="text-xs text-surface-500">
                  Tracks progress to a deadline
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-surface-300 ml-auto group-hover:text-surface-500 transition-colors"
              />
            </div>
            <p className="text-sm text-surface-500">
              A goal with steps and a deadline. Each milestone ticked moves a
              progress bar.
              <br />
              <span className="text-surface-400 text-xs mt-1 block">
                e.g. "Get GICSP certified by September", "Launch Stride V1"
              </span>
            </p>
          </button>
        </div>
      )}

      {/* ── STEP 2: Name ────────────────────────────────────────────────── */}
      {step === "name" && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Name your goal</h2>
            <p className="text-surface-500 text-sm">
              Be specific. Vague goals get skipped.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">
                Goal title <span className="text-red-400">*</span>
              </label>
              <input
                className="input"
                type="text"
                placeholder={
                  form.type === "habit"
                    ? "e.g. Read 20 pages every day"
                    : "e.g. Earn GICSP certification"
                }
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                autoFocus
                maxLength={80}
              />
              <p className="text-xs text-surface-400 mt-1.5 text-right">
                {80 - form.title.length} characters remaining
              </p>
            </div>

            <div>
              <label className="label">
                Description
                <span className="text-surface-400 font-normal ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="What does success look like? Why does this matter to you?"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                maxLength={300}
              />
            </div>

            <button
              className="btn-primary w-full"
              onClick={next}
              disabled={form.title.trim().length < 3}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Category ────────────────────────────────────────────── */}
      {step === "category" && (
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">What area of life?</h2>
            <p className="text-surface-500 text-sm">
              Helps you see where your energy goes over time.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {GOAL_CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  set("category", c.value);
                  next();
                }}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  form.category === c.value
                    ? "border-brand-500 bg-brand-50"
                    : "border-surface-200 hover:border-surface-300 bg-white",
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 text-sm font-bold"
                  style={{ background: c.bg, color: c.color }}
                >
                  {c.label[0]}
                </div>
                <div className="font-medium text-surface-900 text-sm">
                  {c.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 4: Details ─────────────────────────────────────────────── */}
      {step === "details" && (
        <div className="animate-fade-in space-y-5">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">A few more details</h2>
            <p className="text-surface-500 text-sm">
              Set your reminder time and deadline.
            </p>
          </div>

          {/* Target date, milestone only */}
          {form.type === "milestone" && (
            <div>
              <label className="label">
                <Calendar size={14} className="inline mr-1.5 mb-0.5" />
                Target date <span className="text-red-400">*</span>
              </label>
              <input
                className="input"
                type="date"
                value={form.target_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("target_date", e.target.value)}
              />
              <p className="text-xs text-surface-400 mt-1.5">
                Creates a deadline. When is done, done?
              </p>
            </div>
          )}

          {/* Check-in time */}
          <div>
            <label className="label">
              <Clock size={14} className="inline mr-1.5 mb-0.5" />
              Daily reminder time
            </label>
            <input
              className="input"
              type="time"
              value={form.checkin_time}
              onChange={(e) => set("checkin_time", e.target.value)}
            />
            <p className="text-xs text-surface-400 mt-1.5">
              We'll nudge you to check in at this time every day. 8:00 PM works
              well for most people.
            </p>
          </div>

          <button
            className="btn-primary w-full"
            onClick={next}
            disabled={form.type === "milestone" && !form.target_date}
          >
            Review goal →
          </button>
        </div>
      )}

      {/* ── STEP 5: Review ──────────────────────────────────────────────── */}
      {step === "review" && (
        <div className="animate-fade-in space-y-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Looks good?</h2>
            <p className="text-surface-500 text-sm">
              Review your goal before we start the clock.
            </p>
          </div>

          {/* Summary card */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  form.type === "habit" ? "bg-orange-100" : "bg-blue-100",
                )}
              >
                {form.type === "habit" ? (
                  <Flame size={20} className="text-orange-500" />
                ) : (
                  <Target size={20} className="text-blue-500" />
                )}
              </div>
              <div>
                <p className="font-semibold text-surface-900">{form.title}</p>
                <p className="text-xs text-surface-500 capitalize">
                  {form.type === "habit" ? "Daily habit" : "Milestone project"}
                </p>
              </div>
            </div>

            {form.description && (
              <p className="text-sm text-surface-600 border-t border-surface-100 pt-3">
                {form.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 border-t border-surface-100 pt-3">
              <div>
                <p className="text-xs text-surface-400 mb-1">Category</p>
                <span
                  className="badge text-xs font-medium"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  {cat.label}
                </span>
              </div>
              {form.target_date && (
                <div>
                  <p className="text-xs text-surface-400 mb-1">Target date</p>
                  <p className="text-sm font-medium text-surface-900">
                    {new Date(
                      form.target_date + "T00:00:00",
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-surface-400 mb-1">Daily reminder</p>
                <p className="text-sm font-medium text-surface-900">
                  {form.checkin_time}
                </p>
              </div>
            </div>
          </div>

          <button
            className="btn-primary w-full"
            onClick={handleSubmit}
            disabled={createGoal.isPending}
          >
            {createGoal.isPending ? "Creating…" : "Start this goal 🔥"}
          </button>

          <button
            className="btn-ghost w-full text-sm"
            onClick={() => setStep("type")}
          >
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
