import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Check,
  Moon,
  Globe,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { cn, initials } from "../utils";
import { APP_NAME, APP_VERSION } from "../constants";
import toast from "react-hot-toast";
import type { Profile } from "../types";

const TIMEZONES = [
  "Africa/Nairobi",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wide px-1 mb-2">
      {title}
    </h2>
    <div className="card overflow-hidden divide-y divide-surface-100">
      {children}
    </div>
  </div>
);

// ─── Row ──────────────────────────────────────────────────────────────────────
const Row = ({
  icon,
  label,
  value,
  onClick,
  danger = false,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  children?: React.ReactNode;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 px-4 py-3.5",
      onClick && "cursor-pointer hover:bg-surface-50 transition-colors",
      danger && "hover:bg-red-50",
    )}
    onClick={onClick}
  >
    <div
      className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
        danger ? "bg-red-50 text-red-500" : "bg-surface-100 text-surface-500",
      )}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p
        className={cn(
          "text-sm font-medium",
          danger ? "text-red-600" : "text-surface-900",
        )}
      >
        {label}
      </p>
      {value && <p className="text-xs text-surface-400 mt-0.5">{value}</p>}
    </div>
    {children}
    {onClick && !children && (
      <ChevronRight size={15} className="text-surface-300 shrink-0" />
    )}
  </div>
);

// ─── Profile editor ───────────────────────────────────────────────────────────
const ProfileEditor = ({
  profile,
  onDone,
}: {
  profile: Profile;
  onDone: () => void;
}) => {
  const { setProfile } = useAuthStore();
  const [name, setName] = useState(profile.name);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ name: name.trim(), timezone })
        .eq("id", profile.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data as Profile);
      toast.success("Profile updated");
      onDone();
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="label">Display name</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          autoFocus
        />
      </div>
      <div>
        <label className="label">Timezone</label>
        <select
          className="input"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace("_", " ")}
            </option>
          ))}
        </select>
        <p className="text-xs text-surface-400 mt-1.5">
          Used to calculate your daily streak reset at midnight.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          className="btn-primary flex-1"
          onClick={save}
          disabled={saving || !name.trim()}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button className="btn-secondary" onClick={onDone}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Password change ──────────────────────────────────────────────────────────
const PasswordEditor = ({ onDone }: { onDone: () => void }) => {
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (next !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (next.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      toast.success("Password updated");
      onDone();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Could not update password",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="label">New password</label>
        <input
          className="input"
          type="password"
          placeholder="At least 6 characters"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <label className="label">Confirm new password</label>
        <input
          className="input"
          type="password"
          placeholder="Repeat password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button
          className="btn-primary flex-1"
          onClick={save}
          disabled={saving || !next}
        >
          {saving ? "Saving…" : "Update password"}
        </button>
        <button className="btn-secondary" onClick={onDone}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Settings page ────────────────────────────────────────────────────────────
export default function Settings() {
  const { profile, clearAuth } = useAuthStore();
  const qc = useQueryClient();
  const [editProfile, setEditProfile] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearAuth();
    qc.clear();
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure? This permanently deletes your account and all data. This cannot be undone.",
    );
    if (!confirmed) return;
    toast.error("Account deletion, contact support to complete this action.");
  };

  if (!profile) return null;

  return (
    <div className="max-w-xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1>Settings</h1>
        <p className="text-surface-500 text-sm mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* Avatar + name */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-bold shrink-0">
          {initials(profile.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-surface-900">{profile.name}</p>
          <p className="text-sm text-surface-500">{profile.email}</p>
          <p className="text-xs text-surface-400 mt-0.5">{profile.timezone}</p>
        </div>
        <button
          className="btn-secondary text-xs"
          onClick={() => {
            setEditProfile(true);
            setEditPassword(false);
          }}
        >
          Edit
        </button>
      </div>

      {/* Profile editor */}
      {editProfile && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-100 bg-surface-50">
            <p className="text-sm font-medium text-surface-700">Edit profile</p>
          </div>
          <ProfileEditor
            profile={profile}
            onDone={() => setEditProfile(false)}
          />
        </div>
      )}

      {/* Password editor */}
      {editPassword && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-surface-100 bg-surface-50">
            <p className="text-sm font-medium text-surface-700">
              Change password
            </p>
          </div>
          <PasswordEditor onDone={() => setEditPassword(false)} />
        </div>
      )}

      {/* Account */}
      <Section title="Account">
        <Row
          icon={<User size={15} />}
          label="Edit profile"
          value="Name and timezone"
          onClick={() => {
            setEditProfile((e) => !e);
            setEditPassword(false);
          }}
        >
          {editProfile && <Check size={14} className="text-brand-500" />}
        </Row>
        <Row
          icon={<Shield size={15} />}
          label="Change password"
          onClick={() => {
            setEditPassword((e) => !e);
            setEditProfile(false);
          }}
        >
          {editPassword && <Check size={14} className="text-brand-500" />}
        </Row>
        <Row
          icon={<Globe size={15} />}
          label="Timezone"
          value={profile.timezone}
          onClick={() => {
            setEditProfile(true);
            setEditPassword(false);
          }}
        />
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        <Row
          icon={<Bell size={15} />}
          label="Daily check-in reminder"
          value={notifEnabled ? "Enabled" : "Disabled"}
        >
          <button
            onClick={() => {
              setNotifEnabled((n) => !n);
              toast.success(
                notifEnabled
                  ? "Reminders off"
                  : "Reminders on, coming in V2 via email",
              );
            }}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
              notifEnabled ? "bg-brand-500" : "bg-surface-200",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                notifEnabled ? "translate-x-4" : "translate-x-0",
              )}
            />
          </button>
        </Row>
        <Row icon={<Moon size={15} />} label="Dark mode" value="Coming soon">
          <span className="badge badge-gray text-xs">Soon</span>
        </Row>
      </Section>

      {/* About */}
      <Section title="About">
        <Row
          icon={<span className="text-sm font-bold text-brand-600">S</span>}
          label={APP_NAME}
          value={`Version ${APP_VERSION}`}
        />
      </Section>

      {/* Danger zone */}
      <Section title="Account actions">
        <Row
          icon={<LogOut size={15} />}
          label="Sign out"
          onClick={handleSignOut}
        />
        <Row
          icon={<Shield size={15} />}
          label="Delete account"
          value="Permanently remove all data"
          onClick={handleDeleteAccount}
          danger
        />
      </Section>
    </div>
  );
}
