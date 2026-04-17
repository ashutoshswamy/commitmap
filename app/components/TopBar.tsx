import { BranchSelector } from "./BranchSelector";
import { getBranches, parseRepoInput } from "../lib/github";
import { StashButton } from "./StashButton";
import { Suspense } from "react";

export async function TopBar({
  repo,
  branch,
  branches,
  branchParam = "branch",
}: {
  repo?: string;
  branch?: string;
  branches?: string[];
  branchParam?: string;
}) {
  let fetchedBranches = branches ?? [];
  if (repo && branch && fetchedBranches.length === 0) {
    const ref = parseRepoInput(repo);
    if (ref) {
      try {
        const bd = await getBranches(ref);
        fetchedBranches = bd.map((b) => b.name);
      } catch {
        // Ignore error
      }
    }
  }
  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 gap-4 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 font-mono text-xs text-on-surface-variant/70 min-w-0">
          <span className="hidden sm:inline text-on-surface-variant/40">repo</span>
          <span className="hidden sm:inline text-on-surface-variant/30">/</span>
          <span className="truncate text-on-surface font-semibold sm:font-normal">
            {repo ?? "— no repo —"}
          </span>
          {branch && (
            <div className="ml-1 sm:ml-2 inline-block shrink-0">
              {fetchedBranches && fetchedBranches.length > 0 ? (
                <Suspense fallback={<div className="w-24 h-6 animate-pulse bg-secondary/10 rounded-sm" />}>
                  <BranchSelector
                    branches={fetchedBranches}
                    currentBranch={branch}
                    paramName={branchParam}
                    compact={true}
                  />
                </Suspense>
              ) : (
                <span className="px-1.5 py-0.5 rounded-sm text-[10px] bg-secondary/10 text-secondary ring-1 ring-secondary/20 uppercase font-mono tracking-[0.05em]">
                  {branch}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Suspense fallback={<div className="w-16 h-8 animate-pulse bg-surface-container rounded-sm" />}>
          <StashButton />
        </Suspense>
      </div>
    </header>
  );
}
