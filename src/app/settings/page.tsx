"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SparklesIcon } from "@/components/icons/SparklesIcon";
import { ClockIcon } from "@/components/icons/ClockIcon";
import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { CrossCircleIcon } from "@/components/icons/CrossCircleIcon";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, "0")}:00`,
}));

export default function SettingsPage() {
  const [promptSettings, setPromptSettings] = useState("");
  const [scheduleHour, setScheduleHour] = useState(9);
  const [timezoneOffset, setTimezoneOffset] = useState(3);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setPromptSettings(data.config.promptSettings || "Coding Memes");
          setScheduleHour(data.config.scheduleHour ?? 9);
          setTimezoneOffset(data.config.timezoneOffset ?? 3);
          setIsActive(data.config.isActive ?? true);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptSettings, scheduleHour, timezoneOffset, isActive }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      setSuccessMsg("Configuration saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-radial-gradient-right pointer-events-none" />
      <Sidebar />
      <main className="pl-64 relative z-10">
        <div className="p-8 max-w-3xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-neutral-400 mt-1 text-sm">Configure your automation pipeline</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-2">
              <CrossCircleIcon className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {!loaded ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold text-lg">Automation Controls</h2>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2 font-medium">
                    AI Prompt Topic
                  </label>
                  <input
                    type="text"
                    value={promptSettings}
                    onChange={(e) => setPromptSettings(e.target.value)}
                    placeholder="e.g., Coding Memes"
                    className="glass-input w-full px-4 py-3 text-sm"
                  />
                  <p className="text-xs text-neutral-500 mt-1.5">
                    DeepSeek-V3 generates content matching this topic daily
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2 font-medium">
                    Your Timezone (UTC offset)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={timezoneOffset}
                      onChange={(e) => setTimezoneOffset(Number(e.target.value))}
                      placeholder="e.g., 3 for UTC+3, -5 for UTC-5"
                      className="glass-input w-full px-4 py-3 text-sm"
                      step="1"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1.5">
                    Your local timezone offset from UTC. E.g., UTC+3 = 3, UTC-5 = -5
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2 font-medium">
                    Schedule Hour {timezoneOffset >= 0 ? `(UTC+${timezoneOffset})` : `(UTC${timezoneOffset})`}
                  </label>
                  <div className="relative">
                    <select
                      value={scheduleHour}
                      onChange={(e) => setScheduleHour(Number(e.target.value))}
                      className="glass-select w-full px-4 py-3 text-sm appearance-none"
                    >
                      {HOUR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <span className="text-sm text-neutral-300 font-medium">Automation Active</span>
                    <p className="text-xs text-neutral-500 mt-0.5">Cron will post at the scheduled hour</p>
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isActive ? "bg-emerald-500" : "bg-neutral-700"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${isActive ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !promptSettings.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
