"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "./Icon";

export function StashButton() {
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo");
  const [stashed, setStashed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!repo) return;
    
    const stashes = JSON.parse(localStorage.getItem("commitmap_stashes") || "[]");
    setStashed(stashes.some((s: any) => s.repo === repo));
  }, [repo]);

  const toggleStash = () => {
    if (!repo) return;
    
    const stashes = JSON.parse(localStorage.getItem("commitmap_stashes") || "[]");
    const isStashed = stashes.some((s: any) => s.repo === repo);
    
    if (isStashed) {
      const filtered = stashes.filter((s: any) => s.repo !== repo);
      localStorage.setItem("commitmap_stashes", JSON.stringify(filtered));
      setStashed(false);
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        repo,
        timestamp: Date.now(),
        label: repo.split("/")[1] || repo
      };
      localStorage.setItem("commitmap_stashes", JSON.stringify([...stashes, newItem]));
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
