import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;       // ms
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter = ({
  target, duration = 1200, prefix = '', suffix = '', decimals = 0, className
}: AnimatedCounterProps) => {
  const [value,   setValue]   = useState(0);
  const [started, setStarted] = useState(false);
  const rafRef    = useRef<number | null>(null);
  const startRef  = useRef<number | null>(null);
  const spanRef   = useRef<HTMLSpanElement | null>(null);

  // IntersectionObserver — only animate when counter enters the viewport
  useEffect(() => {
    if (!spanRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(spanRef.current);
    return () => observer.disconnect();
  }, []);

  // RAF animation — runs once `started` flips true
  useEffect(() => {
    if (!started) return;
    startRef.current = null;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [started, target, duration]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
  return (
    <span ref={spanRef} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
};
