import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";
import { Suspense } from "react";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex bg-background">
      <Suspense fallback={<div className="w-64 shrink-0 bg-surface-container-low h-screen" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest pb-16 md:pb-0">
        {children}
      </div>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}
