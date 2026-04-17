import Link from "next/link";
import { Icon } from "./Icon";

export function EmptyState({
  title = "No repository selected",
  body = "Pick a repo from the landing page to start visualizing.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <div className="flex-1 grid place-items-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto w-12 h-12 mb-6 grid place-items-center rounded-sm bg-surface-container ring-1 ring-outline-variant/15 text-primary">
          <Icon name="sparkle" size={20} />
        </div>
        <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
          {title}
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant/70 font-light leading-relaxed">
          {body}
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-gradient-primary text-on-primary font-semibold text-sm tracking-tight"
        >
          Choose repository
          <Icon name="arrow-right" size={14} />
        </Link>
      </div>
    </div>
  );
}

export function ErrorState({
  title,
  body,
  code,
}: {
  title: string;
  body: string;
  code?: number;
}) {
  return (
    <div className="flex-1 grid place-items-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto w-12 h-12 mb-6 grid place-items-center rounded-sm bg-tertiary/10 ring-1 ring-tertiary/30 text-tertiary font-mono text-sm">
          {code ?? "!"}
        </div>
        <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight">
          {title}
        </h2>
        <p className="mt-3 text-sm text-on-surface-variant/70 font-light leading-relaxed">
          {body}
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-surface-container-high text-on-surface font-label text-sm hover:bg-surface-container-highest transition-colors"
        >
          Try another repository
        </Link>
      </div>
    </div>
  );
}
