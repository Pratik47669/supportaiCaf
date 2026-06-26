import { motion } from "motion/react";

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

export function SkeletonLoader({
  count = 3,
  className = "",
}: SkeletonLoaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {[1, 2, 3, 4, 5].slice(0, count).map((n) => (
        <motion.div
          key={`skeleton-${n}`}
          className="bg-muted/60 h-16 animate-pulse rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (n - 1) * 0.1, duration: 0.3 }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-muted/60 h-4 w-1/3 animate-pulse rounded" />
      <div className="bg-muted/60 h-20 animate-pulse rounded-lg" />
      <div className="bg-muted/60 h-4 w-2/3 animate-pulse rounded" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="bg-muted/60 h-10 animate-pulse rounded-lg" />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].slice(0, rows).map((n) => (
        <motion.div
          key={`skeleton-${n}`}
          className="bg-muted/60 h-14 animate-pulse rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (n - 1) * 0.05, duration: 0.3 }}
        />
      ))}
    </div>
  );
}
