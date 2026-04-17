import Link from "next/link";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { BranchSelector } from "../../components/BranchSelector";
import { EmptyState, ErrorState } from "../../components/EmptyState";
import {
  GitHubError,
  getCommit,
  getRepo,
  getBranches,
  listCommits,
  parseRepoInput,
  parseSubject,
  relativeTime,
  shortSha,
  type Commit,
  type CommitFile,
} from "../../lib/github";

type SP = { repo?: string; sha?: string; branch?: string };

const rowHeight = 110;
const laneColors = ["#ddb8ff", "#44e2cd", "#ffb2b9", "#a74bfe", "#62fae3"];

export default async function TimelinePage({
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
        <EmptyState />
      </>
    );
  }

  const repoSlug = `${ref.owner}/${ref.repo}`;

  try {
    const [repo, branchData] = await Promise.all([
      getRepo(ref),
      getBranches(ref).catch(() => []),
    ]);

    const branches = branchData.map((b) => b.name);
    const activeBranch = sp.branch || repo.default_branch;

    const commits = await listCommits(ref, {
      sha: activeBranch,
      per_page: 25,
    });

    const activeSha = sp.sha && commits.find((c) => c.sha === sp.sha)
      ? sp.sha
      : commits[0]?.sha;

    const detail = activeSha
      ? await getCommit(ref, activeSha).catch(() => null)
      : null;

    const lanes = assignLanes(commits);

    return (
      <>
        <TopBar repo={repoSlug} branch={activeBranch} />
        <main className="flex-1 min-h-0 overflow-hidden flex">
          <section className="flex-1 min-w-0 flex flex-col bg-surface-container-lowest">
            <div className="px-6 lg:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <BranchSelector
                  branches={branches}
                  currentBranch={activeBranch}
                />
                <span className="font-mono text-[11px] text-on-surface-variant/60">
                  {commits.length} commits · {new Set(lanes).size} lanes
                </span>
              </div>
              <Link
                href={`/diff?repo=${repoSlug}&base=${commits[1]?.sha ?? ""}&head=${commits[0]?.sha ?? ""}`}
                className="px-3 py-1.5 rounded-sm bg-surface-container text-xs font-label text-on-surface-variant/80 hover:bg-surface-container-high transition-colors flex items-center gap-2"
              >
                <Icon name="compare" size={12} /> Compare latest two
              </Link>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="relative px-6 lg:px-8 pt-2 pb-24">
                <div
                  className="relative"
                  style={{ minHeight: commits.length * rowHeight + 40 }}
                >
                  <svg
                    className="absolute top-0 bottom-0 left-0 w-24 lg:w-32 pointer-events-none"
                    width={120}
                    height={commits.length * rowHeight + 40}
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <GraphLines lanes={lanes} />
                  </svg>

                  <ul className="relative flex flex-col" style={{ gap: 0 }}>
                    {commits.map((c, i) => {
                      const { subject, body } = parseSubject(
                        c.commit.message,
                      );
                      const lane = lanes[i];
                      const laneColor =
                        laneColors[lane % laneColors.length];
                      const isActive = c.sha === activeSha;
                      const x = (lane * 16) + 20; // Slightly tighter lanes for better mobile fit
                      return (
                        <li
                          key={c.sha}
                          className="relative"
                          style={{ height: rowHeight }}
                        >
                          <span
                            className="absolute z-10"
                            style={{ left: x - 6, top: rowHeight / 2 - 6 }}
                          >
                            <span
                              className="block w-3 h-3 rounded-full ring-2 ring-background"
                              style={{
                                background: laneColor,
                                boxShadow: isActive
                                  ? `0 0 14px ${laneColor}`
                                  : "none",
                              }}
                            />
                          </span>

                          <Link
                            href={`/timeline?repo=${repoSlug}&sha=${c.sha}`}
                            scroll={false}
                            className={`absolute left-24 lg:left-32 right-0 top-1/2 -translate-y-1/2 block rounded-sm transition-all ease-ledger group ${
                              isActive
                                ? "bg-surface-container-high ring-1 ring-outline-variant/20 shadow-[0_10px_40px_-16px_rgba(0,0,0,0.8)]"
                                : "bg-surface-container-low hover:bg-surface-container"
                            }`}
                          >
                            {isActive && (
                              <span
                                className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-sm"
                                style={{ background: laneColor }}
                              />
                            )}
                            <div className="p-4 lg:p-5">
                              <div className="flex items-start justify-between gap-4">
                                <h3
                                  className={`font-headline leading-tight line-clamp-1 ${
                                    isActive
                                      ? "text-lg font-bold text-on-surface"
                                      : "text-base font-semibold text-on-surface group-hover:text-primary transition-colors"
                                  }`}
                                >
                                  {subject}
                                </h3>
                                <span
                                  className={`shrink-0 font-mono text-[11px] px-2 py-1 rounded-sm ${
                                    isActive
                                      ? "text-primary bg-primary/10 ring-1 ring-primary/20"
                                      : "text-on-surface-variant/70 bg-surface-container"
                                  }`}
                                >
                                  {shortSha(c.sha)}
                                </span>
                              </div>

                              {body && isActive && (
                                <p className="mt-2 text-sm text-on-surface-variant/75 max-w-2xl leading-relaxed line-clamp-2">
                                  {body}
                                </p>
                              )}

                              <div className="mt-3 flex items-center gap-4 text-xs font-label text-on-surface-variant/70 flex-wrap">
                                <span className="flex items-center gap-2">
                                  {c.author?.avatar_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={`${c.author.avatar_url}&s=40`}
                                      alt={c.author.login}
                                      className="w-5 h-5 rounded-sm object-cover"
                                    />
                                  ) : (
                                    <span className="w-5 h-5 rounded-sm bg-gradient-to-br from-primary/35 to-secondary/20" />
                                  )}
                                  <span
                                    className={
                                      isActive ? "text-on-surface" : ""
                                    }
                                  >
                                    {c.author?.login ??
                                      c.commit.author.name}
                                  </span>
                                </span>
                                <span className="text-on-surface-variant/40">
                                  ·
                                </span>
                                <span>
                                  {relativeTime(c.commit.author.date)}
                                </span>
                                {c.parents.length > 1 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-mono text-tertiary bg-tertiary/10 ring-1 ring-tertiary/20">
                                    <Icon name="branch" size={10} /> merge
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <aside className="hidden xl:flex w-[440px] shrink-0 flex-col bg-surface border-l border-outline-variant/10">
            <DetailPanel
              commit={detail}
              fallback={commits.find((c) => c.sha === activeSha)}
              repoSlug={repoSlug}
            />
          </aside>
        </main>
      </>
    );
  } catch (e) {
    const err = e as GitHubError;
    return (
      <>
        <TopBar repo={repoSlug} />
        <ErrorState
          code={err.status}
          title={err.status === 404 ? "Repository not found" : "Failed to load timeline"}
          body={err.message || "Unable to load commits."}
        />
      </>
    );
  }
}

function assignLanes(commits: Commit[]): number[] {
  // Simple lane assignment: follow first-parent on lane 0, branch merges bump.
  const lanes: number[] = [];
  const shaToLane = new Map<string, number>();
  let nextLane = 0;

  // Walk oldest first for stability
  const ordered = [...commits].reverse();
  const walkLanes: number[] = [];

  for (const c of ordered) {
    let lane = shaToLane.get(c.sha);
    if (lane === undefined) {
      lane = nextLane++ % laneColors.length;
    }
    walkLanes.push(lane);
    const parents = c.parents;
    if (parents[0]) {
      if (!shaToLane.has(parents[0].sha)) {
        shaToLane.set(parents[0].sha, lane);
      }
    }
    for (let i = 1; i < parents.length; i++) {
      if (!shaToLane.has(parents[i].sha)) {
        shaToLane.set(parents[i].sha, nextLane++ % laneColors.length);
      }
    }
  }

  for (let i = 0; i < ordered.length; i++) {
    lanes[ordered.length - 1 - i] = walkLanes[i];
  }
  return lanes;
}

function GraphLines({ lanes }: { lanes: number[] }) {
  const paths: { d: string; color: string; key: string }[] = [];
  for (let i = 0; i < lanes.length - 1; i++) {
    const y1 = (i + 0.5) * rowHeight;
    const y2 = (i + 1.5) * rowHeight;
    const x1 = (lanes[i] * 16) + 20;
    const x2 = (lanes[i + 1] * 16) + 20;
    const color = laneColors[lanes[i + 1] % laneColors.length];
    if (x1 === x2) {
      paths.push({
        key: `s-${i}`,
        color,
        d: `M ${x1} ${y1} L ${x2} ${y2}`,
      });
    } else {
      const my = (y1 + y2) / 2;
      paths.push({
        key: `c-${i}`,
        color,
        d: `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`,
      });
    }
  }
  return (
    <g>
      {paths.map((p) => (
        <path
          key={p.key}
          d={p.d}
          stroke={p.color}
          strokeOpacity="0.55"
          strokeWidth="1.5"
          fill="none"
        />
      ))}
    </g>
  );
}

function DetailPanel({
  commit,
  fallback,
  repoSlug,
}: {
  commit: Commit | null;
  fallback?: Commit;
  repoSlug: string;
}) {
  const c = commit ?? fallback;
  if (!c) {
    return (
      <div className="p-6 text-sm text-on-surface-variant/60">
        Select a commit to inspect.
      </div>
    );
  }
  const { subject, body } = parseSubject(c.commit.message);
  const files = commit?.files ?? [];
  const stats = commit?.stats;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-6 bg-surface-container-high/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs text-primary">
            commit {shortSha(c.sha)}
          </span>
          <div className="flex gap-1">
            <a
              href={c.html_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-sm text-on-surface-variant/60 hover:text-primary hover:bg-surface-container transition-colors"
            >
              <Icon name="external" size={14} />
            </a>
          </div>
        </div>
        <h2 className="font-headline font-bold text-xl text-on-surface leading-tight tracking-tight">
          {subject}
        </h2>
        {body && (
          <p className="mt-3 text-sm text-on-surface-variant/75 whitespace-pre-wrap leading-relaxed max-h-32 overflow-hidden">
            {body}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between font-label text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {c.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${c.author.avatar_url}&s=64`}
                alt={c.author.login}
                className="w-8 h-8 rounded-sm object-cover"
              />
            ) : (
              <span className="w-8 h-8 rounded-sm bg-gradient-to-br from-primary/40 to-secondary/20" />
            )}
            <div className="min-w-0">
              <div className="text-on-surface font-medium text-sm truncate">
                {c.author?.login ?? c.commit.author.name}
              </div>
              <div className="font-mono text-on-surface-variant/60 text-[11px] truncate">
                {c.commit.author.email}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/50">
              authored
            </div>
            <div className="font-mono text-on-surface text-xs">
              {relativeTime(c.commit.author.date)}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 flex items-center justify-between bg-surface-container-low text-xs font-label">
        <span className="text-on-surface-variant/70">
          {files.length} file{files.length !== 1 ? "s" : ""} changed
        </span>
        {stats && (
          <div className="flex items-center gap-4 font-mono">
            <span className="text-secondary">+{stats.additions}</span>
            <span className="text-error">−{stats.deletions}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-background p-4 space-y-4">
        {files.slice(0, 6).map((f) => (
          <FileDiff key={f.filename} file={f} />
        ))}
        {files.length > 6 && (
          <div className="text-xs font-mono text-on-surface-variant/50 text-center py-4">
            + {files.length - 6} more files
          </div>
        )}
        {files.length === 0 && (
          <div className="text-xs font-mono text-on-surface-variant/50 text-center py-8">
            no file diff available
          </div>
        )}
        <div className="pt-2 pb-4">
          <Link
            href={`/diff?repo=${repoSlug}&head=${c.sha}${c.parents[0] ? `&base=${c.parents[0].sha}` : ""}`}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-sm bg-surface-container-high text-on-surface font-label text-xs hover:bg-surface-container-highest transition-colors"
          >
            <Icon name="compare" size={12} /> Open full diff
          </Link>
        </div>
      </div>
    </div>
  );
}

function FileDiff({ file }: { file: CommitFile }) {
  const lines = file.patch ? parsePatch(file.patch).slice(0, 18) : [];
  return (
    <div className="rounded-sm overflow-hidden ring-1 ring-outline-variant/15">
      <header className="bg-surface-container flex items-center justify-between px-4 py-2 font-mono text-xs">
        <span className="flex items-center gap-2 text-on-surface truncate">
          <Icon name="file" size={12} />
          {file.filename}
        </span>
        <span className="flex gap-2 shrink-0">
          <span className="text-secondary">+{file.additions}</span>
          <span className="text-error">−{file.deletions}</span>
        </span>
      </header>
      {lines.length === 0 ? (
        <div className="bg-surface-container-lowest font-mono text-xs leading-relaxed p-6 flex items-center justify-center gap-2 text-on-surface-variant/50">
          <Icon name="eye-off" size={14} /> diff hidden
        </div>
      ) : (
        <pre className="bg-surface-container-lowest font-mono text-[11px] leading-relaxed overflow-x-auto">
          {lines.map((l, i) => {
            const bg =
              l.kind === "add"
                ? "bg-secondary/10"
                : l.kind === "del"
                  ? "bg-error/10"
                  : l.kind === "hunk"
                    ? "bg-primary/5"
                    : "";
            const fg =
              l.kind === "add"
                ? "text-secondary"
                : l.kind === "del"
                  ? "text-error"
                  : l.kind === "hunk"
                    ? "text-primary/80"
                    : "text-on-surface-variant/80";
            return (
              <div
                key={i}
                className={`flex ${bg} ${fg} px-3 hover:bg-white/[0.03]`}
              >
                <span className="w-4 shrink-0 select-none opacity-70">
                  {l.kind === "add"
                    ? "+"
                    : l.kind === "del"
                      ? "−"
                      : l.kind === "hunk"
                        ? "@"
                        : " "}
                </span>
                <span className="whitespace-pre">{l.text}</span>
              </div>
            );
          })}
        </pre>
      )}
    </div>
  );
}

function parsePatch(patch: string) {
  return patch.split("\n").map((line) => {
    if (line.startsWith("@@"))
      return { kind: "hunk" as const, text: line };
    if (line.startsWith("+") && !line.startsWith("+++"))
      return { kind: "add" as const, text: line.slice(1) };
    if (line.startsWith("-") && !line.startsWith("---"))
      return { kind: "del" as const, text: line.slice(1) };
    if (line.startsWith("+++") || line.startsWith("---"))
      return { kind: "meta" as const, text: line };
    return { kind: "ctx" as const, text: line };
  });
}
