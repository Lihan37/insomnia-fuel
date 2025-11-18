// src/components/GlowSkeleton.tsx


type Props = {
  className?: string;
  rounded?: string; // e.g., "rounded-2xl"
};

export default function GlowSkeleton({ className = "", rounded = "rounded-xl" }: Props) {
  return (
    <div
      className={`${rounded} ${className} relative overflow-hidden bg-zinc-900/60`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(255,0,76,0.08),transparent_70%)]" />
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-zinc-800/30 to-transparent" />
    </div>
  );
}
