"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { SparklesIcon } from "@/components/icons/SparklesIcon";
import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { CrossCircleIcon } from "@/components/icons/CrossCircleIcon";
import { RefreshIcon } from "@/components/icons/RefreshIcon";
import type { DashboardData, PostLogData } from "@/lib/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/config");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isConnected = data?.config !== null;
  const successCount = data?.recentLogs?.filter(l => l.status === "SUCCESS").length || 0;

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-radial-gradient-right pointer-events-none" />

      <Sidebar />

      <main className="pl-64 relative z-10">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-neutral-400 mt-1 text-sm">
                Overview of your Instagram automation pipeline
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                <SparklesIcon className="w-3.5 h-3.5" />
                AI Active
              </div>
              <button
                onClick={fetchData}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-indigo-500/30"
              >
                <RefreshIcon className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-5 animate-slide-up stagger-1">
              <p className="text-xs text-neutral-500 mb-1 font-medium tracking-wide uppercase">Total Posts</p>
              <p className="text-3xl font-bold text-gradient">
                {successCount}
              </p>
              <div className="mt-2 h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min(successCount * 10, 100)}%` }} />
              </div>
            </div>
            <div className="glass-card p-5 animate-slide-up stagger-2">
              <p className="text-xs text-neutral-500 mb-1 font-medium tracking-wide uppercase">Last Posted</p>
              <p className="text-2xl font-bold text-white">
                {data?.config?.lastPostedAt
                  ? new Date(data.config.lastPostedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Never"}
              </p>
              <p className="text-xs text-neutral-600 mt-1">Most recent publish</p>
            </div>
            <div className="glass-card p-5 animate-slide-up stagger-3">
              <p className="text-xs text-neutral-500 mb-1 font-medium tracking-wide uppercase">Account</p>
              <div className="flex items-center gap-2.5 mt-0.5">
                <span className={`relative flex w-3 h-3`}>
                  <span className={`absolute inset-0 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className={`absolute inset-0 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"} animate-ping opacity-30`} />
                </span>
                <p className={`text-2xl font-bold ${isConnected ? "text-gradient-success" : "text-red-400"}`}>
                  {isConnected ? "Connected" : "Offline"}
                </p>
              </div>
              <p className="text-xs text-neutral-600 mt-1">{isConnected ? "Token active" : "Not configured"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up stagger-4">
            {/* Account Connection */}
            <div className="glass-card p-6 lg:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-lg">
                  Connection
                </h2>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5 text-indigo-400" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-neutral-500 mb-1 font-medium">Business ID</p>
                  <p className="text-sm text-neutral-300 font-mono truncate">
                    {data?.config?.instagramBusinessId || "—"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-neutral-500 mb-1 font-medium">Prompt Topic</p>
                  <p className="text-sm text-neutral-300">
                    {data?.config?.promptSettings || "—"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-neutral-500 mb-1 font-medium">Schedule</p>
                  <p className="text-sm text-neutral-300">
                    {data?.config?.scheduleHour !== undefined
                      ? `${String(data.config.scheduleHour).padStart(2, "0")}:00 daily`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Posts */}
            <div className="glass-card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold text-lg">
                  Recent Posts
                </h2>
                <a href="/logs" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  View all →
                </a>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/[0.03] animate-pulse">
                      <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-2 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (data?.recentLogs?.length ?? 0) > 0 ? (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {data!.recentLogs!.map((log) => (
                    <LogItem key={log.id} {...log} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <InstagramIcon className="w-6 h-6 text-neutral-500" />
                  </div>
                  <p className="text-neutral-500 text-sm">No posts generated yet</p>
                  <p className="text-neutral-600 text-xs mt-1">The cron pipeline publishes at your scheduled hour.</p>
                </div>
              )}
            </div>
          </div>

          {/* Post Gallery */}
          {(data?.recentLogs?.length ?? 0) > 0 && (
            <div className="mt-8 animate-slide-up stagger-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Post Gallery</h2>
                <a href="/posts" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  View all →
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {data!.recentLogs!.filter(l => l.status === "SUCCESS" && l.imageUrl).map((log) => (
                  <PostCard key={log.id} {...log} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function PostCard({ topicTitle, imageUrl, postedAt }: PostLogData) {
  const [open, setOpen] = useState(false);
  if (!imageUrl) return null;
  return (
    <>
      <div
        className="glass-card p-2 cursor-pointer group animate-scale-in"
        onClick={() => setOpen(true)}
      >
        <div className="aspect-square rounded-lg overflow-hidden bg-white/5">
          <img
            src={imageUrl}
            alt={topicTitle}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <p className="text-xs text-neutral-300 mt-2 px-1 font-medium truncate">{topicTitle}</p>
        <p className="text-[10px] text-neutral-500 px-1 pb-1">
          {new Date(postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-scale-in" onClick={() => setOpen(false)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt={topicTitle} className="w-full rounded-2xl shadow-2xl border border-white/10" />
            <p className="text-white text-sm mt-3 text-center font-medium">{topicTitle}</p>
            <button onClick={() => setOpen(false)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-sm transition-colors backdrop-blur-sm">✕</button>
          </div>
        </div>
      )}
    </>
  );
}

function LogItem({ topicTitle, status, postedAt, imageUrl, captionGenerated }: PostLogData) {
  const isSuccess = status === "SUCCESS";
  const [imgOpen, setImgOpen] = useState(false);
  return (
    <>
      <div className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer" onClick={() => imageUrl && setImgOpen(true)}>
        <div className="flex items-start gap-3">
          {imageUrl && (
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10">
              <img src={imageUrl} alt={topicTitle} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{topicTitle}</p>
            {captionGenerated && <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{captionGenerated}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isSuccess ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                {isSuccess ? <CheckCircleIcon className="w-3 h-3" /> : <CrossCircleIcon className="w-3 h-3" />}
                {isSuccess ? "Posted" : "Failed"}
              </span>
              <span className="text-xs text-neutral-600">
                {new Date(postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </div>
      {imgOpen && imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-scale-in" onClick={() => setImgOpen(false)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt={topicTitle} className="w-full rounded-2xl shadow-2xl border border-white/10" />
            <p className="text-white text-sm mt-3 text-center font-medium">{topicTitle}</p>
            <button onClick={() => setImgOpen(false)} className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-sm transition-colors backdrop-blur-sm">✕</button>
          </div>
        </div>
      )}
    </>
  );
}
