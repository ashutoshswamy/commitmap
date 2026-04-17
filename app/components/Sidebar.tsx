"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { GitMerge } from "lucide-react";

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Overview", icon: "sparkle" },
  { href: "/timeline", label: "History", icon: "timeline" },
  { href: "/diff", label: "Compare", icon: "compare" },
  { href: "/files", label: "Files", icon: "folder" },
];

const secondary: { href: string; label: string; icon: IconName }[] = [
  { href: "/branches", label: "Branches", icon: "branch" },
  { href: "/stashes", label: "Stashes", icon: "stash" },
  { href: "/remotes", label: "Remotes", icon: "cloud" },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo");
  const withRepo = (href: string) =>
    repo && href.startsWith("/") ? `${href}?repo=${repo}` : href;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-surface-container-low h-screen sticky top-0 z-20">
      <div className="px-6 pt-7 pb-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative w-7 h-7 grid place-items-center">
            <span className="absolute inset-0 bg-gradient-primary rounded-sm opacity-90 group-hover:opacity-100 transition-opacity" />
            <GitMerge className="relative w-4 h-4 text-on-primary" strokeWidth={2.4} />
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-headline font-black tracking-tighter text-[15px] text-on-surface">
              CommitMap
            </span>
          </div>
        </Link>
      </div>

      <div className="px-3">
        <div className="px-4 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/50">
          Workspace
        </div>
        <nav className="flex flex-col gap-0.5">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={withRepo(item.href)}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-label transition-colors ease-ledger duration-300 ${
                  active
                    ? "bg-surface-container-high text-primary"
                    : "text-on-surface/60 hover:text-on-surface hover:bg-surface-container-low/60"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r transition-all ease-ledger ${
                    active
                      ? "bg-primary shadow-[0_0_8px_rgba(221,184,255,0.6)]"
                      : "bg-transparent"
                  }`}
                />
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 mt-6">
        <div className="px-4 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/50">
          Refs
        </div>
        <nav className="flex flex-col gap-0.5">
          {secondary.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={withRepo(item.href)}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-label transition-colors ease-ledger duration-300 ${
                  active
                    ? "bg-surface-container-high text-primary"
                    : "text-on-surface/50 hover:text-on-surface hover:bg-surface-container-low/60"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r transition-all ease-ledger ${
                    active
                      ? "bg-primary shadow-[0_0_8px_rgba(221,184,255,0.6)]"
                      : "bg-transparent"
                  }`}
                />
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto px-4 pb-6 pt-8 flex flex-col gap-4">
        <Link
          href="/"
          className="relative w-full py-2.5 px-4 rounded-sm bg-gradient-primary text-on-primary font-semibold text-sm tracking-tight shadow-[0_8px_28px_-10px_rgba(221,184,255,0.55)] hover:shadow-[0_10px_36px_-8px_rgba(221,184,255,0.75)] transition-shadow ease-ledger duration-500 text-center"
        >
          New repository
        </Link>
        <div className="flex flex-col gap-0.5 pt-3 border-t border-outline-variant/10 mt-2">
          <div className="px-4 pb-2 pt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/50">
            Developer
          </div>
          <a
            href="https://github.com/ashutoshswamy"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-2 rounded-sm text-[13px] font-label text-on-surface/40 hover:text-on-surface/80 transition-colors"
          >
            <Icon name="external" size={14} />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/ashutoshswamy"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-2 rounded-sm text-[13px] font-label text-on-surface/40 hover:text-on-surface/80 transition-colors"
          >
            <Icon name="external" size={14} />
            LinkedIn
          </a>
          <a
            href="https://twitter.com/ashutoshswamy_"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-2 rounded-sm text-[13px] font-label text-on-surface/40 hover:text-on-surface/80 transition-colors"
          >
            <Icon name="external" size={14} />
            Twitter
          </a>
        </div>
      </div>
    </aside>
  );
}
