import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Flame,
  ChevronRight,
  PartyPopper,
} from "lucide-react";
import { useGoals } from "../hooks/useGoals";
import { useAuthStore } from "../store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { checkInsApi } from "../lib/api/checkins";
import { CheckInModal } from "../components/checkin/CheckInModal";
import { ROUTES, GOAL_CATEGORIES } from "../constants";
import { cn } from "../utils";
import type { Goal } from "../types";

// ─── Single goal row ──────────────────────────────────────────────────────────
const GoalCheckInRow = ({ goal }: { goal: Goal }) => {
  const { profile } = useAuthStore();
  const [open, setOpen] = useState(false);
  const cat = GOAL_CATEGORIES.find((c) => c.value === goal.category)!;

  const { data: todayCI } = useQuery({
    queryKey: ["checkin-today", goal.id],
    enabled: !!profile?.id,
    queryFn: () => checkInsApi.todayForGoal(goal.id, profile!.id),
  });

  const done = !!todayCI;

  return (
    <>
      <div
        className={cn(
          "card p-4 transition-all",
          done ? "opacity-70" : "hover:shadow-md cursor-pointer",
        )}
        onClick={() => !done && setOpen(true)}
      >
        <div className="flex items-center gap-3">
          {/* Status icon */}
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
              done ? "bg-brand-100" : "bg-surface-100",
            )}
          >
            {done ? (
              <CheckCircle2 size={20} className="text-brand-600" />
            ) : (
              <Circle size={20} className="text-surface-400" />
            )}
          </div>

          {/* Goal info */}
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-medium text-sm truncate",
                done ? "text-surface-500 line-through" : "text-surface-900",
              )}
            >
              {goal.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs" style={{ color: cat.color }}>
                {cat.label}
              </span>
              <span className="text-surface-300 text-xs">·</span>
              <Flame
                size={11}
                className={
                  goal.current_streak > 0
                    ? "text-orange-400"
                    : "text-surface-300"
                }
              />
              <span className="text-xs text-surface-400">
                {goal.current_streak} day streak
              </span>
            </div>
          </div>

          {/* Action */}
          {done ? (
            <span className="text-xs font-medium text-brand-600 shrink-0">
              Done ✓
            </span>
          ) : (
            <ChevronRight size={16} className="text-surface-300 shrink-0" />
          )}
        </div>
      </div>

      {open && <CheckInModal goal={goal} onClose={() => setOpen(false)} />}
    </>
  );
};

// ─── All done state ───────────────────────────────────────────────────────────
const AllDone = () => {
  const navigate = useNavigate();
  return (
    <div className="card p-10 text-center">
      <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <PartyPopper size={28} className="text-brand-500" />
      </div>
      <h2 className="text-xl font-bold text-surface-900 mb-2">
        All done for today!
      </h2>
      <p className="text-surface-500 text-sm mb-6 leading-relaxed">
        Every goal checked in. That's a full day. Come back tomorrow to keep the
        streak going.
      </p>
      <div className="flex flex-col gap-3">
        <button
          className="btn-primary mx-auto"
          onClick={() => navigate(ROUTES.MISSION)}
        >
          Set tonight's mission →
        </button>
        <button
          className="btn-ghost mx-auto text-sm"
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
};

// ─── Check-in page ────────────────────────────────────────────────────────────
export default function CheckIn() {
  const { profile } = useAuthStore();
  const { data: goals = [], isLoading } = useGoals();
  const navigate = useNavigate();

  const activeGoals = goals.filter((g) => g.status === "active");

  // Count how many checked in today
  const checkedInIds = useQuery({
    queryKey: ["all-checkins-today", profile?.id],
    enabled: !!profile?.id && activeGoals.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        activeGoals.map((g) => checkInsApi.todayForGoal(g.id, profile!.id)),
      );
      return results
        .map((ci, i) => (ci ? activeGoals[i].id : null))
        .filter(Boolean) as string[];
    },
    // Refetch whenever modal closes
    refetchInterval: false,
  });

  const doneCount = checkedInIds.data?.length ?? 0;
  const totalCount = activeGoals.length;
  const allDone = totalCount > 0 && doneCount === totalCount;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const pending = activeGoals.filter((g) => !checkedInIds.data?.includes(g.id));
  const complete = activeGoals.filter((g) => checkedInIds.data?.includes(g.id));

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1>Daily check-in</h1>
        <p className="text-surface-500 text-sm mt-0.5">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* Progress summary */}
      {totalCount > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-surface-700">
              {doneCount} of {totalCount} goals checked in
            </span>
            <span className="text-sm font-bold text-brand-600">{pct}%</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          {doneCount > 0 && !allDone && (
            <p className="text-xs text-surface-400 mt-2">
              {totalCount - doneCount} goal
              {totalCount - doneCount > 1 ? "s" : ""} left, keep going 💪
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-surface-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* No goals */}
      {!isLoading && totalCount === 0 && (
        <div className="card p-10 text-center">
          <p className="text-surface-500 text-sm mb-4">
            You have no active goals to check in on.
          </p>
          <button
            className="btn-primary mx-auto"
            onClick={() => navigate(ROUTES.GOAL_NEW)}
          >
            Add a goal
          </button>
        </div>
      )}

      {/* All done */}
      {allDone && <AllDone />}

      {/* Pending goals */}
      {!allDone && pending.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wide">
            Needs check-in
          </h2>
          {pending.map((g) => (
            <GoalCheckInRow key={g.id} goal={g} />
          ))}
        </div>
      )}

      {/* Completed goals */}
      {complete.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wide">
            Checked in
          </h2>
          {complete.map((g) => (
            <GoalCheckInRow key={g.id} goal={g} />
          ))}
        </div>
      )}
    </div>
  );
}
