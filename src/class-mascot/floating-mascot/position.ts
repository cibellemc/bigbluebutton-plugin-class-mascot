// Floating window preferences kept per browser, so they survive hiding the mascot
// and reloading the room: where it was last dropped, whether it is minimized and
// whether it was closed from the paw button in the top bar.
interface FloatingPosition {
  top: number;
  left: number;
}

const POSITION_STORAGE_KEY = 'class-mascot:floating-position';
const MINIMIZED_STORAGE_KEY = 'class-mascot:floating-minimized';
const OPEN_STORAGE_KEY = 'class-mascot:floating-open';
const DEFAULT_POSITION: FloatingPosition = { top: 80, left: 20 };
// Space between the paw button and the window, and from the edge of the screen.
const ANCHOR_GAP = 8;

function readSavedPosition(): FloatingPosition {
  try {
    const saved = JSON.parse(localStorage.getItem(POSITION_STORAGE_KEY));
    if (Number.isFinite(saved?.top) && Number.isFinite(saved?.left)) return saved;
  } catch {
    // Storage blocked or invalid: fall back to the default.
  }
  return DEFAULT_POSITION;
}

// Like a dropdown: right below the anchor (the paw button in the top bar), with
// both right edges aligned so the window grows to the left. Null while the anchor
// is not in the page, e.g. a client that does not show plugin buttons in the top bar.
function positionBelow(anchor: Element | null, widthRem: number): FloatingPosition | null {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return {
    top: rect.bottom + ANCHOR_GAP,
    left: Math.max(ANCHOR_GAP, rect.right - widthRem * remPx),
  };
}

// BBB moves the window with react-draggable, which stores the position as
// `transform: translate(<left>px, <top>px)` on the element given to the plugin.
function savePositionOnDrop(element: HTMLElement): void {
  element.addEventListener('pointerup', () => {
    const match = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(element.style.transform);
    if (!match) return;
    try {
      localStorage.setItem(
        POSITION_STORAGE_KEY,
        JSON.stringify({
          left: Number(match[1]),
          top: Number(match[2]),
        })
      );
    } catch {
      // Storage blocked: the window keeps its position until it is recreated.
    }
  });
}

// Whether this user minimized the floating window; it only affects their own view.
function readMinimized(): boolean {
  try {
    return localStorage.getItem(MINIMIZED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveMinimized(minimized: boolean): void {
  try {
    localStorage.setItem(MINIMIZED_STORAGE_KEY, String(minimized));
  } catch {
    // Storage blocked: the choice lasts until the window is recreated.
  }
}

// Whether this user keeps the floating window open; it only affects their own view.
function readOpen(): boolean {
  try {
    return localStorage.getItem(OPEN_STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

function saveOpen(open: boolean): void {
  try {
    localStorage.setItem(OPEN_STORAGE_KEY, String(open));
  } catch {
    // Storage blocked: the choice lasts until the room is reloaded.
  }
}

export {
  readSavedPosition,
  positionBelow,
  savePositionOnDrop,
  readMinimized,
  saveMinimized,
  readOpen,
  saveOpen,
};
