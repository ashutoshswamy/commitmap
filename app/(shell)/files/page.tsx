import Link from "next/link";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { EmptyState, ErrorState } from "../../components/EmptyState";
import {
  getContents,
  getRawFile,
  getRepo,
  GitHubError,
  langColor,
  parseRepoInput,
  type ContentEntry,
} from "../../lib/github";
import { errorTitle, langFromPath } from "../../lib/diff";

type SP = { repo?: string; path?: string; ref?: string };

const DIR_ORDER: Record<string, number> = {
  dir: 0,
  submodule: 1,
  symlink: 2,
  file: 3,
};

const MAX_RENDER_BYTES = 200_000;

export default async function FilesPage({
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
          title="No files to browse"
          body="Pick a repo to explore its tree."
        />
      </>
    );
  }

  const repoSlug = `${ref.owner}/${ref.repo}`;
  const path = sp.path ?? "";

  try {
    const repo = await getRepo(ref);
    const branch = sp.ref ?? repo.default_branch;

    const contents = await getContents(ref, path, branch);
    const isDir = Array.isArray(contents);

    if (isDir) {
      const entries = [...(contents as ContentEntry[])].sort((a, b) => {
        const d = (DIR_ORDER[a.type] ?? 9) - (DIR_ORDER[b.type] ?? 9);
        return d !== 0 ? d : a.name.localeCompare(b.name);
      });

      return (
        <>
          <TopBar repo={repoSlug} branch={branch} branchParam="ref" />
          <div className="flex flex-1 min-h-0">
            <Sidebar repoSlug={repoSlug} branch={branch} path={path} />
            <section className="flex-1 min-w-0 flex flex-col bg-surface-container-lowest">
              <Breadcrumbs
                repoSlug={repoSlug}
                branch={branch}
                path={path}
                repoName={repo.name}
              />
              <div className="px-6 lg:px-8 pb-8 flex-1 overflow-auto">
                <div className="rounded-sm overflow-hidden ring-1 ring-outline-variant/15 bg-surface-container-lowest">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px_80px] px-4 py-2.5 bg-surface-container text-[10px] font-mono uppercase tracking-[0.22em] text-on-surface-variant/50">
                    <span>name</span>
                    <span className="hidden sm:block text-right">type</span>
                    <span className="hidden sm:block text-right">size</span>
                  </div>
                  <ul>
                    {entries.length === 0 && (
                      <li className="px-4 py-6 text-center text-xs font-mono text-on-surface-variant/50">
                        Empty directory.
                      </li>
                    )}
                    {entries.map((e) => (
                      <DirRow
                        key={e.sha + e.name}
                        entry={e}
                        repoSlug={repoSlug}
                        branch={branch}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </>
      );
    }

    const entry = contents as ContentEntry;
    let body: string | null = null;
    let tooLarge = false;
    let binary = false;

    if (entry.size > MAX_RENDER_BYTES) {
      tooLarge = true;
    } else {
      try {
        body = await getRawFile(ref, entry.path, branch);
        if (body.includes("\0")) {
          binary = true;
          body = null;
        }
      } catch (e) {
        const err = e as GitHubError;
        if (err.status === 415 || err.status === 404) {
          binary = true;
        } else {
          throw e;
        }
      }
    }

    const parentPath = entry.path.includes("/")
      ? entry.path.split("/").slice(0, -1).join("/")
      : "";

    return (
      <>
        <TopBar repo={repoSlug} branch={branch} branchParam="ref" />
        <div className="flex flex-1 min-h-0">
          <Sidebar
            repoSlug={repoSlug}
            branch={branch}
            path={parentPath}
            activeFile={entry.name}
          />
          <section className="flex-1 min-w-0 flex flex-col bg-surface-container-lowest">
            <Breadcrumbs
              repoSlug={repoSlug}
              branch={branch}
              path={entry.path}
              repoName={repo.name}
            />
            <div className="px-6 lg:px-8 pb-8 flex-1 overflow-auto">
              <div className="rounded-sm overflow-hidden ring-1 ring-outline-variant/15 bg-surface-container-lowest">
                <div className="px-4 py-2.5 bg-surface-container flex items-center justify-between text-[11px] font-mono border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <LangDot path={entry.path} />
                    <span className="text-on-surface">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-on-surface-variant/60">
                    <span>{formatBytes(entry.size)}</span>
                    <span>{langFromPath(entry.path)}</span>
                    {entry.html_url && (
                      <a
                        href={entry.html_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        <Icon name="external" size={12} />
                      </a>
                    )}
                  </div>
                </div>

                {tooLarge ? (
                  <Notice>
                    File is {formatBytes(entry.size)} — too large to render
                    inline.
                  </Notice>
                ) : binary || body === null ? (
                  <Notice>Binary file. Open on GitHub to download.</Notice>
                ) : (
                  <CodeView body={body} />
                )}
              </div>
            </div>
          </section>
        </div>
      </>
    );
  } catch (e) {
    const err = e as GitHubError;
    return (
      <>
        <TopBar repo={repoSlug} />
        <ErrorState
          code={err.status}
          title={errorTitle(err.status)}
          body={err.message || "Unable to load this path."}
        />
      </>
    );
  }
}

async function Sidebar({
  repoSlug,
  branch,
  path,
  activeFile,
}: {
  repoSlug: string;
  branch: string;
  path: string;
  activeFile?: string;
}) {
  const ref = parseRepoInput(repoSlug)!;
  let entries: ContentEntry[] = [];
  try {
    const res = await getContents(ref, path, branch);
    if (Array.isArray(res)) entries = res;
  } catch {
    // fall through with empty
  }

  entries = [...entries].sort((a, b) => {
    const d = (DIR_ORDER[a.type] ?? 9) - (DIR_ORDER[b.type] ?? 9);
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });

  const parent = path ? path.split("/").slice(0, -1).join("/") : null;

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col bg-surface-container-low">
      <div className="px-5 py-4 flex items-center gap-2">
        <Icon name="folder" size={14} />
        <span className="font-mono text-xs text-on-surface truncate">
          {path ? path + "/" : repoSlug.split("/")[1] + "/"}
        </span>
      </div>

      <nav className="px-2 flex-1 overflow-y-auto">
        {path && (
          <Link
            href={
              parent
                ? `/files?repo=${repoSlug}&ref=${branch}&path=${encodeURIComponent(parent)}`
                : `/files?repo=${repoSlug}&ref=${branch}`
            }
            className="group flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-mono text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-low/80"
          >
            <Icon name="chevron-right" size={10} />
            <span className="opacity-60">..</span>
          </Link>
        )}

        {entries.length === 0 && (
          <div className="px-3 py-3 text-[11px] font-mono text-on-surface-variant/40">
            empty
          </div>
        )}

        {entries.map((e) => {
          const href =
            e.type === "dir"
              ? `/files?repo=${repoSlug}&ref=${branch}&path=${encodeURIComponent(e.path)}`
              : `/files?repo=${repoSlug}&ref=${branch}&path=${encodeURIComponent(e.path)}`;
          const active = activeFile === e.name;
          return (
            <Link
              key={e.sha + e.name}
              href={href}
              className={`group relative flex items-center gap-2 px-2 py-1.5 rounded-sm text-xs font-mono transition-colors ${
                active
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface/60 hover:text-on-surface hover:bg-surface-container-low/80"
              }`}
            >
              {e.type === "dir" ? (
                <>
                  <span className="text-on-surface-variant/50">
                    <Icon name="chevron-right" size={10} />
                  </span>
                  <Icon name="folder" size={12} />
                </>
              ) : (
                <>
                  <span className="w-[10px]" />
                  <LangDot path={e.path} size={6} />
                </>
              )}
              <span className="flex-1 truncate">{e.name}</span>
              {e.type === "file" && (
                <span className="text-on-surface-variant/40 text-[10px]">
                  {shortBytes(e.size)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Breadcrumbs({
  repoSlug,
  branch,
  path,
  repoName,
}: {
  repoSlug: string;
  branch: string;
  path: string;
  repoName: string;
}) {
  const segs = path ? path.split("/") : [];
  const crumbs = segs.map((seg, i) => ({
    name: seg,
    path: segs.slice(0, i + 1).join("/"),
  }));

  return (
    <header className="px-6 lg:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-2 font-mono text-xs min-w-0 flex-wrap">
        <Link
          href={`/files?repo=${repoSlug}&ref=${branch}`}
          className="text-on-surface-variant/60 hover:text-primary transition-colors"
        >
          {repoName}
        </Link>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span key={c.path} className="flex items-center gap-2">
              <Icon name="chevron-right" size={12} />
              {last ? (
                <span className="text-on-surface">{c.name}</span>
              ) : (
                <Link
                  href={`/files?repo=${repoSlug}&ref=${branch}&path=${encodeURIComponent(c.path)}`}
                  className="text-on-surface-variant/60 hover:text-primary transition-colors"
                >
                  {c.name}
                </Link>
              )}
            </span>
          );
        })}
        <span className="ml-3 px-1.5 py-0.5 rounded-sm bg-surface-container-high text-[10px] text-on-surface-variant">
          {branch}
        </span>
      </div>
    </header>
  );
}

function DirRow({
  entry,
  repoSlug,
  branch,
}: {
  entry: ContentEntry;
  repoSlug: string;
  branch: string;
}) {
  const href = `/files?repo=${repoSlug}&ref=${branch}&path=${encodeURIComponent(entry.path)}`;
  const isDir = entry.type === "dir";
  return (
    <li>
      <Link
        href={href}
        className="grid grid-cols-1 sm:grid-cols-[1fr_120px_80px] items-center px-4 py-2 text-xs font-mono hover:bg-surface-container-low/60 transition-colors"
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {isDir ? (
            <span className="text-primary">
              <Icon name="folder" size={14} />
            </span>
          ) : (
            <LangDot path={entry.path} />
          )}
          <span
            className={`truncate ${isDir ? "text-on-surface" : "text-on-surface/85"}`}
          >
            {entry.name}
          </span>
        </span>
        <span className="hidden sm:block text-right text-on-surface-variant/50">
          {entry.type}
        </span>
        <span className="hidden sm:block text-right text-on-surface-variant/50">
          {isDir ? "—" : shortBytes(entry.size)}
        </span>
      </Link>
    </li>
  );
}

function LangDot({ path, size = 8 }: { path: string; size?: number }) {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const nameByExt: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    rs: "Rust",
    go: "Go",
    py: "Python",
    rb: "Ruby",
    java: "Java",
    kt: "Kotlin",
    swift: "Swift",
    c: "C",
    h: "C",
    cc: "C++",
    cpp: "C++",
    cs: "C#",
    php: "PHP",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    md: "Markdown",
    mdx: "MDX",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    toml: "TOML",
    sh: "Shell",
    lua: "Lua",
    vue: "Vue",
    svelte: "Svelte",
    dart: "Dart",
  };
  const color = langColor(nameByExt[ext] ?? "");
  return (
    <span
      className="inline-block rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: color,
        boxShadow: `0 0 6px ${color}66`,
      }}
    />
  );
}

function CodeView({ body }: { body: string }) {
  const lines = body.replace(/\n$/, "").split("\n");
  return (
    <pre className="font-mono text-[12px] leading-[1.7] overflow-x-auto py-3">
      {lines.map((text, i) => (
        <div
          key={i}
          className="flex px-3 hover:bg-white/[0.02] transition-colors"
        >
          <span className="w-12 shrink-0 text-right pr-3 text-on-surface-variant/30 select-none">
            {i + 1}
          </span>
          <span className="whitespace-pre flex-1 text-on-surface-variant/85">
            {text || " "}
          </span>
        </div>
      ))}
    </pre>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8 text-center font-mono text-xs text-on-surface-variant/50">
      {children}
    </div>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function shortBytes(n: number) {
  if (n < 1024) return `${n}`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)}K`;
  return `${(n / 1024 / 1024).toFixed(1)}M`;
}
