// The force layout behind the graph: three area hubs pinned to a triangle, each
// project linked to its hubs by a spring, everything repelling everything, and
// a positional pass that clears overlapping labels. Coordinates are stage pixels;
// the camera (camera.js) never changes them.
//
// Nodes carry hw/hh, the measured half-extents of their label pills, which
// views/graph.js writes back as it paints. Until measured they fall back to 70/17.
//
// Compact (a phone) does not run these forces: it solves its layout once per size in
// compact-layout.js and eases toward it. See stepCompact.

import { solveCompact } from "./compact-layout.js";

// Compact's ambient drift, in canvas pixels either way, and how fast a node closes on
// its home (a share of the distance per step). compact-layout.js leaves GAP between
// pills, enough that drifting never makes two touch.
const DRIFT = 3;
const EASE = 0.1;

export class Simulation {
  constructor({ areas, projects, width, height, linkLength, motion, compact = false }) {
    this.linkLength = linkLength;
    this.motion = motion;
    this.compact = compact;
    this.frame = 0;
    this.anchorFrom = 0;
    this.settled = false;
    this.seed(areas, projects, width, height);
  }

  get all() {
    return this.hubs.concat(this.nodes);
  }

  static triangle(w, h) {
    // equilateral, centred, sized to the shorter axis so it fills the vertical space
    const cx = w / 2, cy = h * 0.5;
    const R = Math.min(w * 0.36, (h - Math.min(168, h * 0.26)) / 1.5);
    return [-150, -30, 90].map(deg => {
      const a = deg * Math.PI / 180;
      return [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
    });
  }

  seed(areas, projects, w, h) {
    const tri = Simulation.triangle(w, h);
    this.hubs = areas.map((a, i) => ({
      id: a.id, area: a, hub: true, r: 69,
      x: tri[i][0], y: tri[i][1], vx: 0, vy: 0, ph: i * 2.1
    }));
    const cx = w / 2, cy = h / 2;
    const base = this.linkLength;
    const seed = {}, ring = {};
    const own = {};
    areas.forEach(a => { own[a.id] = []; });
    const multi = [];
    projects.forEach(p => { p.areas.length === 1 ? own[p.areas[0]].push(p) : multi.push(p); });

    // each hub's own projects fan out on an arc facing away from the triangle's centre,
    // on two alternating rings so a 13-child hub still fits without piling up
    areas.forEach((a, i) => {
      const hb = this.hubs[i];
      const out = Math.atan2(hb.y - cy, hb.x - cx);
      // tier 1 seeds on the inner ring, tier 3 furthest out
      const list = own[a.id].slice().sort((x, y) => x.tier - y.tier), n = list.length;
      const rings = n > 8 ? 3 : 2;
      const spread = n > 8 ? Math.PI * 1.0 : n > 4 ? Math.PI * 0.95 : Math.PI * 0.6;
      list.forEach((p, k) => {
        const ang = n === 1 ? out : out + (k / (n - 1) - 0.5) * spread;
        const mul = 1 + Math.min(rings - 1, p.tier - 1 + (k % 2) * (rings > 2 ? 1 : 0)) * 0.42;
        ring[p.id] = mul;
        seed[p.id] = [hb.x + Math.cos(ang) * base * mul, hb.y + Math.sin(ang) * base * mul];
      });
    });
    multi.forEach((p, k) => {
      const hs = p.areas.map(id => this.hubs.find(x => x.id === id));
      const mx = hs.reduce((s, x) => s + x.x, 0) / hs.length;
      const my = hs.reduce((s, x) => s + x.y, 0) / hs.length;
      ring[p.id] = 1;
      seed[p.id] = [mx + (k % 2 ? 60 : -60), my + (k % 2 ? 34 : -34)];
    });

    this.nodes = projects.map((p, i) => ({
      id: p.id, p, areas: p.areas, r: 26, ph: i * 0.87,
      ringMul: ring[p.id] || 1,
      x: seed[p.id][0], y: seed[p.id][1], vx: 0, vy: 0
    }));
  }

  // The stage changed size: let everything settle again before drift anchors it.
  resetAnchors() {
    this.anchorFrom = this.frame || 0;
    this.settled = false;
    for (const n of this.all) { n.hx = undefined; n.hy = undefined; }
  }

  // One step. `frozen` holds the ids (hovered, selected, focused area) that must
  // not move, so a card or panel never chases its node.
  step(w, h, frozen) {
    const motion = this.motion;
    if (motion === "static" && this.settled) return;
    if (this.compact) return this.stepCompact(w, h, frozen);
    const fit = Math.min(1, Math.min(w / 1180, h / 660));
    const link = this.linkLength * Math.max(0.5, fit);
    const all = this.all;
    const t = this.frame / 60;

    const tri = Simulation.triangle(w, h);
    for (let i = 0; i < this.hubs.length; i++) {
      const hb = this.hubs[i], p = tri[i];
      hb.vx += (p[0] - hb.x) * 0.014;
      hb.vy += (p[1] - hb.y) * 0.014;
    }
    for (const n of this.nodes) {
      for (const id of n.areas) {
        const hb = this.hubs.find(x => x.id === id);
        const dx = hb.x - n.x, dy = hb.y - n.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - link * (n.ringMul || 1)) * 0.0055;
        n.vx += (dx / d) * f * 6;
        n.vy += (dy / d) * f * 6;
      }
      n.vx += (w / 2 - n.x) * 0.0006;
      n.vy += (h / 2 - n.y) * 0.0006;
    }
    for (let i = 0; i < all.length; i++) {
      for (let k = i + 1; k < all.length; k++) {
        const a = all[i], b = all[k];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        const bothHubs = a.hub && b.hub;
        const min = bothHubs ? a.r + b.r + 96 : a.r + b.r + 34;
        // repulsion stays at full strength as the stage narrows; only link length shrinks
        const rep = (a.hub || b.hub ? 5200 : 3000 * Math.max(0.55, fit)) / (d * d);
        let f = rep;
        if (d < min) f += (min - d) * (bothHubs ? 0.14 : 0.06);
        a.vx -= (dx / d) * f; a.vy -= (dy / d) * f;
        b.vx += (dx / d) * f; b.vy += (dy / d) * f;
        if (bothHubs && d < min) {
          // hard separation: hubs and their labels can never overlap at any stage width
          const push = (min - d) / 2;
          a.x -= (dx / d) * push; a.y -= (dy / d) * push;
          b.x += (dx / d) * push; b.y += (dy / d) * push;
        }
      }
    }
    const amp = motion === "drift" ? 0.048 : motion === "settled" ? 0.015 : 0;
    const anchored = this.frame > (this.anchorFrom || 0) + 300;
    for (const n of all) {
      if (anchored && n.hx === undefined) { n.hx = n.x; n.hy = n.y; }
      if (amp && anchored) {
        n.vx += Math.sin(t * 0.55 + n.ph) * amp;
        n.vy += Math.cos(t * 0.44 + n.ph * 1.3) * amp;
      }
      n.vx *= 0.9; n.vy *= 0.9;
      if (frozen.has(n.id)) { n.vx = 0; n.vy = 0; } else { n.x += n.vx; n.y += n.vy; }
      if (anchored) {
        // keep every node inside a small disc around its settled home so drift can never reorder or cross edges
        const lim = n.hub ? 7 : 11;
        const ox = n.x - n.hx, oy = n.y - n.hy;
        const od = Math.hypot(ox, oy);
        if (od > lim) { n.x = n.hx + (ox / od) * lim; n.y = n.hy + (oy / od) * lim; n.vx *= 0.4; n.vy *= 0.4; }
      }
      const padX = Math.min(n.hub ? 90 : 96, w * 0.1);
      const padTop = n.hub ? Math.max(n.r + 6, Math.min(84, h * 0.13)) : Math.min(52, h * 0.13);
      const padBot = n.hub ? Math.max(n.r + 6, Math.min(84, h * 0.13)) : Math.min(60, h * 0.13);
      n.x = Math.max(padX, Math.min(w - padX, n.x));
      n.y = Math.max(padTop, Math.min(h - padBot, n.y));
    }
    // clamping can re-introduce overlaps at the stage edges, so alternate the two
    for (let r = 0; r < 6; r++) {
      this.separate(3);
      for (const n of all) {
        const padX = n.hub ? Math.min(90, w * 0.1) : (n.hw || 70) + 14;
        const padY = n.hub ? Math.max(n.r + 6, Math.min(84, h * 0.13)) : Math.min(30, h * 0.08);
        n.x = Math.max(padX, Math.min(w - padX, n.x));
        n.y = Math.max(padY, Math.min(h - padY, n.y));
      }
    }
    if (motion === "static" && this.frame > 240) this.settled = true;
  }

