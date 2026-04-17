"use client";

import { useState, useEffect } from "react";
import { Icon } from "./Icon";
import Link from "next/link";
import { relativeTime } from "../lib/github";

type StashItem = {
  id: string;
  repo: string;
  label: string;
  timestamp: number;
};

export function StashList() {
  const [stashes, setStashes] = useState<StashItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadStashes = () => {
    const data = JSON.parse(localStorage.getItem("commitmap_stashes") || "[]");
    setStashes(data.sort((a: StashItem, b: StashItem) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    setMounted(true);
    loadStashes();

    const handleUpdate = () => loadStashes();
    window.addEventListener("stashes_updated", handleUpdate);
    return () => window.removeEventListener("stashes_updated", handleUpdate);
  }, []);

  const removeStash = (id: string) => {
    const filtered = stashes.filter(s => s.id !== id);
    localStorage.setItem("commitmap_stashes", JSON.stringify(filtered));
    setStashes(filtered);
    window.dispatchEvent(new Event("stashes_updated"));
  };

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-surface-container rounded-sm border border-outline-variant/10" />
        ))}
      </div>
    );
  }

  if (stashes.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-outline-variant/30 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-surface-container mx-auto mb-6 grid place-items-center text-on-surface-variant/30">
          <Icon name="stash" size={24} />
        </div>
        <h2 className="font-headline font-semibold text-lg text-on-surface mb-2">No stashed items yet</h2>
        <p className="text-sm text-on-surface-variant/60 max-w-xs mx-auto mb-8">Click the "Stash" button in the top bar of any project to save it here.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-gradient-primary text-on-primary text-sm font-label shadow-lg shadow-primary/20">
          Browse repositories <Icon name="arrow-right" size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {stashes.map((s) => (
        <div 
          key={s.id} 
          className="group relative flex items-center justify-between bg-background rounded-sm ring-1 ring-outline-variant/15 p-5 hover:ring-primary/40 hover:bg-surface-container-low/30 transition-all duration-300"
        >
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-10 h-10 rounded-sm bg-surface-container grid place-items-center text-primary group-hover:bg-primary/10 transition-colors">
              <Icon name="stash" size={18} />
            </div>
            <div className="min-w-0">
              <Link 
                href={`/dashboard?repo=${s.repo}`}
                className="font-headline font-bold text-base text-on-surface hover:text-primary transition-colors block truncate"
              >
                {s.repo}
              </Link>
              <div className="flex items-center gap-3 mt-0.5 font-mono text-[10px] text-on-surface-variant/50">
                <span>stashed {relativeTime(new Date(s.timestamp).toISOString())}</span>
                <span>·</span>
                <a 
                  href={`https://github.com/${s.repo}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1"
                >
                  View on GitHub <Icon name="external" size={10} />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href={`/dashboard?repo=${s.repo}`}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-surface-container-high text-xs font-label text-on-surface hover:bg-primary hover:text-on-primary transition-all"
            >
              Open <Icon name="play" size={12} />
            </Link>
            <button 
              onClick={() => removeStash(s.id)}
              className="p-1.5 rounded-sm text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-all"
              title="Remove stash"
            >
              <Icon name="minus" size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
