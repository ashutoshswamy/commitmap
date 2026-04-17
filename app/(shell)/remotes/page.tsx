import { TopBar } from "../../components/TopBar";
import { EmptyState, ErrorState } from "../../components/EmptyState";
import {
  getForks,
  getRepo,
  GitHubError,
  parseRepoInput,
  type Repo,
} from "../../lib/github";
import Link from "next/link";
import { Icon } from "../../components/Icon";

type SP = { repo?: string };

export default async function RemotesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const ref = sp.repo ? parseRepoInput(sp.repo) : null;

  if (!ref) {
    return (
      <>
        <TopBar />
        <EmptyState title="No repository selected" body="Pick a repo from the landing page to view its remotes & forks." />
      </>
    );
  }

  const repoSlug = `${ref.owner}/${ref.repo}`;

  let data;
  try {
    const [repo, forks] = await Promise.all([
      getRepo(ref),
      getForks(ref).catch(() => []),
    ]);

    data = { repo, forks };
  } catch (e) {
    const err = e as GitHubError;
    return (
      <>
        <TopBar repo={repoSlug} />
        <ErrorState
          title="Failed to load network"
          body={err.message || "Unable to fetch repository details."}
        />
      </>
    );
  }

  const { repo, forks } = data;

  return (
    <>
      <TopBar repo={repoSlug} />
      <main className="flex-1 min-h-0 overflow-auto bg-surface-container-lowest">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
          <header className="mb-12">
            <h1 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">
              Network
            </h1>
            <p className="text-on-surface-variant/70 text-sm">
              Explore the upstream project and community forks.
            </p>
          </header>

          <div className="space-y-12">
            {/* Upstream / Source Section */}
            {(repo.parent || repo.source) && (
              <section>
                <div className="flex items-center gap-3 mb-4 px-1">
                  <span className="text-primary">
                    <Icon name="cloud" size={18} />
                  </span>
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50">
                    Upstream
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {repo.parent && (
                    <RepoCard
                      repo={repo.parent as Repo}
                      label="Parent"
                      description="Direct upstream repository."
                    />
                  )}
                  {repo.source &&
                    repo.source.full_name !== repo.parent?.full_name && (
                      <RepoCard
                        repo={repo.source as Repo}
                        label="Root Source"
                        description="The original ancestor repository."
                      />
                    )}
                </div>
              </section>
            )}

            {/* Forks Section */}
            <section>
              <div className="flex items-center gap-3 mb-6 px-1">
                <span className="text-secondary">
                  <Icon name="fork" size={18} />
                </span>
                <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50">
                  Forks ({repo.forks_count})
                </h2>
              </div>

              {forks.length === 0 ? (
                <div className="rounded-sm border border-dashed border-outline-variant/30 p-12 text-center">
                  <div className="w-10 h-10 rounded-full bg-surface-container mx-auto mb-4 grid place-items-center text-on-surface-variant/40">
                    <Icon name="fork" size={16} />
                  </div>
                  <p className="text-sm text-on-surface-variant/60">
                    No forks found for this repository.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {forks.map((f) => (
                    <RepoCard key={f.full_name} repo={f} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function RepoCard({
  repo,
  label,
  description,
}: {
  repo: Repo;
  label?: string;
  description?: string;
}) {
  const fullSlug = repo.full_name;
  return (
    <div className="group relative flex flex-col bg-background rounded-sm ring-1 ring-outline-variant/15 p-5 hover:ring-primary/40 transition-all ease-ledger duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {repo.owner?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={repo.owner.avatar_url} alt="" className="w-8 h-8 rounded-sm shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-sm bg-surface-container shrink-0 grid place-items-center"><Icon name="users" size={14} /></div>
          )}
          <div className="min-w-0">
            {label && <span className="block font-mono text-[9px] uppercase tracking-widest text-primary mb-0.5">{label}</span>}
            <h3 className="font-headline font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">{repo.full_name}</h3>
          </div>
        </div>
      </div>
      
      {description && <p className="text-xs text-on-surface-variant/70 mb-4 line-clamp-1">{description}</p>}
      
      <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] font-mono text-on-surface-variant/60">
           <span className="flex items-center gap-1"><Icon name="star" size={12} className="text-secondary" /> {repo.stargazers_count ?? 0}</span>
           <span className="flex items-center gap-1"><Icon name="fork" size={12} className="text-secondary" /> {repo.forks_count ?? 0}</span>
        </div>
        <Link 
          href={`/dashboard?repo=${fullSlug}`}
          className="px-2.5 py-1 rounded-sm bg-surface-container-high text-[11px] font-label text-on-surface hover:bg-primary hover:text-on-primary transition-all"
        >
          Explore
        </Link>
      </div>
    </div>
  );
}