  // The compact step. The first step at a canvas size, and any step after a pill's
  // measured size changes, solves the layout (compact-layout.js), which gives every node
  // a home. Otherwise nothing is solved: each node eases toward its home plus a small
  // drift, so it can never be pushed around by the constraints the solve already met.
  // A node in `frozen` stops drifting where it is, but still follows its home if a new
  // solve moves it. A solve on the first step places the nodes outright; a later one (a
  // rotation, a resize, a web font arriving) lets them glide to their new homes.
  stepCompact(w, h, frozen) {
    const key = Math.round(w) + "x" + Math.round(h) + ":" +
      this.nodes.map(n => Math.round(n.hw || 0) + "," + Math.round(n.hh || 0)).join(";");
    if (key !== this.layoutKey) {
      this.layoutKey = key;
      solveCompact({ hubs: this.hubs, nodes: this.nodes, w, h });
      if (!this.frame) for (const n of this.all) { n.x = n.tx; n.y = n.ty; }
      this.laidOut = true;
    }
    const amp = this.motion === "drift" ? DRIFT : this.motion === "settled" ? DRIFT * 0.3 : 0;
    const t = this.frame / 60;
    for (const n of this.all) {
      if (!frozen.has(n.id)) {
        n.driftX = Math.sin(t * 0.55 + n.ph) * amp * (n.hub ? 0.6 : 1);
        n.driftY = Math.cos(t * 0.44 + n.ph * 1.3) * amp * (n.hub ? 0.6 : 1);
      }
      n.x += (n.tx + (n.driftX || 0) - n.x) * EASE;
      n.y += (n.ty + (n.driftY || 0) - n.y) * EASE;
      n.vx = 0; n.vy = 0;
    }
  }

