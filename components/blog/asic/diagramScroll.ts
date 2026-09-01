export interface DiagramScrollStop {
  anchor: number;
  progress: number;
  distance: number;
}

interface DiagramScrollEntry extends DiagramScrollStop {
  element: HTMLElement;
  visual: HTMLElement;
  publish: (progress: number) => void;
  mode: DiagramScrollMode;
  startDelay: number;
  visible: boolean;
  skipped: boolean;
}

export type DiagramScrollMode = 'desktop' | 'mobile';

interface DiagramScrollCapture {
  index: number;
  progress: number;
  scrollY: number;
}

interface DiagramTouchState {
  x: number;
  y: number;
  managed: boolean;
}

const ANCHOR_TOLERANCE = 2;
const MAX_FRAME_DELTA = 120;
const entries = new Set<DiagramScrollEntry>();
let teardown: (() => void) | undefined;

// Consume the arrival gesture separately so a fast fling cannot skip the first frame.
export function getDiagramScrollCapture(stops: readonly DiagramScrollStop[], scrollY: number, delta: number): DiagramScrollCapture | null {
  if (!delta || !Number.isFinite(delta)) return null;
  const direction = Math.sign(delta);
  const candidates = stops.map((stop, index) => ({ stop, index, offset: (stop.anchor - scrollY) * direction })).filter(({ stop, offset }) => offset >= -ANCHOR_TOLERANCE && offset <= Math.abs(delta) + ANCHOR_TOLERANCE && (offset > ANCHOR_TOLERANCE || (direction > 0 ? stop.progress < 1 : stop.progress > 0))).sort((a, b) => a.offset - b.offset);
  const candidate = candidates[0];
  if (!candidate) return null;
  const { stop, index, offset } = candidate;
  const progress = offset > ANCHOR_TOLERANCE ? (direction > 0 ? 0 : 1) : Math.max(0, Math.min(1, stop.progress + direction * Math.min(Math.abs(delta), MAX_FRAME_DELTA) / Math.max(1, stop.distance)));
  return { index, progress, scrollY: stop.anchor };
}

export function isDiagramTouchCaptureNear(stops: readonly DiagramScrollStop[], scrollY: number, viewportHeight: number): boolean {
  return stops.some((stop) => Math.abs(stop.anchor - scrollY) <= Math.max(1, viewportHeight));
}

export function getDiagramPositionProgress(current: number, anchorOffset: number, viewportHeight: number, touchLayout: boolean): number {
  if (anchorOffset < -ANCHOR_TOLERANCE) return 0;
  if (anchorOffset > ANCHOR_TOLERANCE && (!touchLayout || anchorOffset > viewportHeight)) return 1;
  return current;
}

export function getDiagramNativeScrollProgress(anchorOffset: number, distance: number): number {
  return Math.max(0, Math.min(1, anchorOffset / Math.max(1, distance)));
}

function setProgress(entry: DiagramScrollEntry, progress: number): void {
  if (entry.progress === progress) return;
  entry.progress = progress;
  entry.publish(progress);
}

function measure(entry: DiagramScrollEntry): void {
  const section = entry.element.getBoundingClientRect();
  const visual = entry.visual.getBoundingClientRect();
  const top = Number.parseFloat(getComputedStyle(entry.visual).top) || 0;
  const padding = Number.parseFloat(getComputedStyle(entry.element).paddingTop) || 0;
  entry.anchor = Math.max(0, window.scrollY + section.top + padding - top);
  const nativeScroll = entry.mode === 'mobile';
  entry.visible = visual.height > 0 && top >= 0 && (nativeScroll || top + visual.height <= window.innerHeight + ANCHOR_TOLERANCE);
  const trackHeight = nativeScroll ? Number.parseFloat(getComputedStyle(entry.element, '::after').height) : 0;
  entry.distance = trackHeight > 0 ? trackHeight : (entry.element.dataset.visual === 'rtree' ? 3520 : Math.max(600, window.innerHeight * 1.2)) / Math.max(0.1, 1 - entry.startDelay);
  const anchorOffset = window.scrollY - entry.anchor;
  if (anchorOffset > ANCHOR_TOLERANCE) entry.skipped = false;
  if (!entry.visible || entry.skipped) setProgress(entry, 1);
  else if (nativeScroll) setProgress(entry, getDiagramNativeScrollProgress(anchorOffset, entry.distance));
  else setProgress(entry, getDiagramPositionProgress(entry.progress, anchorOffset, window.innerHeight, false));
}

function hasNestedScroll(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  for (let element: Element | null = target; element && element !== document.body && element !== document.documentElement; element = element.parentElement) {
    if (element.matches('dialog, [role="dialog"], textarea, select, [contenteditable="true"]')) return true;
    if (element.scrollHeight > element.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(element).overflowY)) return true;
  }
  return false;
}

