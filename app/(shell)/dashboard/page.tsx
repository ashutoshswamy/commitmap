import Link from "next/link";
import { Icon } from "../../components/Icon";
import { TopBar } from "../../components/TopBar";
import { EmptyState, ErrorState } from "../../components/EmptyState";
import {
  GitHubError,
  getCommitActivity,
  getContributors,
  getLanguages,
  getRepo,
  langColor,
  parseRepoInput,
  relativeTime,
  shortSha,
  listCommits,
  parseSubject,
} from "../../lib/github";

type SP = { repo?: string; branch?: string };

export default async function DashboardPage({
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
    const [repo, langs, contribs, activity, commits] = await Promise.all([
      getRepo(ref),
      getLanguages(ref).catch(() => ({}) as Record<string, number>),
      getContributors(ref, 8).catch(() => []),
      getCommitActivity(ref).catch(() => []),
      getRepo(ref).then(async (repo) => {
        const targetSha = sp.branch || repo.default_branch;
        const cmts = await listCommits(ref, { sha: targetSha, per_page: 1 }).catch(() => []);
        return cmts;
      })
    ]);

    const activeBranch = sp.branch || repo.default_branch;

    const latest = commits[0];
    const langTotal = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
    const langList = Object.entries(langs)
      .map(([name, bytes]) => ({
        name,
        bytes,
        pct: (bytes / langTotal) * 100,
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 5);

    const contribTotal =
      contribs.reduce((a, c) => a + c.contributions, 0) || 1;

    const activityCells = buildHeatmap(activity);

    return (
      <>
        <TopBar repo={repoSlug} branch={activeBranch} />
        <main className="flex-1 min-h-0 overflow-auto">
          <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto flex flex-col gap-10">
            <section className="rise rise-1 relative grid grid-cols-1 lg:grid-cols-3 bg-surface-container rounded-sm overflow-hidden ring-1 ring-outline-variant/10 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.7)]">
              <div className="absolute inset-0 pointer-events-none opacity-60">
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(167,75,254,0.18),transparent_70%)] blur-2xl" />
                <div className="absolute -bottom-24 right-10 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(68,226,205,0.08),transparent_70%)] blur-2xl" />
              </div>

              <div className="relative lg:col-span-2 p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-5 font-mono text-[10px] uppercase tracking-[0.22em]">
                  <span className="px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface-variant/70">
                    {repo.visibility}
                  </span>
                  {repo.language && (
                    <span
                      className="px-2 py-0.5 rounded-sm"
                      style={{
                        color: langColor(repo.language),
                        background: `${langColor(repo.language)}14`,
                      }}
                    >
                      {repo.language}
                    </span>
                  )}
                  <span className="text-on-surface-variant/50">
                    pushed · {relativeTime(repo.pushed_at)}
                  </span>
                </div>

                <h1 className="font-headline font-black tracking-[-0.03em] text-4xl md:text-5xl text-on-surface leading-[1.02]">
                  {ref.owner}{" "}
                  <span className="text-on-surface-variant/30">/</span>{" "}
                  <span className="text-gradient-primary">{ref.repo}</span>
                </h1>
                {repo.description && (
                  <p className="mt-4 max-w-xl text-on-surface-variant/80 font-light leading-relaxed">
                    {repo.description}
                  </p>
                )}

                <div className="mt-7 flex items-center gap-6 font-mono text-xs text-on-surface-variant/80 flex-wrap">
                  <Stat
                    icon="star"
                    value={fmt(repo.stargazers_count)}
                    label="stars"
                    tint="tertiary"
                  />
                  <Stat
                    icon="fork"
                    value={fmt(repo.forks_count)}
                    label="forks"
                    tint="secondary"
                  />
                  <Stat
                    icon="users"
                    value={fmt(contribs.length)}
                    label="contributors"
                    tint="primary"
                  />
                </div>

                <div className="mt-8 flex items-center gap-3 flex-wrap">
                  <Link
                    href={`/timeline?repo=${repoSlug}`}
                    className="px-4 py-2.5 rounded-sm bg-gradient-primary text-on-primary font-semibold text-sm tracking-tight hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <Icon name="timeline" size={14} /> Open timeline
                  </Link>
                  <Link
                    href={`/files?repo=${repoSlug}`}
                    className="px-4 py-2.5 rounded-sm bg-surface-container-high text-on-surface font-label text-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2"
                  >
                    <Icon name="folder" size={14} /> Browse files
                  </Link>
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-sm text-on-surface-variant/70 hover:text-primary text-sm font-label flex items-center gap-2 transition-colors"
                  >
                    <Icon name="external" size={14} /> GitHub
                  </a>
                </div>
              </div>

              <div className="relative lg:border-l border-t lg:border-t-0 border-outline-variant/10 p-8 flex flex-col justify-between bg-surface-container-high/40 backdrop-blur-sm">
                {latest ? (
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-on-surface-variant/50 mb-2">
                      Latest commit
                    </div>
                    <div className="font-mono text-primary text-sm mb-3">
                      {shortSha(latest.sha)}
                    </div>
                    <div className="text-sm text-on-surface mb-1 leading-snug line-clamp-2">
                      {parseSubject(latest.commit.message).subject}
                    </div>
                    <div className="text-xs font-mono text-on-surface-variant/60">
                      @{latest.author?.login ?? latest.commit.author.name} ·{" "}
                      {relativeTime(latest.commit.author.date)}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-on-surface-variant/60">
                    no commits
                  </div>
                )}

                <div className="mt-8 grid grid-cols-2 gap-3 text-xs">
                  <KeyValue
                    label="Default"
                    value={repo.default_branch}
                    mono
                  />
                  <KeyValue
                    label="Issues"
                    value={fmt(repo.open_issues_count)}
                  />
                  <KeyValue
                    label="License"
                    value={repo.license?.spdx_id ?? "—"}
                    mono
                  />
                  <KeyValue label="Size" value={`${fmt(repo.size)} kb`} />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="rise rise-2 xl:col-span-2 bg-surface-container rounded-sm p-6 lg:p-7 flex flex-col ring-1 ring-outline-variant/10">
                <div className="flex items-end justify-between mb-6 gap-3 flex-wrap">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <h2 className="font-headline font-bold text-lg text-on-surface tracking-tight">
                        Pulse
                      </h2>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/40">
                        last 52 weeks
                      </span>
                    </div>
                    <p className="font-mono text-xs text-on-surface-variant/60 mt-1">
                      {activity.length > 0
                        ? `${fmt(activity.reduce((a, w) => a + w.total, 0))} commits · ${activity.filter((w) => w.total > 0).length} active weeks`
                        : "stats are being computed — refresh in a minute"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-on-surface-variant/60">
                    <span>low</span>
                    <div className="flex gap-[3px]">
                      {[0.1, 0.25, 0.5, 0.75, 1].map((a) => (
                        <span
                          key={a}
                          className="w-3 h-3 rounded-[2px]"
                          style={{
                            background:
                              a === 0.1
                                ? "#262a31"
                                : `rgba(221,184,255,${a})`,
                            boxShadow:
                              a >= 0.75
                                ? "0 0 6px rgba(221,184,255,0.45)"
                                : "none",
                          }}
                        />
                      ))}
                    </div>
                    <span>high</span>
                  </div>
                </div>

                <Heatmap cells={activityCells} />

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-px bg-outline-variant/10 rounded-sm overflow-hidden">
                  {computeMetrics(activity).map((m) => (
                    <div
                      key={m.k}
                      className="bg-surface-container-high/60 p-4"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/50 mb-1">
                        {m.k}
                      </div>
                      <div className="text-xl font-headline font-bold text-on-surface tracking-tight">
                        {m.v}
                      </div>
                      <div className="text-xs font-mono text-on-surface-variant/60 mt-0.5">
                        {m.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rise rise-3 bg-surface-container rounded-sm p-6 lg:p-7 ring-1 ring-outline-variant/10 flex flex-col gap-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-headline font-bold text-lg text-on-surface tracking-tight">
                      Stack
                    </h2>
                    <p className="font-mono text-xs text-on-surface-variant/60 mt-1">
                      language composition
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant/40">
                    {fmtBytes(langTotal)}
                  </span>
                </div>

                {langList.length === 0 ? (
                  <p className="text-sm text-on-surface-variant/60">
                    no detected languages
                  </p>
                ) : (
                  <>
                    <div className="flex h-2 rounded-full overflow-hidden ring-1 ring-outline-variant/10">
                      {langList.map((l) => (
                        <span
                          key={l.name}
                          title={`${l.name} ${l.pct.toFixed(1)}%`}
                          style={{
                            width: `${l.pct}%`,
                            background: langColor(l.name),
                          }}
                        />
                      ))}
                    </div>

                    <div className="space-y-4">
                      {langList.map((l) => (
                        <div key={l.name}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  background: langColor(l.name),
                                  boxShadow: `0 0 6px ${langColor(l.name)}66`,
                                }}
                              />
                              <span className="text-sm font-label text-on-surface">
                                {l.name}
                              </span>
                            </div>
                            <span className="font-mono text-xs text-on-surface-variant/70">
                              {l.pct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                            <span
                              className="block h-full"
                              style={{
                                width: `${l.pct}%`,
                                background: langColor(l.name),
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            <section className="rise rise-4">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <h2 className="font-headline font-bold text-lg text-on-surface tracking-tight">
                    Core contributors
                  </h2>
                  <p className="font-mono text-xs text-on-surface-variant/60 mt-1">
                    ranked by commit count
                  </p>
                </div>
                <a
                  href={`${repo.html_url}/graphs/contributors`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-on-surface-variant/60 hover:text-primary transition-colors"
                >
                  view on github →
                </a>
              </div>

              {contribs.length === 0 ? (
                <p className="text-sm text-on-surface-variant/60">
                  no contributors reported
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {contribs.slice(0, 4).map((c, i) => (
                    <article
                      key={c.login}
                      className={`relative p-5 rounded-sm overflow-hidden transition-all ease-ledger ${
                        i === 0
                          ? "bg-surface-container-high ring-1 ring-primary/30"
                          : "bg-surface-container ring-1 ring-outline-variant/10"
                      }`}
                    >
                      {i === 0 && (
                        <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(221,184,255,0.22),transparent_70%)] blur-xl" />
                      )}
                      <div className="relative flex items-center justify-between mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`${c.avatar_url}&s=80`}
                          alt={c.login}
                          className="w-11 h-11 rounded-sm object-cover transition-all"
                        />
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-sm ${
                            i === 0
                              ? "text-primary bg-primary/10 ring-1 ring-primary/20"
                              : "text-on-surface-variant/60 bg-surface-container-highest"
                          }`}
                        >
                          #0{i + 1}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="font-headline font-bold text-on-surface text-sm leading-tight truncate">
                          {c.login}
                        </div>
                        <a
                          href={c.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-on-surface-variant/60 hover:text-primary transition-colors"
                        >
                          @{c.login}
                        </a>
                      </div>
                      <div className="relative mt-5 pt-4 border-t border-outline-variant/10 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-on-surface-variant/40">
                            commits
                          </div>
                          <div className="font-mono text-sm text-on-surface">
                            {fmt(c.contributions)}
                          </div>
                        </div>
                        <span
                          className={`font-mono text-xs ${
                            i === 0 ? "text-secondary" : "text-on-surface-variant/60"
                          }`}
                        >
                          {((c.contributions / contribTotal) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="pb-12" />
          </div>
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
          title={errorTitle(err.status)}
          body={err.message || "Unable to load this repository."}
        />
      </>
    );
  }
}

function errorTitle(status?: number) {
  if (status === 404) return "Repository not found";
  if (status === 403) return "Rate limited by GitHub";
  if (status === 451) return "Repository unavailable for legal reasons";
  return "GitHub request failed";
}

function Stat({
  icon,
  value,
  label,
  tint,
}: {
  icon: "star" | "fork" | "users";
  value: string;
  label: string;
  tint: "primary" | "secondary" | "tertiary";
}) {
  const tintCls = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
  }[tint];
  return (
    <span className="flex items-center gap-2">
      <span className={tintCls}>
        <Icon name={icon} size={14} />
      </span>
      <span className="text-on-surface">{value}</span>
      <span className="uppercase tracking-[0.18em] text-[10px] text-on-surface-variant/50">
        {label}
      </span>
    </span>
  );
}

function KeyValue({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-on-surface-variant/50">
        {label}
      </span>
      <span
        className={`${mono ? "font-mono" : "font-label"} text-sm text-on-surface truncate`}
      >
        {value}
      </span>
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function fmtBytes(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m bytes`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k bytes`;
  return `${n} bytes`;
}

type Activity = { total: number; week: number; days: number[] };

function buildHeatmap(activity: Activity[]): number[] {
  const cells: number[] = [];
  if (!activity || activity.length === 0) {
    return Array.from({ length: 52 * 7 }).map(() => 0);
  }
  const allDay = activity.flatMap((w) => w.days);
  const max = Math.max(1, ...allDay);
  for (const w of activity.slice(-52)) {
    for (const d of w.days) {
      const ratio = d / max;
      const level =
        ratio === 0
          ? 0
          : ratio < 0.2
            ? 1
            : ratio < 0.45
              ? 2
              : ratio < 0.75
                ? 3
                : 4;
      cells.push(level);
    }
  }
  while (cells.length < 52 * 7) cells.push(0);
  return cells;
}

function computeMetrics(activity: Activity[]) {
  if (!activity || activity.length === 0) {
    return [
      { k: "Peak day", v: "—", sub: "awaiting data" },
      { k: "Velocity", v: "—", sub: "awaiting data" },
      { k: "Streak", v: "—", sub: "awaiting data" },
    ];
  }
  const recent4 = activity.slice(-4).reduce((a, w) => a + w.total, 0);
  const prev4 = activity.slice(-8, -4).reduce((a, w) => a + w.total, 0) || 1;
  const velocity = ((recent4 - prev4) / prev4) * 100;

  let peak = 0;
  let peakIdx = 0;
  for (const w of activity) {
    for (let i = 0; i < 7; i++) {
      if (w.days[i] > peak) {
        peak = w.days[i];
        peakIdx = w.week + i * 86400;
      }
    }
  }
  const peakDate = peakIdx ? new Date(peakIdx * 1000) : null;

  let streak = 0;
  outer: for (let w = activity.length - 1; w >= 0; w--) {
    for (let d = 6; d >= 0; d--) {
      if (activity[w].days[d] > 0) streak++;
      else break outer;
    }
  }

  return [
    {
      k: "Peak day",
      v: peakDate
        ? peakDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "—",
      sub: `${peak} commits`,
    },
    {
      k: "Velocity",
      v: `${velocity >= 0 ? "+" : ""}${velocity.toFixed(0)}%`,
      sub: "vs prior 4 wks",
    },
    {
      k: "Streak",
      v: `${streak}d`,
      sub: "active days",
    },
  ];
}

function Heatmap({ cells }: { cells: number[] }) {
  const weeks = 52;
  const days = 7;
  const color = (lvl: number) =>
    ({
      0: "#1c2026",
      1: "rgba(221,184,255,0.2)",
      2: "rgba(221,184,255,0.4)",
      3: "rgba(221,184,255,0.65)",
      4: "rgba(221,184,255,0.95)",
    })[lvl];
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  return (
    <div className="w-full">
      <div className="flex gap-[3px]">
        <div className="flex flex-col h-[102px] pr-2 text-[9px] font-mono uppercase tracking-wider text-on-surface-variant/35 justify-between py-0.5">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
        </div>
        <div className="flex-1 overflow-x-auto pb-3">
          <div className="w-max">
            <div className="flex gap-[3px]">
              {Array.from({ length: weeks }).map((_, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {Array.from({ length: days }).map((_, d) => {
                    const level = cells[w * days + d] ?? 0;
                    return (
                      <span
                        key={d}
                        className="w-3 h-3 rounded-[2px] ring-1 ring-inset ring-black/10 shrink-0 block"
                        style={{
                          background: color(level),
                          boxShadow:
                            level === 4
                              ? "0 0 6px rgba(221,184,255,0.55)"
                              : "none",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[9px] font-mono uppercase tracking-wider text-on-surface-variant/35 px-1">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
