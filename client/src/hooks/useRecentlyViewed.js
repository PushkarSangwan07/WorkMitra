import { useState, useEffect, useCallback } from 'react';

const KEY = 'wm_recently_viewed';
const MAX = 5;

export default function useRecentlyViewed() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
      setRecent(stored);
    } catch {
      setRecent([]);
    }
  }, []);

  const addWorker = useCallback((worker) => {
    if (!worker?._id) return;
    setRecent((prev) => {
      const entry = {
        _id: worker._id,
        name: worker.user?.name,
        profession: worker.profession,
        avatar: worker.user?.avatar?.url,
        city: worker.location?.city,
        ratingAvg: worker.ratingAvg,
        rateAmount: worker.rateAmount,
        rateType: worker.rateType,
      };
      const filtered = prev.filter((w) => w._id !== worker._id);
      const updated = [entry, ...filtered].slice(0, MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem(KEY);
    setRecent([]);
  }, []);

  return { recent, addWorker, clearRecent };
}
