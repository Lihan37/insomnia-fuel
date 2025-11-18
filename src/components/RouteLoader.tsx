// src/components/RouteLoader.tsx
export default function RouteLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center bg-neutral-950 text-zinc-300">
      <div className="animate-pulse rounded-full border border-zinc-700 px-4 py-2">
        Loading…
      </div>
    </div>
  );
}
