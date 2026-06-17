"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { SparklesIcon } from "@/components/icons/SparklesIcon";
import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { CrossCircleIcon } from "@/components/icons/CrossCircleIcon";
import { RefreshIcon } from "@/components/icons/RefreshIcon";
import { ExternalLinkIcon } from "@/components/icons/ExternalLinkIcon";
import { ClockIcon } from "@/components/icons/ClockIcon";
import type { DashboardData, PostLogData } from "@/lib/types";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${String(i).padStart(2, "0")}:00`,
}));

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promptSettings, setPromptSettings] = useState("");
  const [scheduleHour, setScheduleHour] = useState(9);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      if (json.config) {
        setPromptSettings(json.config.promptSettings || "Web Development Trends");
        setScheduleHour(json.config.scheduleHour ?? 9);
        setIsActive(json.config.isActive ?? true);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    const success = params.get("success");
    if (err) setError(err);
    if (success) setSuccessMsg(success);
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptSettings,
          scheduleHour,
          isActive,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      localStorage.setItem(
        "instauto_config",
        JSON.stringify({ promptSettings, scheduleHour, isActive })
      );

      setSuccessMsg("Configuration saved successfully!");
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const connectInstagram = () => {
    window.location.href = "/api/auth/instagram";
  };

  const isConnected = data?.config !== null;

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />

      <Sidebar />

      <main className="pl-64 relative z-10">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-neutral-400 mt-1 text-sm">
                Manage your Instagram automation pipeline
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                <SparklesIcon className="w-3.5 h-3.5" />
                AI Active
              </div>
              {isConnected && (
                <button
                  onClick={fetchData}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <RefreshIcon className="w-4 h-4 text-neutral-400" />
                </button>
              )}
            </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Account Connection */}
            <div className="glass-card p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-lg">
                  Account Connection
                </h2>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isConnected
                        ? "bg-emerald-400 shadow-lg shadow-emerald-400/30"
                        : "bg-red-400 shadow-lg shadow-red-400/30 animate-pulse-glow"
                    }`}
                  />
                  <span className="text-sm text-white font-medium">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                  {isConnected && (
                    <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-neutral-500 mb-1">
                    Instagram Business ID
                  </p>
                  <p className="text-sm text-neutral-300 font-mono truncate">
                    {data?.config?.instagramBusinessId || "Not connected"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-neutral-500 mb-1">
                    Last Posted
                  </p>
                  <p className="text-sm text-neutral-300">
                    {data?.config?.lastPostedAt
                      ? new Date(data.config.lastPostedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Never"}
                  </p>
                </div>

                {!data?.config && (
                  <button
                    onClick={connectInstagram}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    Connect Instagram
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Automation Controls */}
            <div className="glass-card p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-lg">
                  Automation Controls
                </h2>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2 font-medium">
                    AI Prompt Topic
                  </label>
                  <input
                    type="text"
                    value={promptSettings}
                    onChange={(e) => setPromptSettings(e.target.value)}
                    placeholder="e.g., Web Development Trends"
                    className="glass-input w-full px-4 py-3 text-sm"
                  />
                  <p className="text-xs text-neutral-500 mt-1.5">
                    DeepSeek-V3 researches trends matching this topic daily
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-2 font-medium">
                    Schedule Hour
                  </label>
                  <div className="relative">
                    <select
                      value={scheduleHour}
                      onChange={(e) => setScheduleHour(Number(e.target.value))}
                      className="glass-select w-full px-4 py-3 text-sm appearance-none"
                    >
                      {HOUR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-sm text-neutral-300 font-medium">
                    Automation Active
                  </span>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                      isActive ? "bg-emerald-500" : "bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                        isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
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

            {/* Card 3: Recent Post Logs */}
            <div className="glass-card p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-lg">
                  Recent Posts
                </h2>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/5 animate-pulse"
                    >
                      <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-2 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {(data?.recentLogs?.length ?? 0) > 0 ? (
                    data!.recentLogs!.map((log) => (
                      <LogItem key={log.id} {...log} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500 text-sm">
                        No posts generated yet
                      </p>
                      <p className="text-neutral-600 text-xs mt-1">
                        The cron pipeline hasn't run yet. It will auto-post at your scheduled hour.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LogItem({
  topicTitle,
  status,
  postedAt,
  imageUrl,
  captionGenerated,
}: PostLogData) {
  const isSuccess = status === "SUCCESS";
  return (
    <div className="p-3 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate">
            {topicTitle}
          </p>
          {captionGenerated && (
            <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
              {captionGenerated}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isSuccess
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {isSuccess ? (
                <CheckCircleIcon className="w-3 h-3" />
              ) : (
                <CrossCircleIcon className="w-3 h-3" />
              )}
              {isSuccess ? "Posted" : "Failed"}
            </span>
            <span className="text-xs text-neutral-600">
              {new Date(postedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        {imageUrl && (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        )}
      </div>
    </div>
  );
}
