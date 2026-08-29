import { useEffect, useRef } from 'react';

// Usage: const sentinelRef = useInfiniteScroll(loadMore, hasMore);
// Attach sentinelRef to a <div /> at the bottom of your list.
export default function useInfiniteScroll(callback, hasMore) {
  const observerRef = useRef(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        callback();
      }
    });

    return () => observerRef.current?.disconnect();
  }, [callback, hasMore]);

  return (node) => {
    if (node) observerRef.current?.observe(node);
  };
}
