"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Icon } from "./Icon";

export function BranchSelector({
  branches,
  currentBranch,
  paramName = "branch",
  compact = false,
}: {
  branches: string[];
  currentBranch: string;
  paramName?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="relative flex items-center">
      {compact ? (
        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] uppercase font-mono tracking-[0.05em] bg-secondary/10 text-secondary ring-1 ring-secondary/20 pointer-events-none">
          {currentBranch}
          <Icon name="chevron-down" size={10} />
        </span>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-surface-container text-sm font-label text-on-surface pointer-events-none">
          <span className="text-primary">
            <Icon name="branch" size={14} />
          </span>
          {currentBranch}
          <Icon name="chevron-down" size={12} />
        </div>
      )}
      <select
        className="absolute inset-0 opacity-0 cursor-pointer"
        value={currentBranch}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set(paramName, e.target.value);
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
    </div>
  );
}
