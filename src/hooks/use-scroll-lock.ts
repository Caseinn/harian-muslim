import * as React from "react";

let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";
let savedTouchAction = "";

export default function useScrollLock(locked: boolean) {
  React.useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const body = document.body;
    const docEl = document.documentElement;
    lockCount += 1;

    if (lockCount === 1) {
      savedOverflow = body.style.overflow;
      savedPaddingRight = body.style.paddingRight;
      savedTouchAction = body.style.touchAction;

      const scrollBarWidth = Math.max(
        0,
        window.innerWidth - docEl.clientWidth
      );
      if (scrollBarWidth > 0) {
        body.style.paddingRight = `${scrollBarWidth}px`;
      }
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        body.style.overflow = savedOverflow;
        body.style.paddingRight = savedPaddingRight;
        body.style.touchAction = savedTouchAction;
      }
    };
  }, [locked]);
}
