export function SkeletonLine({ className = '' }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export default function WorkerCardSkeleton() {
  return (
    <div className="card p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl shimmer shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="h-3 w-1/3" />
        </div>
        <SkeletonLine className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-1.5">
        <SkeletonLine className="h-5 w-16 rounded-full" />
        <SkeletonLine className="h-5 w-20 rounded-full" />
        <SkeletonLine className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-4 w-20" />
      </div>
    </div>
  );
}
