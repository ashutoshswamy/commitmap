import { Sidebar } from "../components/Sidebar";
import { BottomNav } from "../components/BottomNav";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest pb-16 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
