const API = "https://api.github.com";

export type RepoRef = { owner: string; repo: string };

export function parseRepoInput(raw: string): RepoRef | null {
  const s = raw.trim().replace(/\.git$/, "");
  if (!s) return null;

  // git@github.com:owner/repo
  let m = s.match(/^git@github\.com:([\w.-]+)\/([\w.-]+)$/);
  if (m) return { owner: m[1], repo: m[2] };

  // any URL containing github.com/owner/repo
  m = s.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)(?:[/?#]|$)/i);
  if (m) return { owner: m[1], repo: m[2] };

  // bare owner/repo
  m = s.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (m) return { owner: m[1], repo: m[2] };

  return null;
}

export function repoPath(r: RepoRef) {
  return `${r.owner}/${r.repo}`;
}

export class GitHubError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type FetchOpts = {
  revalidate?: number;
  accept?: string;
  allow202?: boolean;
};

async function gh<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: opts.accept ?? "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "commitmap/0.1",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    headers,
    next: { revalidate: opts.revalidate ?? 60 },
  });

  if (res.status === 202 && opts.allow202) {
    // stats endpoint still computing — return empty sentinel
    return null as unknown as T;
  }

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.message) msg = body.message;
    } catch {}
    throw new GitHubError(res.status, msg);
  }

  if (opts.accept === "application/vnd.github.raw") {
    return (await res.text()) as unknown as T;
  }
  return (await res.json()) as T;
}

export type Repo = {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  pushed_at: string;
  visibility: string;
  owner: { login: string; avatar_url: string };
  language: string | null;
  html_url: string;
  license: { spdx_id: string } | null;
  size: number;
  parent?: {
    full_name: string;
    owner: { login: string; avatar_url: string };
  };
  source?: {
    full_name: string;
    owner: { login: string; avatar_url: string };
  };
};

export type Commit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string };
    committer: { name: string; email: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
  committer: { login: string; avatar_url: string } | null;
  parents: { sha: string }[];
  stats?: { additions: number; deletions: number; total: number };
  files?: CommitFile[];
};

export type CommitFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
};

export type Contributor = {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
};

export type WeekActivity = { total: number; week: number; days: number[] };

export type ContentEntry = {
  name: string;
  path: string;
  type: "file" | "dir" | "symlink" | "submodule";
  size: number;
  sha: string;
  download_url: string | null;
  html_url: string;
};

export type CompareResult = {
  status: string;
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  commits: Commit[];
  files: CommitFile[];
  base_commit: Commit;
  merge_base_commit: Commit;
};

export function getRepo(r: RepoRef) {
  return gh<Repo>(`/repos/${r.owner}/${r.repo}`);
}

export type Branch = {
  name: string;
};

export function getBranches(r: RepoRef) {
  return gh<Branch[]>(`/repos/${r.owner}/${r.repo}/branches?per_page=100`);
}

export function getForks(r: RepoRef) {
  return gh<Repo[]>(`/repos/${r.owner}/${r.repo}/forks?per_page=50&sort=newest`);
}

export function getLanguages(r: RepoRef) {
  return gh<Record<string, number>>(`/repos/${r.owner}/${r.repo}/languages`);
}

export function getContributors(r: RepoRef, perPage = 10) {
  return gh<Contributor[]>(
    `/repos/${r.owner}/${r.repo}/contributors?per_page=${perPage}&anon=false`,
  );
}

export async function getCommitActivity(r: RepoRef) {
  const data = await gh<WeekActivity[] | null>(
    `/repos/${r.owner}/${r.repo}/stats/commit_activity`,
    { allow202: true, revalidate: 300 },
  );
  return data ?? [];
}

export function listCommits(
  r: RepoRef,
  opts: { sha?: string; per_page?: number; path?: string } = {},
) {
  const q = new URLSearchParams();
  if (opts.sha) q.set("sha", opts.sha);
  if (opts.path) q.set("path", opts.path);
  q.set("per_page", String(opts.per_page ?? 25));
  return gh<Commit[]>(`/repos/${r.owner}/${r.repo}/commits?${q}`);
}

export function getCommit(r: RepoRef, sha: string) {
  return gh<Commit>(`/repos/${r.owner}/${r.repo}/commits/${sha}`);
}

export function compareCommits(r: RepoRef, base: string, head: string) {
  return gh<CompareResult>(
    `/repos/${r.owner}/${r.repo}/compare/${base}...${head}`,
  );
}

export function getContents(r: RepoRef, path = "", ref?: string) {
  const p = path ? encodeURIComponent(path).replace(/%2F/g, "/") : "";
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return gh<ContentEntry[] | ContentEntry>(
    `/repos/${r.owner}/${r.repo}/contents/${p}${q}`,
  );
}

export function getRawFile(r: RepoRef, path: string, ref?: string) {
  const p = encodeURIComponent(path).replace(/%2F/g, "/");
  const q = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  return gh<string>(`/repos/${r.owner}/${r.repo}/contents/${p}${q}`, {
    accept: "application/vnd.github.raw",
    revalidate: 300,
  });
}

export function shortSha(sha: string) {
  return sha.slice(0, 7);
}

export function relativeTime(isoDate: string) {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const s = Math.floor((now - then) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

export function parseSubject(message: string) {
  const [subject, ...rest] = message.split("\n");
  const body = rest.join("\n").trim();
  return { subject, body };
}

// language color map sampled from github-linguist (subset)
export const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Elixir: "#6e4a7e",
  Lua: "#000080",
  Haskell: "#5e5086",
  Perl: "#0298c3",
  "Objective-C": "#438eff",
  R: "#198CE7",
  MDX: "#fcb32c",
  Markdown: "#c6c6cb",
  Makefile: "#427819",
  Dockerfile: "#384d54",
  TOML: "#9c4221",
  YAML: "#cb171e",
  JSON: "#ddb8ff",
};

export function langColor(name: string) {
  return LANG_COLOR[name] ?? "#8f9095";
}
