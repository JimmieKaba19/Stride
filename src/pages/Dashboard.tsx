import { useNavigate } from "react-router-dom";
import { Flame, Plus, Circle, Target, Zap } from "lucide-react";
import { useGoals } from "../hooks/useGoals";
import { useAuthStore } from "../store/useAuthStore";
import { ROUTES, GOAL_CATEGORIES } from "../constants";
import { cn, formatDate } from "../utils";
import type { Goal } from "../types";

// ─── Greeting ─────────────────────────────────────────────────────────────────
const getGreeting = (name: string) => {
  const h = new Date().getHours();
  const time =
    h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}`;
};

// ─── Goal card ────────────────────────────────────────────────────────────────
const GoalCard = ({ goal }: { goal: Goal }) => {
  const navigate = useNavigate();
  const cat = GOAL_CATEGORIES.find((c) => c.value === goal.category);

  return (
    <div
      className="card p-5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(ROUTES.GOAL_DETAIL.replace(":id", goal.id))}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge text-xs"
              style={{ background: cat?.bg, color: cat?.color }}
            >
              {cat?.label}
            </span>
            <span className="badge badge-gray">
              {goal.type === "habit" ? "🔁 Habit" : "🎯 Milestone"}
            </span>
          </div>
          <h3 className="font-medium text-surface-900 leading-snug">
            {goal.title}
          </h3>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-1 ml-3 shrink-0">
          <Flame
            size={18}
            className={cn(
              goal.current_streak > 0 ? "text-orange-500" : "text-surface-300",
            )}
          />
          <span
            className={cn(
              "text-lg font-bold",
              goal.current_streak > 0 ? "text-surface-900" : "text-surface-300",
            )}
          >
            {goal.current_streak}
          </span>
        </div>
      </div>

      {/* Progress bar (milestone goals) */}
      {goal.type === "milestone" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-surface-400 mb-1">
            <span>Progress</span>
            <span>{goal.progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
        <span className="text-xs text-surface-400">
          {goal.target_date
            ? `Due ${formatDate(goal.target_date)}`
            : `${goal.longest_streak} day best`}
        </span>
        <CheckInButton goal={goal} />
      </div>
    </div>
  );
};

// ─── Check-in button ──────────────────────────────────────────────────────────
const CheckInButton = ({ goal }: { goal: Goal }) => {
  // For now we show a simple button — will wire to real check-in modal next
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        // TODO: open check-in modal
        alert(`Check-in for "${goal.title}" coming next!`);
      }}
      className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
    >
      <Circle size={14} />
      Check in
    </button>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyGoals = () => {
  const navigate = useNavigate();
  return (
    <div className="card p-10 text-center">
      <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Target size={24} className="text-brand-500" />
      </div>
      <h3 className="font-semibold text-surface-900 mb-2">No active goals</h3>
      <p className="text-sm text-surface-500 mb-6">
        Add a goal to start building your streak.
      </p>
      <button
        className="btn-primary mx-auto"
        onClick={() => navigate(ROUTES.GOAL_NEW)}
      >
        <Plus size={16} /> Add goal
      </button>
    </div>
  );
};

// ─── Stats bar ────────────────────────────────────────────────────────────────
const StatsBar = ({ goals }: { goals: Goal[] }) => {
  const activeGoals = goals.length;
  const totalStreak = goals.reduce((s, g) => s + g.current_streak, 0);
  const longestStreak = Math.max(0, ...goals.map((g) => g.longest_streak));

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Active goals", value: activeGoals, icon: "🎯" },
        { label: "Combined streak", value: totalStreak, icon: "🔥" },
        { label: "Best streak", value: longestStreak, icon: "⚡" },
      ].map((s) => (
        <div key={s.label} className="card p-4 text-center">
          <div className="text-xl mb-1">{s.icon}</div>
          <div className="text-2xl font-bold text-surface-900">{s.value}</div>
          <div className="text-xs text-surface-400 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Dashboard page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { data: goals = [], isLoading } = useGoals();

  const activeGoals = goals.filter((g) => g.status === "active");

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            {profile ? getGreeting(profile.name) : "Welcome back"}
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {activeGoals.length > 0
              ? `You have ${activeGoals.length} active goal${activeGoals.length > 1 ? "s" : ""} running`
              : "Let's set your first goal"}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate(ROUTES.GOAL_NEW)}
        >
          <Plus size={16} /> New goal
        </button>
      </div>

      {/* Stats */}
      {activeGoals.length > 0 && <StatsBar goals={activeGoals} />}

      {/* Today's mission placeholder */}
      <div className="card p-5 border-l-4 border-brand-400">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={15} className="text-brand-500" />
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
            Today's mission
          </span>
        </div>
        <p className="text-surface-500 text-sm italic">
          No mission set yet write tonight's mission before you sleep.
        </p>
        <button
          className="text-xs text-brand-600 font-medium mt-3 hover:text-brand-700"
          onClick={() => navigate(ROUTES.MISSION)}
        >
          Set tonight's mission →
        </button>
      </div>

      {/* Goals */}
      <div>
        <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-3">
          Active goals
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-surface-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-surface-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : activeGoals.length === 0 ? (
          <EmptyGoals />
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
