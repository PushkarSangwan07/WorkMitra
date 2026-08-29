import { useState, useEffect, useRef } from 'react';

export default function useCountUp(end, duration = 2000, startOnMount = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  // IntersectionObserver triggers count when element enters viewport
  useEffect(() => {
    if (startOnMount) {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [startOnMount]);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const startVal = 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * (end - startVal) + startVal));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [started, end, duration]);

  return { count, ref };
}
