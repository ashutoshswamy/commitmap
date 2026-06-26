import { TopBar } from "../../components/TopBar";
import { StashList } from "../../components/StashList";
import { parseRepoInput } from "../../lib/github";
import type { Metadata } from "next";

type SP = { repo?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const repo = sp.repo || "";
  return {
    title: repo ? `Stashes | ${repo}` : "Stashes",
    description: repo ? `View bookmarked repositories and saved views for ${repo} on CommitMap.` : "View bookmarked repositories and saved views on CommitMap.",
  };
}

export default async function StashesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const ref = sp.repo ? parseRepoInput(sp.repo) : null;
  const repoSlug = ref ? `${ref.owner}/${ref.repo}` : undefined;

  return (
    <>
      <TopBar repo={repoSlug} />
      <main className="flex-1 min-h-0 overflow-auto bg-surface-container-lowest">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
          <header className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h1 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Stashes</h1>
              <p className="text-on-surface-variant/70 text-sm font-light">Your bookmarked repositories and saved views.</p>
            </div>
          </header>

          <StashList />
        </div>
      </main>
    </>
  );
}
