import Link from "next/link";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { CompareSelector } from "../../components/CompareSelector";
import { EmptyState, ErrorState } from "../../components/EmptyState";
import {
  compareCommits,
  getRepo,
  GitHubError,
  listCommits,
  parseRepoInput,
  relativeTime,
  shortSha,
  type CommitFile,
  type CompareResult,
} from "../../lib/github";
import { errorTitle, fileStatusTint, parsePatch } from "../../lib/diff";

type SP = { repo?: string; base?: string; head?: string; file?: string };

export default async function DiffPage({
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
        <EmptyState
          title="No diff to show"
          body="Pick a repo, then compare commits or PRs."
        />
      </>
    );
  }

  const repoSlug = `${ref.owner}/${ref.repo}`;

  let data;
  try {
    const repo = await getRepo(ref);
    let base = sp.base;
    let head = sp.head;

    const recentCommits = await listCommits(ref, {
      sha: repo.default_branch,
      per_page: 50,
    });

    if (!base || !head) {
      if (recentCommits.length < 2) {
        data = { repo, recentCommits, nothingToCompare: true };
      } else {
        head = head ?? recentCommits[0].sha;
        base = base ?? recentCommits[1].sha;
        const cmp: CompareResult = await compareCommits(ref, base!, head!);
        data = { repo, recentCommits, base, head, cmp, nothingToCompare: false };
      }
    } else {
      const cmp: CompareResult = await compareCommits(ref, base!, head!);
      data = { repo, recentCommits, base, head, cmp, nothingToCompare: false };
    }
  } catch (e) {
    const err = e as GitHubError;
    return (
      <>
        <TopBar repo={repoSlug} />
        <ErrorState
          code={err.status}
          title={errorTitle(err.status)}
          body={err.message || "Unable to load this diff."}
        />
      </>
    );
  }

  const { repo, recentCommits, nothingToCompare } = data;

  if (nothingToCompare) {
    return (
      <>
        <TopBar repo={repoSlug} branch={repo.default_branch} />
        <EmptyState
          title="Nothing to compare"
          body="This repository has fewer than two commits."
        />
      </>
    );
  }

  const { base, head, cmp } = (data as unknown) as {
    base: string;
    head: string;
    cmp: CompareResult;
  };

  const files = cmp.files ?? [];
  const totals = files.reduce(
    (acc, f) => ({
      add: acc.add + (f.additions ?? 0),
      del: acc.del + (f.deletions ?? 0),
    }),
    { add: 0, del: 0 },
  );

  const activePath =
    (sp.file && files.find((f) => f.filename === sp.file)?.filename) ??
    files[0]?.filename ??
    null;
  const activeFile = files.find((f) => f.filename === activePath) ?? null;

  const headCommit = cmp.commits[cmp.commits.length - 1] ?? null;
  const baseDisplay = shortSha(base);
  const headDisplay = shortSha(head);

  return (
    <>
      <TopBar repo={repoSlug} branch={repo.default_branch} />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-surface-container-low">
          <div className="px-5 py-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-on-surface-variant/50 mb-1">
              comparing
            </div>
            <CompareSelector
              repoSlug={repoSlug}
              base={base}
              head={head}
              commits={recentCommits.map((c) => ({
                sha: c.sha,
                message: c.commit.message,
              }))}
            />
            <div className="mt-2 text-[10px] font-mono text-on-surface-variant/50">
              {cmp.status} · {cmp.ahead_by} ahead · {cmp.behind_by} behind
            </div>
          </div>

          <div className="px-5 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-on-surface-variant/50">
              {files.length} files · +{totals.add} −{totals.del}
            </span>
          </div>

          <nav className="px-2 flex-1 overflow-y-auto">
            {files.length === 0 && (
              <div className="p-5 text-xs font-mono text-on-surface-variant/50">
                No file changes.
              </div>
            )}
            {files.map((f) => {
              const active = f.filename === activePath;
              const dir = f.filename.includes("/")
                ? f.filename.split("/").slice(0, -1).join("/") + "/"
                : "";
              const name = f.filename.split("/").slice(-1)[0];
              return (
                <Link
                  key={f.filename}
                  href={`/diff?repo=${repoSlug}&base=${base}&head=${head}&file=${encodeURIComponent(f.filename)}`}
                  scroll={false}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors ${
                    active
                      ? "bg-surface-container-high text-on-surface"
                      : "text-on-surface/60 hover:bg-surface-container-low/80 hover:text-on-surface"
                  }`}
                >
                  <span
                    className={`${fileStatusTint(f.status)} shrink-0`}
                    title={f.status}
                  >
                    <Icon name="file" size={14} />
                  </span>
                  <span className="flex-1 font-mono text-[11px] truncate">
                    <span className="text-on-surface-variant/40">{dir}</span>
                    <span className="text-on-surface">{name}</span>
                  </span>
                  <span className="font-mono text-[10px] flex gap-1.5 shrink-0">
                    <span className="text-secondary">+{f.additions}</span>
                    <span className="text-error">−{f.deletions}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {headCommit && (
            <div className="p-5">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-on-surface-variant/50 mb-1">
                head commit
              </div>
              <div className="text-sm text-on-surface leading-snug line-clamp-2">
                {headCommit.commit.message.split("\n")[0]}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-on-surface-variant/60">
                <span>{headCommit.commit.author.name}</span>
                <span className="text-on-surface-variant/30">·</span>
                <span>{relativeTime(headCommit.commit.author.date)}</span>
              </div>
            </div>
          )}
        </aside>

        <section className="flex-1 min-w-0 flex flex-col bg-surface-container-lowest">
          {activeFile ? (
            <FilePanel
              file={activeFile}
              base={baseDisplay}
              head={headDisplay}
              htmlUrl={`${repo.html_url}/compare/${base}...${head}`}
            />
          ) : (
            <div className="flex-1 grid place-items-center p-8 text-sm font-mono text-on-surface-variant/50">
              No file changes between these refs.
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function FilePanel({
  file,
  base,
  head,
  htmlUrl,
}: {
  file: CommitFile;
  base: string;
  head: string;
  htmlUrl: string;
}) {
  const lines = file.patch ? parsePatch(file.patch) : [];
  const truncated = !file.patch && file.changes > 0;

  return (
    <>
      <header className="px-6 lg:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className={fileStatusTint(file.status)}>
            <Icon name="file" size={16} />
          </span>
          <h1 className="font-mono text-sm text-on-surface truncate">
            {file.filename}
          </h1>
          <span className="px-1.5 py-0.5 rounded-sm bg-surface-container-high font-mono text-[10px] text-on-surface-variant">
            {file.status}
          </span>
          <span className="font-mono text-[10px] flex gap-2">
            <span className="text-secondary">+{file.additions}</span>
            <span className="text-error">−{file.deletions}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-sm text-on-surface-variant/60 hover:text-primary hover:bg-surface-container transition-colors"
            title="Open on GitHub"
          >
            <Icon name="external" size={14} />
          </a>
        </div>
      </header>

      <div className="px-6 lg:px-8 pb-8 flex-1 overflow-auto">
        <div className="rounded-sm overflow-hidden ring-1 ring-outline-variant/15 bg-surface-container-lowest">
          <div className="grid grid-cols-1 sm:grid-cols-2 bg-surface-container text-[11px] font-mono border-b border-outline-variant/10">
            <div className="px-4 py-2 flex items-center justify-between border-b sm:border-b-0 sm:border-r border-outline-variant/10">
              <span className="text-on-surface-variant/70 truncate mr-2">before · {base}</span>
              <span className="text-error shrink-0">−{file.deletions}</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-on-surface-variant/70 truncate mr-2">after · {head}</span>
              <span className="text-secondary shrink-0">+{file.additions}</span>
            </div>
          </div>

          {truncated ? (
            <div className="p-8 text-center font-mono text-xs text-on-surface-variant/50">
              Diff too large to render inline. Open on GitHub to view.
            </div>
          ) : lines.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-on-surface-variant/50">
              Binary file or no textual changes.
            </div>
          ) : (
            <UnifiedDiff lines={lines} />
          )}
        </div>
      </div>
    </>
  );
}

function UnifiedDiff({
  lines,
}: {
  lines: ReturnType<typeof parsePatch>;
}) {
  const linesWithNumbers = lines.reduce(
    (acc, l) => {
      let left = null;
      let right = null;
      let nextLeft = acc.currentLeft;
      let nextRight = acc.currentRight;

      if (l.kind === "hunk") {
        const m = l.text.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (m) {
          nextLeft = parseInt(m[1], 10);
          nextRight = parseInt(m[2], 10);
        }
      } else {
        const isAdd = l.kind === "add";
        const isDel = l.kind === "del";
        left = !isAdd ? nextLeft++ : null;
        right = !isDel ? nextRight++ : null;
      }

      return {
        items: [...acc.items, { ...l, left, right }],
        currentLeft: nextLeft,
        currentRight: nextRight,
      };
    },
    { 
      items: [] as (ReturnType<typeof parsePatch>[number] & { left: number | null, right: number | null })[], 
      currentLeft: 0, 
      currentRight: 0 
    },
  ).items;

  return (
    <div className="font-mono text-[12px] leading-[1.6]">
      {linesWithNumbers.map((l, i) => {
        if (l.kind === "meta") return null;
        if (l.kind === "hunk") {
          return (
            <div
              key={i}
              className="bg-primary/5 text-primary/80 px-4 py-1.5 border-y border-outline-variant/10"
            >
              {l.text}
            </div>
          );
        }
        const isAdd = l.kind === "add";
        const isDel = l.kind === "del";
        const bg = isAdd ? "bg-secondary/[0.08]" : isDel ? "bg-error/10" : "";
        const fg = isAdd
          ? "text-secondary"
          : isDel
            ? "text-error"
            : "text-on-surface-variant/80";
        const sym = isAdd ? "+" : isDel ? "−" : " ";
        return (
          <div key={i} className={`flex ${bg} ${fg}`}>
            <span className="w-10 shrink-0 text-right pr-2 py-0.5 select-none text-on-surface-variant/30">
              {l.left ?? ""}
            </span>
            <span className="w-10 shrink-0 text-right pr-2 py-0.5 select-none text-on-surface-variant/30">
              {l.right ?? ""}
            </span>
            <span className="w-4 shrink-0 select-none opacity-70 py-0.5">
              {sym}
            </span>
            <span className="flex-1 whitespace-pre overflow-hidden py-0.5 pr-4">
              {l.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
