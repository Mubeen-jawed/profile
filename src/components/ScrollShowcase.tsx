"use client";

import { useEffect, useRef, useState } from "react";

interface Slide {
  number: number;
  suffix: string;
  label: string;
  sublabel: string;
}

const slides: Slide[] = [
  {
    number: 300,
    suffix: "K+",
    label: "Profile lookups completed",
    sublabel: "Public Reddit profiles fully analyzed across active communities",
  },
  {
    number: 8,
    suffix: "M+",
    label: "Posts and comments indexed",
    sublabel: "Fast aggregation for a complete profile activity snapshot",
  },
  {
    number: 5,
    suffix: "x",
    label: "Faster than manual research",
    sublabel: "Compared to manually browsing Reddit threads one by one",
  },
  {
    number: 24,
    suffix: "/7",
    label: "Always-on profile tool",
    sublabel: "Run profile checks any time and get results instantly",
  },
];

function CountUp({ target }: { target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return value.toLocaleString();
}

function CaretDownIcon() {
  return (
    <svg
      className="h-4 w-4 animate-bounce text-zinc-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default function ScrollShowcase() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) {
          ticking = false;
          return;
        }

        const rect = container.getBoundingClientRect();
        const scrollableHeight = rect.height - window.innerHeight;
        if (scrollableHeight <= 0) {
          ticking = false;
          return;
        }

        const scrolled = -rect.top;
        setProgress(Math.max(0, Math.min(1, scrolled / scrollableHeight)));
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeIndex = Math.min(
    slides.length - 1,
    Math.floor(progress * slides.length),
  );

  return (
    <section ref={containerRef} className="relative h-[300vh] md:h-[400vh]">
      <div
        className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden"
        style={{ background: "#080808" }}
      >
        <div
          className="pointer-events-none absolute -left-[10%] -top-[10%] h-[420px] w-[420px] rounded-full md:h-[600px] md:w-[600px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 69, 0, 0.14), transparent 70%)",
            transform: `translate(${progress * -80}px, ${progress * -120}px)`,
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-[8%] -right-[10%] h-[320px] w-[320px] rounded-full md:h-[450px] md:w-[450px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 69, 0, 0.10), transparent 70%)",
            transform: `translate(${progress * 50}px, ${progress * 100}px)`,
          }}
        />
        <div
          className="pointer-events-none absolute right-[15%] top-[35%] h-[220px] w-[220px] rounded-full md:h-[300px] md:w-[300px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 96, 48, 0.08), transparent 70%)",
            transform: `translate(${progress * -40}px, ${progress * 60}px) scale(${1 + progress * 0.3})`,
          }}
        />

        <div
          className="pointer-events-none absolute left-[8%] right-[8%] top-[25%] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
            opacity: 0.03 + progress * 0.04,
            transform: `translateY(${progress * -50}px)`,
          }}
        />
        <div
          className="pointer-events-none absolute bottom-[28%] left-[12%] right-[12%] h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
            opacity: 0.03 + progress * 0.04,
            transform: `translateY(${progress * 30}px)`,
          }}
        />

        <p className="absolute top-12 text-[11px] font-bold tracking-[2.8px] text-white/25 sm:text-xs">
          redditprofile · REDDIT INTELLIGENCE
        </p>

        <div className="relative flex h-[220px] w-full items-center justify-center">
          {slides.map((slide, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={slide.label}
                className="absolute w-full px-6 text-center transition-all duration-700 ease-out"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive
                    ? "translateY(0)"
                    : i < activeIndex
                      ? "translateY(-40px)"
                      : "translateY(40px)",
                }}
              >
                <p className="mb-5 text-[clamp(48px,11vw,104px)] font-extrabold leading-none tracking-[-3px] text-white">
                  {isActive ? (
                    <CountUp
                      key={`${slide.label}-${activeIndex}`}
                      target={slide.number}
                    />
                  ) : (
                    0
                  )}
                  {slide.suffix}
                </p>
                <p className="mb-2 text-[clamp(17px,2.5vw,22px)] font-semibold text-white/85">
                  {slide.label}
                </p>
                <p className="mx-auto max-w-xl text-sm text-white/45 sm:text-[15px]">
                  {slide.sublabel}
                </p>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-[72px] flex items-center gap-2">
          {slides.map((slide, i) => (
            <div
              key={slide.label}
              className="h-2 transition-all duration-500 ease-out"
              style={{
                background:
                  i === activeIndex ? "#ff4500" : "rgba(255,255,255,0.12)",
                width: i === activeIndex ? 24 : 8,
                borderRadius: i === activeIndex ? 4 : 999,
              }}
            />
          ))}
        </div>

        <div
          className="absolute bottom-7 flex flex-col items-center gap-1 text-white/35 transition-opacity duration-300"
          style={{
            opacity: Math.max(0, 1 - progress * 12),
            pointerEvents: progress > 0.08 ? "none" : "auto",
          }}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-zinc-500">
            Scroll to explore
          </span>
          <CaretDownIcon />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
          <div
            className="h-full rounded-r-sm"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #ff4500, #ff7a50)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
