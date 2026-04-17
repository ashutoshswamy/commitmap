import { TopBar } from "../../components/TopBar";
import { EmptyState } from "../../components/EmptyState";
import { getBranches, parseRepoInput } from "../../lib/github";
import Link from "next/link";
import { Icon } from "../../components/Icon";
import { Suspense } from "react";

type SP = { repo?: string };

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const ref = sp.repo ? parseRepoInput(sp.repo) : null;

  if (!ref) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <TopBar />
        <EmptyState
          title="No repository selected"
          body="Pick a repo from the landing page to view its branches."
        />
      </Suspense>
    );
  }

  const repoSlug = `${ref.owner}/${ref.repo}`;
  const branches = await getBranches(ref).catch(() => []);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <TopBar repo={repoSlug} />
      <main className="flex-1 min-h-0 overflow-hidden flex flex-col bg-surface-container-lowest p-6 lg:p-8">
        <h1 className="font-headline font-bold text-2xl text-on-surface mb-6">
          Branches
        </h1>
        <div className="flex-1 overflow-auto rounded-sm ring-1 ring-outline-variant/15 bg-background">
          {branches.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant/60 font-mono text-xs">
              No branches found.
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/10">
              {branches.map((b) => (
                <li
                  key={b.name}
                  className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-secondary">
                      <Icon name="branch" size={16} />
                    </span>
                    <span className="text-sm font-label text-on-surface font-semibold">
                      {b.name}
                    </span>
                  </div>
                  <Link
                    href={`/timeline?repo=${repoSlug}&branch=${b.name}`}
                    className="px-3 py-1.5 rounded-sm bg-surface-container text-xs font-label text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    View timeline
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </Suspense>
  );
}
