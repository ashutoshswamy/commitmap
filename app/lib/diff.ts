export type PatchLine =
  | { kind: "hunk"; text: string }
  | { kind: "add"; text: string }
  | { kind: "del"; text: string }
  | { kind: "meta"; text: string }
  | { kind: "ctx"; text: string };

export function parsePatch(patch: string): PatchLine[] {
  return patch.split("\n").map((line) => {
    if (line.startsWith("@@")) return { kind: "hunk", text: line };
    if (line.startsWith("+++") || line.startsWith("---"))
      return { kind: "meta", text: line };
    if (line.startsWith("+")) return { kind: "add", text: line.slice(1) };
    if (line.startsWith("-")) return { kind: "del", text: line.slice(1) };
    return { kind: "ctx", text: line };
  });
}

export function errorTitle(status?: number) {
  if (status === 404) return "Repository not found";
  if (status === 403) return "Rate limited by GitHub";
  if (status === 451) return "Repository unavailable for legal reasons";
  if (status === 422) return "Unable to compare refs";
  return "GitHub request failed";
}

export function fileStatusTint(status: string) {
  if (status === "added") return "text-secondary";
  if (status === "removed") return "text-error";
  if (status === "renamed") return "text-tertiary";
  return "text-primary";
}

export function langFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    rs: "rust",
    go: "go",
    py: "python",
    rb: "ruby",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    c: "c",
    h: "c",
    cc: "c++",
    cpp: "c++",
    cs: "c#",
    php: "php",
    html: "html",
    css: "css",
    scss: "scss",
    md: "markdown",
    mdx: "mdx",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sh: "shell",
    lua: "lua",
    sql: "sql",
    svelte: "svelte",
    vue: "vue",
    dart: "dart",
  };
  return map[ext] ?? "plain";
}
