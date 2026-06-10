import { useNavigate } from "react-router-dom";
import { Plus, Flame, Target, Archive } from "lucide-react";
import { useGoals } from "../../hooks/useGoals";
import { ROUTES, GOAL_CATEGORIES } from "../../constants";
import { cn, formatDate } from "../../utils";
import type { Goal } from "../../types";

const GoalRow = ({ goal }: { goal: Goal }) => {
  const navigate = useNavigate();
  const cat = GOAL_CATEGORIES.find((c) => c.value === goal.category)!;

  return (
    <div
      className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(ROUTES.GOAL_DETAIL.replace(":id", goal.id))}
    >
      <div className="flex items-center gap-3">
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

        <div className="flex-1 min-w-0">
          <p className="font-medium text-surface-900 truncate">{goal.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
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
              goal.current_streak > 0 ? "text-surface-900" : "text-surface-300",
            )}
          >
            {goal.current_streak}
          </span>
        </div>
      </div>

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
  );
};

export default function Goals() {
  const navigate = useNavigate();
  const { data: goals = [], isLoading } = useGoals();

  const active = goals.filter((g) => g.status === "active");
  const paused = goals.filter((g) => g.status === "paused");
  const archived = goals.filter((g) => g.status === "archived");

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
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

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-surface-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : active.length === 0 ? (
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
      ) : (
        <div className="space-y-3">
          {active.map((g) => (
            <GoalRow key={g.id} goal={g} />
          ))}
        </div>
      )}

      {paused.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wide mb-3">
            Paused
          </h2>
          <div className="space-y-3">
            {paused.map((g) => (
              <GoalRow key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Archive size={14} className="text-surface-400" />
            <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wide">
              Archived
            </h2>
          </div>
          <div className="space-y-3 opacity-60">
            {archived.map((g) => (
              <GoalRow key={g.id} goal={g} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
