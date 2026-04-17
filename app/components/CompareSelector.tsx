"use client";

import { useRouter } from "next/navigation";

export function CompareSelector({
  repoSlug,
  commits,
  base,
  head,
}: {
  repoSlug: string;
  commits: { sha: string; message: string }[];
  base: string;
  head: string;
}) {
  const router = useRouter();

  const handleBaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/diff?repo=${repoSlug}&base=${e.target.value}&head=${head}`);
  };

  const handleHeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/diff?repo=${repoSlug}&base=${base}&head=${e.target.value}`);
  };

  const shortSha = (sha: string) => sha.slice(0, 7);

  return (
    <div className="font-mono text-xs text-on-surface flex items-center gap-2">
      <div className="relative flex items-center">
        <span className="px-1.5 py-0.5 rounded-sm bg-surface-container-high hover:bg-surface-container-highest transition-colors text-primary pointer-events-none">
          {shortSha(base)}
        </span>
        <select
          className="absolute inset-0 opacity-0 cursor-pointer w-[40px]"
          value={base}
          onChange={handleBaseChange}
          title="Select Base Commit"
        >
          <option value={base} hidden>{shortSha(base)}</option>
          {commits.map((c) => (
            <option key={c.sha} value={c.sha}>
              {shortSha(c.sha)} - {c.message.split("\n")[0]}
            </option>
          ))}
          {!commits.some((c) => c.sha === base) && (
            <option value={base}>{shortSha(base)} - (Older Commit)</option>
          )}
        </select>
      </div>

      <span className="text-on-surface-variant/40">→</span>

      <div className="relative flex items-center">
        <span className="px-1.5 py-0.5 rounded-sm bg-surface-container-high hover:bg-surface-container-highest transition-colors text-secondary pointer-events-none">
          {shortSha(head)}
        </span>
        <select
          className="absolute inset-0 opacity-0 cursor-pointer w-[40px]"
          value={head}
          onChange={handleHeadChange}
          title="Select Head Commit"
        >
          <option value={head} hidden>{shortSha(head)}</option>
          {commits.map((c) => (
            <option key={c.sha} value={c.sha}>
              {shortSha(c.sha)} - {c.message.split("\n")[0]}
            </option>
          ))}
          {!commits.some((c) => c.sha === head) && (
            <option value={head}>{shortSha(head)} - (Older Commit)</option>
          )}
        </select>
      </div>
    </div>
  );
}
