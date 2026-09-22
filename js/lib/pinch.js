// Calls onOut once per gesture when the user zooms out over `el`: two fingers
// pinching together, or the wheel scrolled down (a trackpad pinch arrives as a
// ctrl+wheel). It only reports the gesture; the caller decides what zooming out means.
// While `when()` is false it does nothing at all, the browser's own ctrl+wheel zoom
// included. Events inside `ignore` pass through too, so a scrolling panel keeps scrolling.
//
// For the touch half to fire, the browser must not claim the pinch itself: give the
// surfaces under the fingers `touch-action: pan-x pan-y`, or `none`.

const PINCH_RATIO = 0.75;   // fingers at 3/4 of their starting spread
const WHEEL_PX = 120;       // about one notch of a mouse wheel
const WHEEL_IDLE_MS = 250;  // a pause this long starts a new wheel gesture

export function onPinchOut(el, { when, ignore, onOut }) {
  const skip = e => !when() || (ignore && e.target.closest && e.target.closest(ignore));
  const spread = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  let start = 0, pinched = false;
  el.addEventListener("touchstart", e => {
    if (e.touches.length !== 2 || skip(e)) return;
    start = spread(e.touches);
    pinched = false;
  }, { passive: true });
  el.addEventListener("touchmove", e => {
    if (!start || pinched || e.touches.length !== 2) return;
    if (spread(e.touches) < start * PINCH_RATIO) { pinched = true; onOut(); }
  }, { passive: true });
  const release = e => { if (e.touches.length < 2) start = 0; };
  el.addEventListener("touchend", release, { passive: true });
  el.addEventListener("touchcancel", release, { passive: true });

  let sum = 0, last = -Infinity, scrolled = false;
  el.addEventListener("wheel", e => {
    if (skip(e)) return;
    if (e.ctrlKey) e.preventDefault();
    if (e.timeStamp - last > WHEEL_IDLE_MS) { sum = 0; scrolled = false; }
    last = e.timeStamp;
    if (scrolled) return;
    if (e.deltaY <= 0) { sum = 0; return; }
    sum += e.deltaY * (e.deltaMode === 1 ? 16 : 1);
    if (sum > WHEEL_PX) { scrolled = true; onOut(); }
  }, { passive: false });
}
