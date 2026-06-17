"use client";

import Link from "next/link";
import { InstagramIcon } from "./icons/InstagramIcon";
import { HomeIcon } from "./icons/HomeIcon";
import { SettingsIcon } from "./icons/SettingsIcon";
import { LogIcon } from "./icons/LogIcon";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/dashboard", label: "Settings", icon: SettingsIcon },
  { href: "/dashboard", label: "Activity Log", icon: LogIcon },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-20 flex flex-col">
      <div className="flex-1 glass-card rounded-none border-l-0 border-t-0 border-b-0 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <InstagramIcon className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              InstaAuto<span className="text-indigo-400">AI</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-200 group"
              >
                <Icon className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/10">
            <p className="text-xs text-neutral-500">Daily Schedule</p>
            <p className="text-sm text-indigo-300 font-medium">Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
