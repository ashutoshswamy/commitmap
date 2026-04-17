import { TopBar } from "../components/TopBar";

export default function Loading() {
  return (
    <>
      <TopBar />
      <div className="flex-1 grid place-items-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <span className="absolute inset-0 rounded-full border border-outline-variant/20" />
            <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/50">
            fetching refs
          </div>
        </div>
      </div>
    </>
  );
}
