import { useState, useEffect } from "react";
import { Zap, Clock, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { missionsApi } from "../lib/api/missions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "../utils";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";
import type { DailyMission } from "../types";

// ─── Tonight's prompt ─────────────────────────────────────────────────────────
const PROMPT = "What is your mission for tomorrow?";
const PLACEHOLDERS = [
  "e.g. Finish the OT security assessment draft",
  "e.g. Study Modbus protocol for 45 minutes",
  "e.g. Complete the Stride check-in flow",
  "e.g. Review and respond to all pending emails",
  "e.g. One deep work session on the proposal",
];

// ─── History item ─────────────────────────────────────────────────────────────
const MissionHistoryItem = ({
  mission,
  isToday,
}: {
  mission: DailyMission;
  isToday: boolean;
}) => {
  const date = parseISO(mission.date);

  return (
    <div
      className={cn(
        "flex gap-4 py-4 border-b border-surface-100 last:border-0",
        isToday && "opacity-60",
      )}
    >
      <div className="shrink-0 text-right w-16">
        <p className="text-xs font-medium text-surface-900">
          {format(date, "MMM d")}
        </p>
        <p className="text-xs text-surface-400">{format(date, "EEE")}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-800 leading-relaxed">
          {mission.mission}
        </p>
        {isToday && (
          <span className="inline-block mt-1 text-xs text-brand-600 font-medium">
            Today
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Mission page ─────────────────────────────────────────────────────────────
export default function Mission() {
  const { profile } = useAuthStore();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [placeholder] = useState(
    PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)],
  );

  // Today's mission
  const { data: todayMission, isLoading } = useQuery({
    queryKey: ["mission-today", profile?.id],
    enabled: !!profile?.id,
    queryFn: () => missionsApi.today(profile!.id),
  });

  // Mission history
  const { data: history = [] } = useQuery({
    queryKey: ["mission-history", profile?.id],
    enabled: !!profile?.id && showHistory,
    queryFn: () => missionsApi.history(profile!.id, 30),
  });

  // Pre-fill if already saved today
  useEffect(() => {
    if (todayMission?.mission) {
      setText(todayMission.mission);
      setSaved(true);
    }
  }, [todayMission]);

  const saveMission = useMutation({
    mutationFn: () => missionsApi.save(profile!.id, text.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mission-today"] });
      qc.invalidateQueries({ queryKey: ["mission-history"] });
      setSaved(true);
      toast.success("Mission set: see you tomorrow 🎯");
    },
    onError: () => toast.error("Could not save. Try again."),
  });

  const handleSave = () => {
    if (!text.trim() || text.trim().length < 5) return;
    saveMission.mutate();
  };

  const handleEdit = () => {
    setSaved(false);
  };

  const hour = new Date().getHours();
  const isEvening = hour >= 17;

  // History without today
  const pastMissions = history.filter((m) => m.date !== todayMission?.date);

  return (
    <div className="max-w-xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-brand-500" />
          <h1>Tonight's mission</h1>
        </div>
        <p className="text-surface-500 text-sm">
          One sentence. Written tonight. Shown to you first thing tomorrow.
        </p>
      </div>

      {/* Evening nudge */}
      {!isEvening && !todayMission && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            Most people write their mission in the evening, it's the last thing
            you do before you stop for the day. Come back tonight for best
            results.
          </p>
        </div>
      )}

      {/* Main card */}
      <div className="card p-6">
        <p className="text-base font-semibold text-surface-900 mb-5">
          {PROMPT}
        </p>

        {isLoading ? (
          <div className="h-24 bg-surface-100 rounded-xl animate-pulse" />
        ) : saved && todayMission ? (
          // ── Saved state ────────────────────────────────────────────────────
          <div className="space-y-4">
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
              <p className="text-xs text-brand-600 font-medium mb-2 uppercase tracking-wide">
                Tomorrow's mission
              </p>
              <p className="text-surface-900 font-medium leading-relaxed">
                {todayMission.mission}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                <span className="text-base">✓</span>
              </div>
              <p className="text-sm text-surface-500">
                Mission locked in. You'll see this first thing when you open
                Stride tomorrow.
              </p>
            </div>

            <button
              className="btn-ghost w-full text-sm text-surface-500"
              onClick={handleEdit}
            >
              Edit mission
            </button>
          </div>
        ) : (
          // ── Write state ────────────────────────────────────────────────────
          <div className="space-y-4">
            <textarea
              className={cn(
                "input resize-none text-sm leading-relaxed transition-all",
                text.length > 0 ? "border-brand-300 ring-1 ring-brand-200" : "",
              )}
              rows={3}
              placeholder={placeholder}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSaved(false);
              }}
              autoFocus
              maxLength={200}
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-surface-400">
                {200 - text.length} characters remaining
              </p>
              {text.length > 0 && (
                <p className="text-xs text-surface-400">
                  {text.trim().split(" ").filter(Boolean).length} words
                </p>
              )}
            </div>

            {/* Tips */}
            {text.length === 0 && (
              <div className="bg-surface-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                  Tips for a good mission
                </p>
                <ul className="space-y-1.5">
                  {[
                    "One sentence, not a list",
                    "Specific enough that you'll know if you did it",
                    "Ambitious but realistic for one day",
                  ].map((tip) => (
                    <li
                      key={tip}
                      className="flex items-start gap-2 text-xs text-surface-500"
                    >
                      <span className="text-brand-400 mt-0.5">→</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="btn-primary w-full"
              onClick={handleSave}
              disabled={text.trim().length < 5 || saveMission.isPending}
            >
              {saveMission.isPending ? "Saving…" : "Lock in mission 🎯"}
            </button>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="card p-5">
        <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-3">
          How it works
        </p>
        <div className="space-y-3">
          {[
            {
              icon: "🌙",
              title: "Write tonight",
              desc: "One sentence before you stop for the day",
            },
            {
              icon: "🌅",
              title: "See it tomorrow",
              desc: "Shown at the top of your dashboard every morning",
            },
            {
              icon: "📓",
              title: "Becomes a diary",
              desc: "Your history of daily intentions, searchable over time",
            },
          ].map((step) => (
            <div key={step.title} className="flex items-start gap-3">
              <span className="text-xl shrink-0">{step.icon}</span>
              <div>
                <p className="text-sm font-medium text-surface-900">
                  {step.title}
                </p>
                <p className="text-xs text-surface-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-5 hover:bg-surface-50 transition-colors"
          onClick={() => setShowHistory((h) => !h)}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-surface-400" />
            <span className="text-sm font-medium text-surface-700">
              Mission history
            </span>
            {pastMissions.length > 0 && (
              <span className="badge badge-gray text-xs">
                {pastMissions.length}
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
          <div className="px-5 pb-4 border-t border-surface-100">
            {pastMissions.length === 0 ? (
              <p className="text-sm text-surface-400 py-6 text-center">
                No past missions yet, this will become your growth diary.
              </p>
            ) : (
              <div>
                {pastMissions.map((m) => (
                  <MissionHistoryItem
                    key={m.id}
                    mission={m}
                    isToday={m.date === todayMission?.date}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
