import { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { reviewsApi } from "../lib/api/reviews";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { REVIEW_QUESTIONS } from "../constants";
import { cn, thisWeekStart } from "../utils";
import { format, parseISO, endOfWeek } from "date-fns";
import toast from "react-hot-toast";
import type { WeeklyReview } from "../types";

// ─── Week label ───────────────────────────────────────────────────────────────
const weekLabel = (weekStart: string) => {
  const start = parseISO(weekStart);
  const end = endOfWeek(start, { weekStartsOn: 1 });
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
};

// ─── Past review card ─────────────────────────────────────────────────────────
const PastReviewCard = ({ review }: { review: WeeklyReview }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-surface-50 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
            <Calendar size={14} className="text-brand-500" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-surface-900">
              {weekLabel(review.week_start)}
            </p>
            <p className="text-xs text-surface-400 mt-0.5 line-clamp-1">
              {review.next_week_mission}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp size={15} className="text-surface-400 shrink-0" />
        ) : (
          <ChevronDown size={15} className="text-surface-400 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-surface-100 space-y-3 pt-4">
          {REVIEW_QUESTIONS.map((q) => {
            const val = review[q.key as keyof WeeklyReview] as string;
            if (!val) return null;
            return (
              <div key={q.key}>
                <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-1">
                  {q.prompt}
                </p>
                <p className="text-sm text-surface-800 leading-relaxed">
                  {val}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Review form one question at a time ────────────────────────────────────
const ReviewForm = ({
  initial,
  onSave,
  isSaving,
}: {
  initial: Partial<Record<string, string>>;
  onSave: (answers: Record<string, string>) => void;
  isSaving: boolean;
}) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    REVIEW_QUESTIONS.reduce(
      (acc, q) => ({
        ...acc,
        [q.key]: initial[q.key] ?? "",
      }),
      {},
    ),
  );

  const q = REVIEW_QUESTIONS[step];
  const isLast = step === REVIEW_QUESTIONS.length - 1;
  const isFirst = step === 0;
  const canNext = answers[q.key]?.trim().length >= 3;
  const allFilled = REVIEW_QUESTIONS.every(
    (q) => answers[q.key]?.trim().length >= 3,
  );

  const handleNext = () => {
    if (isLast) {
      if (allFilled) onSave(answers);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {REVIEW_QUESTIONS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 flex-1",
              i < step
                ? "bg-brand-500"
                : i === step
                  ? "bg-brand-400"
                  : "bg-surface-200",
            )}
          />
        ))}
      </div>

      {/* Question counter */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-400 font-medium uppercase tracking-wide">
          Question {step + 1} of {REVIEW_QUESTIONS.length}
        </span>
        <span className="text-xs text-surface-400">~1 min each</span>
      </div>

      {/* Question card */}
      <div className="card p-6 space-y-4">
        <p className="text-lg font-semibold text-surface-900 leading-snug">
          {q.prompt}
        </p>

        <textarea
          key={q.key}
          className={cn(
            "input resize-none text-sm leading-relaxed transition-all",
            answers[q.key]?.trim().length >= 3
              ? "border-brand-300 ring-1 ring-brand-200"
              : "",
          )}
          rows={4}
          placeholder={q.placeholder}
          value={answers[q.key] ?? ""}
          onChange={(e) =>
            setAnswers((a) => ({ ...a, [q.key]: e.target.value }))
          }
          autoFocus
          maxLength={500}
        />

        <div className="flex items-center justify-between text-xs text-surface-400">
          <span>
            {500 - (answers[q.key]?.length ?? 0)} characters remaining
          </span>
          {answers[q.key]?.trim().length >= 3 && (
            <span className="text-brand-500">✓ Good</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {!isFirst && (
          <button
            className="btn-secondary flex items-center gap-2"
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        <button
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm transition-all",
            canNext
              ? "btn-primary"
              : "bg-surface-100 text-surface-400 cursor-not-allowed",
          )}
          onClick={handleNext}
          disabled={!canNext || (isLast && isSaving)}
        >
          {isLast ? (
            isSaving ? (
              "Saving…"
            ) : (
              <>
                <Check size={16} /> Save review
              </>
            )
          ) : (
            <>
              Next <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

      {/* Quick jump */}
      <div className="flex gap-2 justify-center">
        {REVIEW_QUESTIONS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={cn(
              "w-7 h-7 rounded-full text-xs font-medium transition-all",
              i === step
                ? "bg-brand-500 text-white"
                : answers[REVIEW_QUESTIONS[i].key]?.trim().length >= 3
                  ? "bg-brand-100 text-brand-600"
                  : "bg-surface-100 text-surface-400",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Saved review view ────────────────────────────────────────────────────────
const SavedReview = ({
  review,
  onEdit,
}: {
  review: WeeklyReview;
  onEdit: () => void;
}) => (
  <div className="space-y-4">
    <div className="card p-5 space-y-5">
      {REVIEW_QUESTIONS.map((q) => {
        const val = review[q.key as keyof WeeklyReview] as string;
        return (
          <div
            key={q.key}
            className="border-b border-surface-100 last:border-0 pb-4 last:pb-0"
          >
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">
              {q.prompt}
            </p>
            <p className="text-sm text-surface-800 leading-relaxed">
              {val || "—"}
            </p>
          </div>
        );
      })}
    </div>
    <button className="btn-ghost w-full text-sm" onClick={onEdit}>
      Edit this week's review
    </button>
  </div>
);

// ─── Review page ──────────────────────────────────────────────────────────────
export default function Review() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const weekStart = thisWeekStart();
  const isSunday = new Date().getDay() === 0;

  // This week's review
  const { data: thisWeek, isLoading } = useQuery({
    queryKey: ["review-this-week", profile?.id],
    enabled: !!profile?.id,
    queryFn: () => reviewsApi.thisWeek(profile!.id),
  });

  // History
  const { data: history = [] } = useQuery({
    queryKey: ["review-history", profile?.id],
    enabled: !!profile?.id && showHistory,
    queryFn: () => reviewsApi.history(profile!.id, 12),
  });

  // Start in edit mode if no review yet
  useEffect(() => {
    if (!isLoading && !thisWeek) setEditing(true);
  }, [isLoading, thisWeek]);

  const saveReview = useMutation({
    mutationFn: (answers: Record<string, string>) =>
      reviewsApi.save({
        user_id: profile!.id,
        week_start: weekStart,
        what_done: answers.what_done,
        what_skipped: answers.what_skipped,
        what_blocked: answers.what_blocked,
        what_learned: answers.what_learned,
        next_week_mission: answers.next_week_mission,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-this-week"] });
      qc.invalidateQueries({ queryKey: ["review-history"] });
      setEditing(false);
      toast.success("Weekly review saved 📓");
    },
    onError: () => toast.error("Could not save. Try again."),
  });

  const pastReviews = history.filter((r) => r.week_start !== weekStart);

  return (
    <div className="max-w-xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={20} className="text-brand-500" />
          <h1>Weekly review</h1>
        </div>
        <p className="text-surface-500 text-sm">
          5 questions. 5 minutes. Your private growth journal.
        </p>
      </div>

      {/* Week indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="badge badge-green text-xs">This week</span>
          <span className="text-sm text-surface-500">
            {weekLabel(weekStart)}
          </span>
        </div>
        {!isSunday && !thisWeek && (
          <span className="text-xs text-surface-400">Best done on Sundays</span>
        )}
      </div>

      {/* Sunday nudge */}
      {!isSunday && !thisWeek && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Today isn't Sunday</span>, but you can
            still write your review any time. Reflection doesn't need a perfect
            day.
          </p>
        </div>
      )}

      {/* Main content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-3 bg-surface-100 rounded w-1/2 mb-3" />
              <div className="h-16 bg-surface-100 rounded" />
            </div>
          ))}
        </div>
      ) : editing ? (
        <ReviewForm
          initial={
            thisWeek
              ? (thisWeek as unknown as Partial<Record<string, string>>)
              : {}
          }
          onSave={(answers) => saveReview.mutate(answers)}
          isSaving={saveReview.isPending}
        />
      ) : thisWeek ? (
        <SavedReview review={thisWeek} onEdit={() => setEditing(true)} />
      ) : null}

      {/* How it works */}
      {!thisWeek && !editing && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3">
            Why a weekly review?
          </p>
          <div className="space-y-3">
            {[
              {
                icon: "🔍",
                text: "See patterns in your week before they become patterns in your life",
              },
              {
                icon: "📓",
                text: "Build a private journal of your growth over months and years",
              },
              {
                icon: "🎯",
                text: "Set your intention for next week before Monday arrives",
              },
            ].map((item) => (
              <div key={item.icon} className="flex items-start gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <p className="text-sm text-surface-600 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past reviews */}
      <div className="card overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 hover:bg-surface-50 transition-colors"
          onClick={() => setShowHistory((h) => !h)}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-surface-400" />
            <span className="text-sm font-medium text-surface-700">
              Past reviews
            </span>
            {pastReviews.length > 0 && (
              <span className="badge badge-gray text-xs">
                {pastReviews.length}
              </span>
            )}
          </div>
          {showHistory ? (
            <ChevronUp size={16} className="text-surface-400" />
          ) : (
            <ChevronDown size={16} className="text-surface-400" />
          )}
        </button>

        {showHistory && (
          <div className="px-4 pb-4 border-t border-surface-100 space-y-3 pt-4">
            {pastReviews.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">
                No past reviews yet, this becomes your growth archive over time.
              </p>
            ) : (
              pastReviews.map((r) => <PastReviewCard key={r.id} review={r} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