function listen(): () => void {
  let frame = 0;
  let touch: DiagramTouchState | null = null;
  const update = (): void => {
    frame = 0;
    entries.forEach(measure);
  };
  const schedule = (): void => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const consume = (event: Event, delta: number): boolean => {
    if (event.defaultPrevented || !event.cancelable || hasNestedScroll(event.target)) return false;
    entries.forEach(measure);
    const available = Array.from(entries).filter((entry) => entry.mode === 'desktop' && entry.visible && !entry.skipped);
    const capture = getDiagramScrollCapture(available, window.scrollY, delta);
    if (!capture) return false;
    event.preventDefault();
    const entry = available[capture.index];
    setProgress(entry, capture.progress);
    if (window.scrollY !== capture.scrollY) window.scrollTo({ top: capture.scrollY, behavior: 'instant' });
    return true;
  };
  const wheel = (event: WheelEvent): void => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const multiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
    consume(event, event.deltaY * multiplier);
  };
  const keydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || (event.target instanceof Element && event.target.closest('input, textarea, select, button, a, summary, video, [role="slider"], [contenteditable="true"]'))) return;
    if (event.key === 'Escape') {
      entries.forEach((entry) => {
        if (Math.abs(window.scrollY - entry.anchor) <= ANCHOR_TOLERANCE) setProgress(entry, 1);
      });
      return;
    }
    const delta = event.key === 'ArrowDown' ? 80 : event.key === 'ArrowUp' ? -80 : event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey) ? window.innerHeight * 0.8 : event.key === 'PageUp' || (event.key === ' ' && event.shiftKey) ? -window.innerHeight * 0.8 : 0;
    if (delta) consume(event, delta);
  };
  const touchstart = (event: TouchEvent): void => {
    if (event.touches.length !== 1 || hasNestedScroll(event.target)) {
      touch = null;
      return;
    }
    entries.forEach(measure);
    const available = Array.from(entries).filter((entry) => entry.mode === 'desktop' && entry.visible && !entry.skipped);
    const managed = isDiagramTouchCaptureNear(available, window.scrollY, window.innerHeight);
    const overshot = managed ? available.filter((entry) => entry.progress < 1 && window.scrollY > entry.anchor + ANCHOR_TOLERANCE).sort((a, b) => b.anchor - a.anchor)[0] : undefined;
    if (overshot) window.scrollTo({ top: overshot.anchor, behavior: 'instant' });
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY, managed };
  };
  const touchmove = (event: TouchEvent): void => {
    if (!touch || event.touches.length !== 1) return;
    const point = event.touches[0];
    const delta = touch.y - point.clientY;
    const horizontal = Math.abs(touch.x - point.clientX) > Math.abs(delta);
    touch.x = point.clientX;
    touch.y = point.clientY;
    if (horizontal || hasNestedScroll(event.target)) return;
    if (consume(event, delta)) {
      touch.managed = true;
    } else if (touch.managed && event.cancelable && !event.defaultPrevented) {
      // Once the gesture is ours, keep native panning disabled until touchend.
      event.preventDefault();
      window.scrollBy({ top: delta, behavior: 'instant' });
    }
  };
  const touchend = (): void => { touch = null; };
  const observer = new ResizeObserver(schedule);
  observer.observe(document.body);
  window.addEventListener('wheel', wheel, { passive: false });
  window.addEventListener('keydown', keydown);
  window.addEventListener('touchstart', touchstart, { passive: true });
  window.addEventListener('touchmove', touchmove, { passive: false });
  window.addEventListener('touchend', touchend);
  window.addEventListener('touchcancel', touchend);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener('wheel', wheel);
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('touchstart', touchstart);
    window.removeEventListener('touchmove', touchmove);
    window.removeEventListener('touchend', touchend);
    window.removeEventListener('touchcancel', touchend);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  };
}

export function registerDiagramScroll(element: HTMLElement, publish: (progress: number) => void, startDelay: number, mode: DiagramScrollMode): () => void {
  const visual = element.querySelector<HTMLElement>(`[data-sticky-visual][data-diagram-mode="${mode}"]`);
  if (!visual) return () => {};
  const entry: DiagramScrollEntry = { element, visual, publish, mode, startDelay, anchor: 0, progress: 0, distance: 1, visible: false, skipped: false };
  entries.add(entry);
  measure(entry);
  if (!teardown) teardown = listen();
  return () => {
    entries.delete(entry);
    if (entries.size) return;
    teardown?.();
    teardown = undefined;
  };
}

export function completeDiagramScroll(element: HTMLElement | null): void {
  entries.forEach((entry) => {
    if (entry.element !== element) return;
    entry.skipped = true;
    setProgress(entry, 1);
    if (entry.mode === 'mobile') window.scrollTo({ top: entry.anchor + entry.distance, behavior: 'instant' });
  });
}