  // Positional overlap resolution against measured pill boxes: velocity impulses alone
  // cannot clear 24 wide labels before drift anchoring freezes them in place.
  separate(passes) {
    const all = this.all;
    // hubs are circles: use the circumscribed half-extent so a pill can't slide into the flanks
    const halfW = n => n.hub ? n.r * 1.08 + 5 : (n.hw || 70) + 8;
    const halfH = n => n.hub ? n.r * 1.08 + 5 : (n.hh || 17) + 9;
    for (let pass = 0; pass < passes; pass++) {
      let moved = false;
      for (let i = 0; i < all.length; i++) {
        for (let k = i + 1; k < all.length; k++) {
          const a = all[i], b = all[k];
          const dx = b.x - a.x, dy = b.y - a.y;
          const ox = halfW(a) + halfW(b) - Math.abs(dx);
          const oy = halfH(a) + halfH(b) - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;
          moved = true;
          const aFix = a.hub && !b.hub, bFix = b.hub && !a.hub;
          const sa = aFix ? 0 : bFix ? 1 : 0.5, sb = 1 - sa;
          if (ox / (halfW(a) + halfW(b)) < oy / (halfH(a) + halfH(b))) {
            const s = (dx < 0 ? -1 : 1) * (ox + 0.6);
            shift(a, -s * sa, 0); shift(b, s * sb, 0);
          } else {
            const s = (dy < 0 ? -1 : 1) * (oy + 0.6);
            shift(a, 0, -s * sa); shift(b, 0, s * sb);
          }
        }
      }
      if (!moved) break;
    }
  }

  // Union box of a hub and every project hanging off it, in stage pixels. Compact measures
  // the homes rather than the drifting positions, so a camera framed on it holds still.
  areaBox(id) {
    const hub = this.hubs.find(x => x.id === id);
    if (!hub) return null;
    const home = this.compact && this.laidOut;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const add = (n, dy, hw, hh) => {
      const cx = home ? n.tx : n.x, cy = (home ? n.ty : n.y) + dy;
      x0 = Math.min(x0, cx - hw); x1 = Math.max(x1, cx + hw);
      y0 = Math.min(y0, cy - hh); y1 = Math.max(y1, cy + hh);
    };
    add(hub, 0, hub.r + 8, hub.r + 8);
    for (const n of this.nodes) {
      if (!n.areas.includes(id)) continue;
      // the pill sits 15px above the node's own point, which the vertical offset accounts for
      add(n, -15, (n.hw || 70) + 8, (n.hh || 17) + 10);
    }
    return { x0, y0, x1, y1 };
  }
}

function shift(n, dx, dy) {
  n.x += dx; n.y += dy;
  if (n.hx !== undefined) { n.hx += dx; n.hy += dy; }
  n.vx *= 0.5; n.vy *= 0.5;
}
