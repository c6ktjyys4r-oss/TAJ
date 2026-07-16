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

/** Full-page skeleton — used as Suspense fallback during code-split page loads */
export const SkeletonPage = () => (
  <div className="min-h-screen bg-white">
    {/* Top bar placeholder */}
    <div className="h-[57px] border-b border-border bg-white flex items-center px-6 gap-4">
      <Skeleton className="w-7 h-7 rounded-lg" />
      <Skeleton className="w-24 h-4" />
      <div className="flex-1" />
      <Skeleton className="w-52 h-8 rounded-lg" />
      <div className="flex-1" />
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>
    {/* Page content placeholder */}
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <Skeleton className="w-48 h-7" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="bg-white border border-border rounded-xl">
        <div className="p-4 border-b border-border"><Skeleton className="w-32 h-4" /></div>
        <SkeletonTable rows={6} />
      </div>
    </div>
  </div>
);
