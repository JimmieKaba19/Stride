import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame } from "lucide-react";
import { supabase } from "../lib/supabase";
import { goalsApi } from "../lib/api/goals";
import { useAuthStore } from "../store/useAuthStore";
import { ROUTES, GOAL_CATEGORIES, APP_NAME } from "../constants";
import { cn } from "../utils";
import type { GoalType, GoalCategory, Profile } from "../types";

const STEPS = [
  "welcome",
  "goal-type",
  "goal-name",
  "category",
  "checkin-time",
  "done",
] as const;
type Step = (typeof STEPS)[number];

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, setProfile } = useAuthStore();

  const [step, setStep] = useState<Step>("welcome");
  const [goalType, setGoalType] = useState<GoalType>("habit");
  const [goalName, setGoalName] = useState("");
  const [category, setCategory] = useState<GoalCategory>("personal");
  const [checkinTime, setCheckinTime] = useState("20:00");
  const [loading, setLoading] = useState(false);

  const next = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const finish = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Create first goal
      await goalsApi.create({
        user_id: profile.id,
        title: goalName,
        type: goalType,
        category,
        checkin_time: checkinTime,
        status: "active",
        progress: 0,
        current_streak: 0,
        longest_streak: 0,
        freeze_count: 2,
      });

      // Mark user as onboarded
      await supabase
        .from("profiles")
        .update({ onboarded: true })
        .eq("id", profile.id);

      setProfile({ ...profile, onboarded: true } as Profile);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.filter((s) => s !== "done").map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                STEPS.indexOf(step) > i
                  ? "bg-brand-600 w-6"
                  : step === s
                    ? "bg-brand-400 w-6"
                    : "bg-surface-200 w-3",
              )}
            />
          ))}
        </div>

        <div className="card p-8 animate-fade-in">
          {/* STEP: Welcome */}
          {step === "welcome" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Flame size={32} className="text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold mb-3">
                Welcome to {APP_NAME}
                {profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-surface-500 mb-8 leading-relaxed">
                Let's set up your first goal. It takes 60 seconds and you'll be
                accountable before you leave this page.
              </p>
              <button className="btn-primary w-full" onClick={next}>
                Let's go →
              </button>
            </div>
          )}

          {/* STEP: Goal type */}
          {step === "goal-type" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">What kind of goal?</h2>
              <p className="text-surface-500 text-sm mb-6">
                These track differently, pick the right one.
              </p>
              <div className="space-y-3 mb-8">
                <button
                  onClick={() => setGoalType("habit")}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all",
                    goalType === "habit"
                      ? "border-brand-500 bg-brand-50"
                      : "border-surface-200 hover:border-surface-300",
                  )}
                >
                  <div className="font-medium mb-1">🔁 Daily habit</div>
                  <div className="text-sm text-surface-500">
                    Something you do every day, builds a streak. e.g. "Meditate
                    daily", "Read 20 pages"
                  </div>
                </button>
                <button
                  onClick={() => setGoalType("milestone")}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border-2 transition-all",
                    goalType === "milestone"
                      ? "border-brand-500 bg-brand-50"
                      : "border-surface-200 hover:border-surface-300",
                  )}
                >
                  <div className="font-medium mb-1">🎯 Milestone project</div>
                  <div className="text-sm text-surface-500">
                    A goal with a deadline and steps, tracks progress. e.g. "Get
                    GICSP certified by September", "Launch my website by end of
                    month", "Lose 10 kg by December"
                  </div>
                </button>
              </div>
              <button className="btn-primary w-full" onClick={next}>
                Continue →
              </button>
            </div>
          )}

          {/* STEP: Goal name */}
          {step === "goal-name" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Name your goal</h2>
              <p className="text-surface-500 text-sm mb-6">
                Be specific. Vague goals get skipped.
              </p>
              <input
                className="input mb-2"
                type="text"
                placeholder={
                  goalType === "habit"
                    ? "e.g. Read 20 pages every day"
                    : "e.g. Earn GICSP certification"
                }
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                autoFocus
                maxLength={80}
              />
              <p className="text-xs text-surface-400 mb-8">
                {80 - goalName.length} characters remaining
              </p>
              <button
                className="btn-primary w-full"
                onClick={next}
                disabled={goalName.trim().length < 3}
              >
                Continue →
              </button>
            </div>
          )}

          {/* STEP: Category */}
          {step === "category" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">What area of life?</h2>
              <p className="text-surface-500 text-sm mb-6">
                Helps you see where your energy goes.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-8">
                {GOAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value as GoalCategory)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                      category === cat.value
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-surface-200 hover:border-surface-300 text-surface-700",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <button className="btn-primary w-full" onClick={next}>
                Continue →
              </button>
            </div>
          )}

          {/* STEP: Check-in time */}
          {step === "checkin-time" && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                When should we remind you?
              </h2>
              <p className="text-surface-500 text-sm mb-6">
                We'll nudge you to check in at this time every day. You can
                change this later.
              </p>
              <input
                className="input mb-2"
                type="time"
                value={checkinTime}
                onChange={(e) => setCheckinTime(e.target.value)}
              />
              <p className="text-xs text-surface-400 mb-8">
                Most people pick 8:00 PM — end of day reflection.
              </p>
              <button className="btn-primary w-full" onClick={next}>
                Continue →
              </button>
            </div>
          )}

          {/* STEP: Done */}
          {step === "done" && (
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-xl font-semibold mb-3">You're set up</h2>
              <div className="bg-surface-50 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs text-surface-400 uppercase tracking-wide mb-2">
                  Your first goal
                </p>
                <p className="font-medium text-surface-900">{goalName}</p>
                <p className="text-sm text-surface-500 mt-1 capitalize">
                  {goalType} · {category}
                </p>
              </div>
              <p className="text-surface-500 text-sm mb-8">
                Check in daily to build your streak. Miss a day and it breaks,
                unless you use a freeze.
              </p>
              <button
                className="btn-primary w-full"
                onClick={finish}
                disabled={loading}
              >
                {loading ? "Setting up…" : "Start my streak 🔥"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
