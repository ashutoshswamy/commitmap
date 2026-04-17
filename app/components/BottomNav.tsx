"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon, type IconName } from "./Icon";

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Overview", icon: "sparkle" },
  { href: "/timeline", label: "History", icon: "timeline" },
  { href: "/diff", label: "Compare", icon: "compare" },
  { href: "/files", label: "Files", icon: "folder" },
];

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const repo = searchParams.get("repo");
  const withRepo = (href: string) =>
    repo && href.startsWith("/") ? `${href}?repo=${repo}` : href;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low/90 backdrop-blur-md border-t border-outline-variant/10 z-40 flex items-center justify-around px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={withRepo(item.href)}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              active ? "text-primary" : "text-on-surface-variant/50 hover:text-on-surface"
            }`}
          >
            <Icon name={item.icon} size={20} />
            <span className="text-[9px] font-mono uppercase tracking-widest">{item.label}</span>
            {active && (
              <span className="absolute bottom-0 w-8 h-[2px] bg-primary rounded-t-sm shadow-[0_0_8px_rgba(221,184,255,0.8)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
