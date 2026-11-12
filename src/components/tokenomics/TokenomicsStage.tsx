"use client";

import { useEffect } from "react";

/**
 * Drives the scroll-told opening of the tokenomics page: the engraving behind the copy is
 * pinned while its section is on screen, and swaps as each step crosses the middle of the viewport.
 */
export function TokenomicsStage() {
  useEffect(() => {
    const scroll = document.querySelector<HTMLElement>(".tk-scroll");
    const stage = scroll?.querySelector<HTMLElement>(".tk-stage");
    if (!scroll || !stage) return;
    const arts = Array.from(stage.querySelectorAll<HTMLElement>(".tk-art"));
    const steps = Array.from(scroll.querySelectorAll<HTMLElement>(".tk-step"));
    const count = stage.querySelector<HTMLElement>(".tk-count");
    const last = String(steps.length - 1).padStart(2, "0");

    let raf = 0;
    const place = () => {
      raf = 0;
      const r = scroll.getBoundingClientRect();
      const where = r.top > 0 ? "top" : r.bottom < innerHeight ? "bottom" : "fixed";
      stage.classList.remove("top", "bottom", "fixed");
      stage.classList.add(where);
    };
    const onScroll = () => {
      raf ||= requestAnimationFrame(place);
    };

    const show = (i: number) => {
      arts.forEach((a, n) => a.classList.toggle("on", n === i));
      if (count) {
        count.style.display = i > 0 ? "" : "none";
        count.textContent = `${String(i).padStart(2, "0")} / ${last}`;
      }
    };

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.isIntersecting && show(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    steps.forEach((s) => io.observe(s));

    place();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
