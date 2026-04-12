import { useEffect, useState } from 'react';

interface CountUpProps {
  target: number;
  suffix?: string;
  prefix?: string;
  inView: boolean;
  className?: string;
}

export function CountUp({
  target,
  suffix = '',
  prefix = '',
  inView,
  className = '',
}: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
