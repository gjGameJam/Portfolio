// The tuning numbers for behavior: breakpoint, zoom, drawer size, motion, timing.
// Sizes that belong to a single component's look (hub disc 124/138px, hover card
// 236px, arc height 148px) live beside that component, in its view module and
// stylesheet, with a note in each pointing at the other.

// Below this width, or this height, the page opens on the List view, the drawer is a
// bottom sheet, and an area's graph frames its hub alone (pinch out for the overview).
// The height catches a phone on its side: most are wider than COMPACT_W that way, and
// the desktop web cannot fit the stage a landscape phone leaves (about 270px tall).
export const COMPACT_W = 820;
export const COMPACT_H = 500;

// Camera zoom bounds. Never zoom out past the overview; Cybersecurity is a single
// node, so an unbounded fit would swallow the screen.
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 2.1;

// Drawer geometry: min(420px, 92vw) on desktop, 58vh as a bottom sheet on compact.
// Written onto :root as --drawer-width at boot and --sheet-height on every measure
// (see app.js). On a short phone the sheet gives way so the band above it stays at
// least SHEET_MIN_BAND tall, room for the 138px hub disc; it never drops below
// SHEET_MIN_VH, which only a landscape phone reaches.
export const DRAWER_MAX_W = 420;
export const DRAWER_VW = 0.92;
export const SHEET_VH = 0.58;
export const SHEET_MIN_BAND = 170;
export const SHEET_MIN_VH = 0.4;

// The simulation steps on a fixed 16ms interval rather than requestAnimationFrame,
// so its speed does not depend on the display's refresh rate. The regression
// harness in tools/regression takes over any 16ms interval; if this changes, change
// the `ms === 16` test in tools/regression/regress.py too.
export const TICK_MS = 16;

// Ambient motion once the graph has settled: "drift", "settled" or "static".
export const MOTION = "drift";

// Rest length of a project's link to its hub, in stage pixels at full width.
export const LINK_LENGTH = 185;

// A phone's stage is too small to spread the web out, so compact lays it out on a canvas
// scaled up, keeping the stage's shape, until it is at least COMPACT_LAYOUT_W wide and
// COMPACT_LAYOUT_AREA square pixels, in its own layout (js/graph/compact-layout.js). The
// area matters on short and landscape screens, where the width alone leaves too little
// room for 24 pills. An area page frames its hub at full size with the projects further
// out; the overview zooms out to fit the whole canvas.
export const COMPACT_LAYOUT_W = 560;
export const COMPACT_LAYOUT_AREA = 600000;

// The stage size the simulation seeds against before the first measurement.
export const INITIAL_STAGE = { w: 1200, h: 680 };
