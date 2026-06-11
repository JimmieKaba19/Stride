import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Flame,
  Target,
  Archive,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Filter,
  Pause,
  RotateCcw,
} from "lucide-react";
import { useGoals, useUpdateGoal } from "../../hooks/useGoals";
import { useAuthStore } from "../../store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { checkInsApi } from "../../lib/api/checkins";
import { CheckInModal } from "../../components/checkin/CheckInModal";
import { ROUTES, GOAL_CATEGORIES } from "../../constants";
import { cn, formatDate } from "../../utils";
import toast from "react-hot-toast";
import type { Goal, GoalCategory } from "../../types";

type SortKey = "streak" | "created" | "progress" | "name";
type FilterCat = GoalCategory | "all";

// ─── Summary stats ────────────────────────────────────────────────────────────
const GoalsSummary = ({ goals }: { goals: Goal[] }) => {
  const active = goals.filter((g) => g.status === "active");
  const withStreak = active.filter((g) => g.current_streak > 0);
  const topStreak = Math.max(0, ...active.map((g) => g.current_streak));

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Active", value: active.length, icon: "🎯" },
        { label: "On a streak", value: withStreak.length, icon: "🔥" },
        { label: "Top streak", value: topStreak, icon: "⚡" },
      ].map((s) => (
        <div key={s.label} className="card p-3 text-center">
          <div className="text-lg mb-0.5">{s.icon}</div>
          <div className="text-xl font-bold text-surface-900">{s.value}</div>
          <div className="text-xs text-surface-400">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Goal row ─────────────────────────────────────────────────────────────────
const GoalRow = ({ goal }: { goal: Goal }) => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const updateGoal = useUpdateGoal();

  const cat = GOAL_CATEGORIES.find((c) => c.value === goal.category)!;
  const [menuOpen, setMenuOpen] = useState(false);
  const [ciOpen, setCiOpen] = useState(false);

  const { data: todayCI } = useQuery({
    queryKey: ["checkin-today", goal.id],
    enabled: !!profile?.id,
    queryFn: () => checkInsApi.todayForGoal(goal.id, profile!.id),
  });

  const handleStatus = async (status: Goal["status"]) => {
    setMenuOpen(false);
    await updateGoal.mutateAsync({ id: goal.id, data: { status } });
    toast.success(
      status === "paused"
        ? "Goal paused"
        : status === "archived"
          ? "Goal archived"
          : status === "active"
            ? "Goal resumed"
            : "Goal updated",
    );
  };

  const isArchived = goal.status === "archived";
  const isPaused = goal.status === "paused";

  return (
    <>
      <div
        className={cn(
          "card p-4 transition-all",
          !isArchived && "hover:shadow-md cursor-pointer",
          isArchived && "opacity-50",
        )}
        onClick={() =>
          !isArchived && navigate(ROUTES.GOAL_DETAIL.replace(":id", goal.id))
        }
      >
        <div className="flex items-center gap-3">
          {/* Type icon */}
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
              goal.type === "habit" ? "bg-orange-100" : "bg-blue-100",
            )}
          >
            {goal.type === "habit" ? (
              <Flame size={16} className="text-orange-500" />
            ) : (
              <Target size={16} className="text-blue-500" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-surface-900 truncate">
                {goal.title}
              </p>
              {isPaused && (
                <span className="badge badge-gray text-xs">Paused</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span
                className="badge text-xs"
                style={{ background: cat.bg, color: cat.color }}
              >
                {cat.label}
              </span>
              {goal.target_date && (
                <span className="text-xs text-surface-400">
                  Due {formatDate(goal.target_date)}
                </span>
              )}
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1 shrink-0">
            <Flame
              size={15}
              className={
                goal.current_streak > 0 ? "text-orange-400" : "text-surface-300"
              }
            />
            <span
              className={cn(
                "text-sm font-bold",
                goal.current_streak > 0
                  ? "text-surface-900"
                  : "text-surface-300",
              )}
            >
              {goal.current_streak}
            </span>
          </div>

          {/* Check-in status */}
          {!isArchived && !isPaused && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!todayCI) setCiOpen(true);
              }}
              disabled={!!todayCI}
              className={cn(
                "flex items-center gap-1 shrink-0 transition-colors",
                todayCI
                  ? "text-brand-500 cursor-default"
                  : "text-surface-300 hover:text-brand-500",
              )}
              title={todayCI ? "Checked in today" : "Check in"}
            >
              {todayCI ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </button>
          )}

          {/* Menu */}
          {!isArchived && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                className="p-1 rounded-lg hover:bg-surface-100 text-surface-400"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-surface-200 rounded-xl shadow-lg w-44 py-1 z-20">
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2"
                    onClick={() =>
                      navigate(ROUTES.GOAL_DETAIL.replace(":id", goal.id))
                    }
                  >
                    <Target size={14} /> View detail
                  </button>
                  {isPaused ? (
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 flex items-center gap-2"
                      onClick={() => handleStatus("active")}
                    >
                      <RotateCcw size={14} /> Resume goal
                    </button>
                  ) : (
                    <button
                      className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 flex items-center gap-2"
                      onClick={() => handleStatus("paused")}
                    >
                      <Pause size={14} /> Pause goal
                    </button>
                  )}
                  <div className="border-t border-surface-100 my-1" />
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    onClick={() => handleStatus("archived")}
                  >
                    <Archive size={14} /> Archive goal
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar milestone */}
        {goal.type === "milestone" && (
          <div className="mt-3 pl-12">
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
      </div>

      {ciOpen && <CheckInModal goal={goal} onClose={() => setCiOpen(false)} />}
    </>
  );
};

// ─── Goals page ───────────────────────────────────────────────────────────────
export default function Goals() {
  const navigate = useNavigate();
  const { data: goals = [], isLoading } = useGoals();

  const [filter, setFilter] = useState<FilterCat>("all");
  const [sort, setSort] = useState<SortKey>("streak");
  const [showFilters, setShowFilters] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const active = goals.filter((g) => g.status === "active");
  const paused = goals.filter((g) => g.status === "paused");
  const archived = goals.filter((g) => g.status === "archived");

  const sortGoals = (list: Goal[]) => {
    return [...list].sort((a, b) => {
      if (sort === "streak") return b.current_streak - a.current_streak;
      if (sort === "progress") return b.progress - a.progress;
      if (sort === "name") return a.title.localeCompare(b.title);
      // created newest first (default)
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

  const filterGoals = (list: Goal[]) =>
    filter === "all" ? list : list.filter((g) => g.category === filter);

  const visibleActive = sortGoals(filterGoals(active));
  const visiblePaused = sortGoals(filterGoals(paused));

  const usedCategories = [...new Set(goals.map((g) => g.category))];

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Goals</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {active.length} active
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate(ROUTES.GOAL_NEW)}
        >
          <Plus size={16} /> New goal
        </button>
      </div>

      {/* Summary stats */}
      {goals.length > 0 && <GoalsSummary goals={goals} />}

      {/* Filter + sort toolbar */}
      {goals.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={cn(
              "btn-secondary text-xs gap-1.5 py-1.5",
              showFilters && "bg-brand-50 text-brand-700 border-brand-200",
            )}
          >
            <Filter size={13} /> Filter
            {filter !== "all" && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 ml-0.5" />
            )}
          </button>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="text-xs border border-surface-200 rounded-xl px-3 py-1.5 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="streak">Sort: Streak</option>
            <option value="progress">Sort: Progress</option>
            <option value="name">Sort: Name</option>
            <option value="created">Sort: Newest</option>
          </select>
        </div>
      )}

      {/* Category filters */}
      {showFilters && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "badge text-xs py-1 px-3 cursor-pointer transition-all",
              filter === "all" ? "badge-green" : "badge-gray",
            )}
          >
            All
          </button>
          {usedCategories.map((cat) => {
            const cfg = GOAL_CATEGORIES.find((c) => c.value === cat)!;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat as FilterCat)}
                className={cn(
                  "badge text-xs py-1 px-3 cursor-pointer transition-all",
                  filter === cat ? "ring-2 ring-offset-1" : "",
                )}
                style={{
                  background: filter === cat ? cfg.bg : undefined,
                  color: filter === cat ? cfg.color : undefined,
                }}
              >
                {cfg.label}
              </button>
            );
          })}
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

      {/* Empty */}
      {!isLoading && goals.length === 0 && (
        <div className="card p-10 text-center">
          <Target size={32} className="text-surface-300 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">No goals yet</h3>
          <p className="text-sm text-surface-500 mb-5">
            Create your first goal to start building your streak.
          </p>
          <button
            className="btn-primary mx-auto"
            onClick={() => navigate(ROUTES.GOAL_NEW)}
          >
            <Plus size={16} /> Create goal
          </button>
        </div>
      )}

      {/* No results after filter */}
      {!isLoading &&
        goals.length > 0 &&
        visibleActive.length === 0 &&
        filter !== "all" && (
          <div className="card p-8 text-center">
            <p className="text-surface-500 text-sm">
              No active goals in this category.
            </p>
            <button
              className="text-xs text-brand-600 mt-2"
              onClick={() => setFilter("all")}
            >
              Clear filter
            </button>
          </div>
        )}

      {/* Active goals */}
      {visibleActive.length > 0 && (
        <div className="space-y-3">
          {visibleActive.map((g) => (
            <GoalRow key={g.id} goal={g} />
          ))}
        </div>
      )}

      {/* Paused */}
      {visiblePaused.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Pause size={12} /> Paused
          </h2>
          <div className="space-y-3">
            {visiblePaused.map((g) => (
              <GoalRow key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {/* Archived toggle */}
      {archived.length > 0 && (
        <div>
          <button
            className="flex items-center gap-2 text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3 hover:text-surface-600"
            onClick={() => setShowArchived((a) => !a)}
          >
            <Archive size={12} />
            Archived ({archived.length})
            <span className="text-surface-300">{showArchived ? "↑" : "↓"}</span>
          </button>
          {showArchived && (
            <div className="space-y-3">
              {archived.map((g) => (
                <GoalRow key={g.id} goal={g} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
