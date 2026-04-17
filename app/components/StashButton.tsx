"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "./Icon";

interface StashItem {
  id: string;
  repo: string;
  timestamp: number;
  label: string;
}

export function StashButton() {
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo");
  const [stashed, setStashed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted || !repo) return;

    const data = localStorage.getItem("commitmap_stashes");
    const stashes: StashItem[] = data ? JSON.parse(data) : [];
    // Use microtask to avoid synchronous setState warning
    Promise.resolve().then(() => {
      setStashed(stashes.some((s) => s.repo === repo));
    });
  }, [mounted, repo]);

  const toggleStash = () => {
    if (!repo) return;

    const data = localStorage.getItem("commitmap_stashes");
    const stashes: StashItem[] = data ? JSON.parse(data) : [];
    const isStashed = stashes.some((s) => s.repo === repo);

    if (isStashed) {
      const filtered = stashes.filter((s) => s.repo !== repo);
      localStorage.setItem("commitmap_stashes", JSON.stringify(filtered));
      setStashed(false);
    } else {
      const newItem: StashItem = {
        id: crypto.randomUUID(),
        repo,
        timestamp: Date.now(),
        label: repo.split("/")[1] || repo,
      };
      localStorage.setItem(
        "commitmap_stashes",
        JSON.stringify([...stashes, newItem]),
      );
      setStashed(true);
    }
    
    // Dispatch a custom event to notify the Stashes page if it's open in another tab or same page
    window.dispatchEvent(new Event("stashes_updated"));
  };

  if (!repo || !mounted) return null;

  return (
    <button
      onClick={toggleStash}
      title={stashed ? "Remove from stashes" : "Stash repository"}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-label transition-all duration-300 ${
        stashed 
          ? "bg-primary/15 text-primary ring-1 ring-primary/30" 
          : "bg-surface-container text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high"
      }`}
    >
      <Icon 
        name="stash" 
        size={14} 
        className={`${stashed ? "fill-primary/20" : "group-hover:scale-110 transition-transform"}`} 
      />
      <span>{stashed ? "Stashed" : "Stash"}</span>
    </button>
  );
}
