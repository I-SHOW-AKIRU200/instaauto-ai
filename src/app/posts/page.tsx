"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

interface Post {
  id: string;
  topicTitle: string;
  imageUrl: string | null;
  captionGenerated: string | null;
  status: string;
  postedAt: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Post | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setPosts((data.recentLogs || []).filter((l: Post) => l.status === "SUCCESS" && l.imageUrl));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="fixed inset-0 bg-radial-gradient pointer-events-none" />
      <div className="fixed inset-0 bg-radial-gradient-right pointer-events-none" />
      <Sidebar />
      <main className="pl-64 relative z-10">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Post Gallery
            </h1>
            <p className="text-neutral-400 mt-1 text-sm">
              All generated posts with images
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-sm">No posts with images yet</p>
              <p className="text-neutral-600 text-xs mt-1">Posts will appear here once the cron pipeline publishes them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card p-2 cursor-pointer group animate-scale-in"
                  onClick={() => setSelected(post)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-white/5">
                    <img
                      src={post.imageUrl!}
                      alt={post.topicTitle}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-neutral-300 mt-2 px-1 font-medium truncate">
                    {post.topicTitle}
                  </p>
                  <p className="text-[10px] text-neutral-500 px-1 pb-1">
                    {new Date(post.postedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-2xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img
              src={selected.imageUrl!}
              alt={selected.topicTitle}
              className="w-full rounded-2xl shadow-2xl border border-white/10"
            />
            <p className="text-white text-base mt-4 text-center font-medium">
              {selected.topicTitle}
            </p>
            {selected.captionGenerated && (
              <p className="text-neutral-400 text-sm mt-2 text-center max-w-lg mx-auto">
                {selected.captionGenerated}
              </p>
            )}
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-sm transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
