"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CheckCircleIcon } from "@/components/icons/CheckCircleIcon";
import { CrossCircleIcon } from "@/components/icons/CrossCircleIcon";

interface PostLog {
  id: string;
  topicTitle: string;
  captionGenerated: string | null;
  imageUrl: string | null;
  status: string;
  errorMessage: string | null;
  postedAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<PostLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.recentLogs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-radial-gradient-right pointer-events-none" />
      <Sidebar />
      <main className="pl-64 relative z-10">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8 animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Activity Log</h1>
              <p className="text-neutral-400 mt-1 text-sm">All pipeline runs with status and errors</p>
            </div>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-neutral-400 transition-all"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-sm">No activity yet</p>
              <p className="text-neutral-600 text-xs mt-1">Pipeline runs will appear here once the cron publishes posts.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={log.id} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="flex items-start gap-4">
                    {log.imageUrl && (
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white/5">
                        <img src={log.imageUrl} alt={log.topicTitle} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-white font-medium truncate">{log.topicTitle}</p>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${log.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                          {log.status === "SUCCESS" ? <CheckCircleIcon className="w-3 h-3" /> : <CrossCircleIcon className="w-3 h-3" />}
                          {log.status === "SUCCESS" ? "Posted" : "Failed"}
                        </span>
                      </div>
                      {log.captionGenerated && (
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{log.captionGenerated}</p>
                      )}
                      {log.errorMessage && (
                        <p className="text-xs text-red-400 mt-1 font-mono bg-red-500/5 px-2 py-1 rounded-lg">{log.errorMessage}</p>
                      )}
                      <p className="text-xs text-neutral-600 mt-2">
                        {new Date(log.postedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
