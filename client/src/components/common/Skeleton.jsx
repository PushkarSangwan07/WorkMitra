export function SkeletonLine({ className = '' }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export default function WorkerCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#0f1f35] border border-gray-100 dark:border-white/5 p-4 sm:p-5 flex flex-col gap-3.5">

      {/* Header — avatar + name + availability badge */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-[52px] w-[52px] rounded-2xl shimmer shrink-0" />

        {/* Name + profession + badge */}
        <div className="flex-1 space-y-2 pt-1">
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="h-3 w-1/3" />
          <SkeletonLine className="h-4 w-20 rounded-full" />
        </div>

        {/* Availability pill */}
        <SkeletonLine className="h-5 w-16 rounded-full shrink-0" />
      </div>

      {/* Star rating row */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-3 rounded-sm shimmer" />
          ))}
        </div>
        <SkeletonLine className="h-3 w-8" />
        <SkeletonLine className="h-3 w-16" />
      </div>

      {/* Skills row */}
      <div className="flex gap-1.5">
        <SkeletonLine className="h-5 w-16 rounded-full" />
        <SkeletonLine className="h-5 w-20 rounded-full" />
        <SkeletonLine className="h-5 w-14 rounded-full" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          <SkeletonLine className="h-3 w-3 rounded-full" />
          <SkeletonLine className="h-3 w-20" />
        </div>
        <SkeletonLine className="h-4 w-16" />
      </div>
    </div>
  );
}







