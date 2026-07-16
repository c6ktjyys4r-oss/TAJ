import { clsx } from 'clsx';

interface SkeletonProps { className?: string; }

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={clsx('animate-pulse bg-gray-100 rounded-lg', className)} />
);

export const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => (
  <div className={clsx('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={clsx('h-3', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={clsx('bg-white border border-border rounded-xl p-6 space-y-4', className)}>
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonRow = ({ cols = 5 }: { cols?: number }) => (
  <div className="flex items-center gap-4 px-4 py-3 border-b border-border/60">
    {Array.from({ length: cols }).map((_, i) => (
      <Skeleton key={i} className={clsx('h-4', i === 0 ? 'flex-1' : 'w-20')} />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) => (
  <div>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} cols={cols} />
    ))}
  </div>
);
