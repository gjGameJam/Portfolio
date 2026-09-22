// The camera over the graph: which part of the stage is framed and at what zoom.
// It is a translate/scale on the world layer only; the simulation never sees it.

import {
  DRAWER_MAX_W, DRAWER_VW, SHEET_MIN_BAND, SHEET_MIN_VH, SHEET_VH, ZOOM_MAX, ZOOM_MIN
} from "../config.js";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// The desktop drawer's width in pixels, matching --drawer-width.
export const drawerWidth = () => Math.min(DRAWER_MAX_W, window.innerWidth * DRAWER_VW);

// The compact sheet's height in pixels, matching --sheet-height. The band between the
// stage top and the sheet is where the hub sits, so a short screen shortens the sheet
// rather than cropping the hub.
export function sheetHeight(stageTop = 0) {
  const vh = window.innerHeight;
  return Math.max(vh * SHEET_MIN_VH, Math.min(vh * SHEET_VH, vh - stageTop - SHEET_MIN_BAND));
}

// The sub-rect of the stage a framed area should sit in: the stage minus whatever the
// drawer currently covers. The drawer is fixed to the viewport and the stage is inset
// 12px, so the cover is the drawer's own extent less that margin, scaled by how far
// it has slid in.
export function viewport({ w, h, compact, open, stageTop }) {
  if (compact) {
    const cover = Math.max(0, sheetHeight(stageTop) - 12) * open;
    return { x: 0, y: 0, w, h: Math.max(80, h - cover) };
  }
  const cover = Math.max(0, drawerWidth() - 12) * open;
  return { x: 0, y: 0, w: Math.max(180, w - cover), h };
}

// Point the camera target at the focused area, or back at the whole stage.
export function aimCamera(target, { sim, w, h, vp, area, compact }) {
  const box = area ? sim.areaBox(area) : null;
  let k = 1, cx = w / 2, cy = h / 2;
  const hub = area && compact ? sim.hubs.find(x => x.id === area) : null;
  if (hub) {
    // Compact frames the hub alone. A whole area is taller than the band the sheet leaves
    // (AI/ML measured 357x477 against 369x200 at a 393px phone), so fitting it can only
    // clamp to k = 1 and show the web again. The projects are browsed in the sheet instead.
    // The sheet keeps SHEET_MIN_BAND clear so the hub fits at full size. Only a landscape
    // phone gets less, and there the hub zooms below 1 rather than being cropped.
    const lo = vp.h < SHEET_MIN_BAND - 1 ? 0.4 : ZOOM_MIN;
    k = clamp(Math.min(vp.w, vp.h) * 0.8 / (2 * (hub.r + 8)), lo, ZOOM_MAX);
    cx = hub.x;
    cy = hub.y;
  } else if (box) {
    const bw = Math.max(80, box.x1 - box.x0), bh = Math.max(80, box.y1 - box.y0);
    const pad = 1.12;
    k = clamp(Math.min(vp.w / (bw * pad), vp.h / (bh * pad)), ZOOM_MIN, ZOOM_MAX);
    // Centred beside the drawer: keepCovered lets go of an open area. An area too big to
    // fit even at ZOOM_MIN (AI/ML or Games in a 1024px window) spills off both sides.
    cx = (box.x0 + box.x1) / 2;
    cy = (box.y0 + box.y1) / 2;
  } else if (compact) {
    // The compact overview. The web is laid out on a canvas wider than the stage
    // (COMPACT_LAYOUT_W), so zoom out until all of it fits.
    const all = sim.hubs.map(hb => sim.areaBox(hb.id));
    const x0 = Math.min(...all.map(b => b.x0)), x1 = Math.max(...all.map(b => b.x1));
    const y0 = Math.min(...all.map(b => b.y0)), y1 = Math.max(...all.map(b => b.y1));
    const pad = 1.04;
    k = clamp(Math.min(vp.w / ((x1 - x0) * pad), vp.h / ((y1 - y0) * pad)), 0.4, 1);
    cx = (x0 + x1) / 2;
    cy = (y0 + y1) / 2;
  }
  target.x = cx;
  target.y = cy;
  target.k = k;
}

// Keep the world covering the whole stage: no empty gutters, and nothing spilling out
// from under the stage into the header.
//
// This has to run on the camera after it has eased, not on the target before. The bounds
// are measured against the viewport, which the drawer shrinks as it slides, so folding
// them into the target makes the target itself a moving thing that the camera chases at
// a different rate. Selecting a project threw the graph 99px sideways and spent a second
// sliding it back. Clamping the eased camera pins it to the viewport centre every frame.
//
// Compact shows only the hub and clips the stage, so there is nothing to keep covered,
// and at k = 1 this clamp would pin the camera to the stage centre instead of on the hub.
//
// An open area is not held either (strength 0; app.js eases it). These bounds are the
// whole stage, the part under the drawer included, so they pushed an area near the right
// edge under the drawer (up to 11 of Games' nodes) and held Cybersecurity, which sits at
// the bottom, 110 to 270px below centre. aimCamera centres the area instead, which can
// leave a strip of page background at a stage edge; the world layer has no background,
// so nothing shows a seam. The overview still needs the clamp: at k = 1 it is what keeps
// the graph from sliding under the drawer when a project is opened from there.
export function keepCovered(cam, { w, h, vp, compact, strength = 1 }) {
  if (compact || strength <= 0) return;
  const k = cam.k;
  const vcx = vp.x + vp.w / 2, vcy = vp.y + vp.h / 2;
  cam.x += (clamp(cam.x, vcx / k, w - (w - vcx) / k) - cam.x) * strength;
  cam.y += (clamp(cam.y, vcy / k, h - (h - vcy) / k) - cam.y) * strength;
}
