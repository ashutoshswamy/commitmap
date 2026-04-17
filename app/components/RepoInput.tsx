"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { parseRepoInput } from "../lib/github";

export function RepoInput({
  defaultValue = "",
  autoFocus = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = parseRepoInput(value);
    if (!parsed) {
      setError(
        "Enter a GitHub URL or owner/repo — e.g. vercel/next.js or https://github.com/vercel/next.js",
      );
      return;
    }
    setBusy(true);
    const q = new URLSearchParams({ repo: `${parsed.owner}/${parsed.repo}` });
    router.push(`/dashboard?${q}`);
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={submit} className="relative group">
        <div className="absolute -inset-[2px] rounded-sm bg-gradient-to-r from-primary/0 via-primary/40 to-secondary/30 opacity-0 blur-xl group-focus-within:opacity-100 transition-opacity duration-700" />
        <div className="relative flex items-center gap-1 h-14 bg-surface-container-lowest/90 backdrop-blur-md rounded-sm pl-1 pr-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.8)] ring-1 ring-outline-variant/15 group-focus-within:ring-primary/40 transition-all ease-ledger">
          <span className="w-12 h-12 grid place-items-center text-on-surface-variant/50 group-focus-within:text-primary transition-colors">
            <Icon name="link" size={16} />
          </span>
          <input
            type="text"
            name="repo"
            value={value}
            autoFocus={autoFocus}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github.com/vercel/next.js"
            spellCheck={false}
            autoComplete="off"
            className="flex-1 h-full bg-transparent border-none outline-none text-on-surface font-mono text-sm placeholder:text-on-surface-variant/40"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-12 px-5 flex items-center gap-2 rounded-sm bg-gradient-primary text-on-primary font-semibold text-sm tracking-tight hover:brightness-110 transition-all disabled:opacity-60"
          >
            {busy ? "Loading…" : "Visualize"}
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </form>

      <div className="mt-4 min-h-[20px] text-xs font-mono flex flex-wrap items-center gap-2">
        {error ? (
          <span className="text-tertiary">{error}</span>
        ) : (
          <>
            <span className="text-on-surface-variant/40">try:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setValue(s)}
                className="px-2.5 py-1 rounded-full bg-surface-container-lowest ring-1 ring-outline-variant/15 text-on-surface-variant/60 hover:bg-surface-container-low hover:text-primary hover:ring-primary/30 transition-all ease-ledger"
              >
                {s}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const suggestions = ["vercel/next.js", "facebook/react", "rust-lang/rust"];
