import { useEffect } from "react";

/**
 * Locks body scroll while a modal/lightbox is mounted.
 *
 * `overflow: hidden` alone doesn't stop touch scrolling on iOS Safari —
 * the page behind a fixed-position overlay can still be dragged, which
 * is what made overlays feel "jumpy" on iPhone even without typing.
 * Pinning the body with `position: fixed` at the current scroll offset
 * is the reliable cross-browser fix, so we restore that offset on unmount.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const scrollY = window.scrollY;
    const { position, top, left, right, overflow } = document.body.style;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.left = left;
      document.body.style.right = right;
      document.body.style.overflow = overflow;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
