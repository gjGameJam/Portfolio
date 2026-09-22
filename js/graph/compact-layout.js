// The compact (phone) layout. Desktop runs a live force simulation every frame; a phone
// canvas is tall and narrow, and live forces there never settle: labels pushed off one
// constraint land on another and jump back and forth. So compact solves the layout once
// per canvas size and pill size, into a home (tx, ty) for every hub and project, and the
// simulation only eases each node toward its home plus a small drift (Simulation#stepCompact).
//
// The solve, in three stages:
//
// 1. Cells. The canvas is split into one convex cell per area, a power diagram of three
//    fixed sites. Every project stays inside its area's cell, and a shared project sits on
//    the border between its two, so a line from a hub to its project never leaves that
//    cell and lines from different areas cannot cross. The sites' weights are balanced so
//    that each cell's size follows how much it holds (its pills and its hub), and each hub
//    goes to the middle of its cell, so no area is squeezed and none is left half empty.
// 2. Spread. The projects start fanned round their hub and are relaxed the way Lloyd's
//    algorithm relaxes points: the cell is sampled on a grid, each sample goes to the
//    nearest pill (or the hub), and each pill moves to the middle of the samples it won.
//    A pill with open space on one side wins more samples there and moves into it, so
//    the pills spread evenly through the whole cell. A pill lying across another
//    project's line is nudged off it as they go.
// 3. Clean-up. Hard passes clear whatever overlap is left: pill on pill, pill on hub,
//    a line under a pill, and anything outside its cell.

// Clearance between a pill and another pill or a hub (and, halved, between a pill and a
// cell border or a line). Two nodes drifting apart by DRIFT each way (js/graph/simulation.js)
// close it by at most 2 * DRIFT * sqrt(2), so drifting pills never touch.
const GAP = 12;
// .node__pill sits 15px above its node's point (top: -15px in css/views/graph.css).
const PILL_TOP = -15;
// The spread: at most ROUNDS Lloyd rounds over a grid SAMPLE canvas pixels apart. A pill
// claims grid points up to REACH beyond its box. The hub counts its distance at HUB_CLAIM
// times a pill's, so it holds only a narrow ring round itself. The numbers were chosen
// by scoring overlaps, lines under pills and solve time across 13 phone and tablet sizes,
// portrait and landscape.
const ROUNDS = 60;
const SAMPLE = 12;
const REACH = 150;
const HUB_CLAIM = 0.5;

// The cells' sites, as canvas fractions for a tall canvas (w/h 0.5), a square one and a
// wide one (2.0); anything between interpolates. They are not where the hubs end up. They
// set which area goes where (AI/ML above Games/Simulations, or left of it on a wide
// canvas, and Cybersecurity in the corner) and which way the borders run.
const START = {
  tall: [[0.5, 0.22], [0.45, 0.62], [0.8, 0.9]],
  square: [[0.3, 0.28], [0.58, 0.55], [0.85, 0.86]],
  wide: [[0.22, 0.5], [0.62, 0.45], [0.9, 0.8]]
};

const hwOf = n => n.hw || 70;
const hhOf = n => n.hh || 17;
// the pill's centre, which is below or above the node's point depending on its height
const cyOf = n => n.y + PILL_TOP + hhOf(n);

export function solveCompact({ hubs, nodes, w, h }) {
  const index = {};
  hubs.forEach((hb, i) => { index[hb.id] = i; });
  for (const n of nodes) n.cells = n.areas.map(id => index[id]);

  const cells = balanceCells(hubs, nodes, w, h);

  // the solve works on x and y; the positions on screen are put back afterwards, and the
  // caller decides whether nodes jump to their homes or glide there
  const shown = hubs.concat(nodes).map(n => [n.x, n.y]);
  hubs.forEach((hb, i) => { hb.x = hb.tx = cells.hubs[i].x; hb.y = hb.ty = cells.hubs[i].y; });
  seed(hubs, nodes, cells, w, h);
  spread(hubs, nodes, cells, w, h);
  cleanUp(hubs, nodes, cells, w, h);
  for (const n of nodes) { n.tx = n.x; n.ty = n.y; }
  hubs.concat(nodes).forEach((n, k) => { [n.x, n.y] = shown[k]; });
  return cells;
}

// ---- Cells ------------------------------------------------------------------

// A pill's claim on its cell: its box with room around it for neighbours and lines.
const claim = n => (2 * hwOf(n) + 3 * GAP) * (2 * hhOf(n) + 3 * GAP);

function balanceCells(hubs, nodes, w, h) {
  const demand = hubs.map(hb => (2 * hb.r + 2 * GAP) ** 2);
  for (const n of nodes) for (const i of n.cells) demand[i] += claim(n) / n.cells.length;
  const total = demand.reduce((a, b) => a + b, 0);
  const target = demand.map(d => (d / total) * w * h);

  const sites = startSites(w, h).map(([fx, fy]) => ({ x: fx * w, y: fy * h, weight: 0 }));
  let cells = build(sites, w, h);
  for (let it = 0; it < 100; it++) {
    // Grow a cell that is short of its share and shrink one with too much. A weight moves
    // each of the cell's borders by weight / (2 * site distance), which changes the area by
    // that much times the border's length, so the step divides the error by the sum.
    let worst = 0;
    sites.forEach((st, i) => {
      const err = target[i] - polyArea(cells.polys[i]);
      worst = Math.max(worst, Math.abs(err) / (w * h));
      let rate = 0;
      for (let j = 0; j < sites.length; j++) {
        if (j !== i && cells.edges[i + ":" + j]) rate += cells.edges[i + ":" + j] / (2 * cells.borders[i + ":" + j].len);
      }
      // a cell squeezed to nothing has no borders to measure; any small push brings it back
      st.weight += err / Math.max(rate, 0.5) * 0.5;
    });
    const mean = sites.reduce((a, st) => a + st.weight, 0) / sites.length;
    for (const st of sites) st.weight -= mean;
    cells = build(sites, w, h);
    if (worst < 0.002) break;
  }
  cells.hubs = cells.polys.map((poly, i) => placeHub(hubs[i], i, poly, cells, w, h));
  return cells;
}

// A hub sits at the middle of its cell, moved in as far as its disc needs to clear the
// canvas edge and the cell's borders.
function placeHub(hub, i, poly, cells, w, h) {
  const area = polyArea(poly);
  const p = area > 1 ? polyCentroid(poly, area) : { x: w / 2, y: h / 2 };
  const need = hub.r + GAP;
  for (let round = 0; round < 8; round++) {
    for (let j = 0; j < cells.sites.length; j++) {
      if (j === i || !cells.shared[i + ":" + j]) continue;
      const b = cells.borders[i + ":" + j];
      const s = b.c - (p.x * b.ux + p.y * b.uy);
      if (s < need) { p.x -= (need - s) * b.ux; p.y -= (need - s) * b.uy; }
    }
    p.x = Math.max(need, Math.min(w - need, p.x));
    p.y = Math.max(need, Math.min(h - need, p.y));
  }
  return p;
}

function startSites(w, h) {
  const lerp = (a, b, t) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);
  // by aspect on a log scale: 0.5 tall, 1 square, 2 wide
  const t = Math.max(-1, Math.min(1, Math.log2(w / h)));
  return t < 0 ? lerp(START.square, START.tall, -t) : lerp(START.square, START.wide, t);
}

// The border between cells i and j: a point p is on i's side when p . u <= c, where u is
// the unit vector from site i to site j. `shared` marks the pairs whose cells touch, and
// `edges` holds the length of the border they share.
function build(sites, w, h) {
  const borders = {};
  for (let i = 0; i < sites.length; i++) {
    for (let j = 0; j < sites.length; j++) {
      if (i === j) continue;
      const a = sites[i], b = sites[j];
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const ux = (b.x - a.x) / len, uy = (b.y - a.y) / len;
      const c = (b.x * b.x + b.y * b.y - a.x * a.x - a.y * a.y + a.weight - b.weight) / (2 * len);
      borders[i + ":" + j] = { ux, uy, c, len };
    }
  }
  const polys = sites.map((_, i) => {
    let poly = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }];
    for (let j = 0; j < sites.length; j++) if (j !== i) poly = clip(poly, borders[i + ":" + j]);
    return poly;
  });
  const shared = {}, edges = {};
  for (let i = 0; i < sites.length; i++) {
    for (let j = 0; j < sites.length; j++) {
      if (i === j) continue;
      const b = borders[i + ":" + j];
      const on = polys[i].filter(p => Math.abs(b.c - (p.x * b.ux + p.y * b.uy)) < 1e-6);
      shared[i + ":" + j] = on.length >= 2;
      edges[i + ":" + j] = on.length >= 2 ? Math.hypot(on[1].x - on[0].x, on[1].y - on[0].y) : 0;
    }
  }
  return { sites, borders, polys, shared, edges };
}

// Sutherland-Hodgman: the part of a convex polygon on the p . u <= c side.
function clip(poly, { ux, uy, c }) {
  const out = [];
  for (let k = 0; k < poly.length; k++) {
    const p = poly[k], q = poly[(k + 1) % poly.length];
    const sp = c - (p.x * ux + p.y * uy), sq = c - (q.x * ux + q.y * uy);
    if (sp >= 0) out.push(p);
    if ((sp >= 0) !== (sq >= 0)) {
      const t = sp / (sp - sq);
      out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
  }
  return out;
}

function polyArea(poly) {
  let a = 0;
  for (let k = 0; k < poly.length; k++) {
    const p = poly[k], q = poly[(k + 1) % poly.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

function polyCentroid(poly, area) {
  let x = 0, y = 0, s = 0;
  for (let k = 0; k < poly.length; k++) {
    const p = poly[k], q = poly[(k + 1) % poly.length];
    const cross = p.x * q.y - q.x * p.y;
    x += (p.x + q.x) * cross; y += (p.y + q.y) * cross; s += cross;
  }
  return s ? { x: x / (3 * s), y: y / (3 * s) } : { x: poly[0].x, y: poly[0].y };
}

// ---- Spread -----------------------------------------------------------------

// Fan each area's own projects round its hub, alternating nearer and further so that
// neighbours start apart, and spread the shared ones along their border.
function seed(hubs, nodes, cells, w, h) {
  hubs.forEach((hb, i) => {
    const own = nodes.filter(n => n.cells.length === 1 && n.cells[0] === i);
    own.forEach((n, k) => {
      const ang = -Math.PI / 2 + ((k + 0.5) / own.length) * Math.PI * 2;
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const reach = rayReach(cells, i, hb.x, hb.y, ux, uy, w, h);
      const r = Math.max(hb.r + 40, reach * (k % 2 ? 0.8 : 0.5));
      n.x = hb.x + ux * r;
      n.y = hb.y + uy * r;
    });
  });
  const groups = {};
  for (const n of nodes) if (n.cells.length > 1) (groups[n.cells.join(":")] ||= []).push(n);
  for (const [key, list] of Object.entries(groups)) {
    const ends = cells.polys[list[0].cells[0]].filter(p => {
      const b = cells.borders[key];
      return Math.abs(b.c - (p.x * b.ux + p.y * b.uy)) < 1e-6;
    });
    const [a, b] = ends.length >= 2 ? ends : [{ x: w * 0.3, y: h / 2 }, { x: w * 0.7, y: h / 2 }];
    list.forEach((n, k) => {
      const t = (k + 1) / (list.length + 1);
      n.x = a.x + (b.x - a.x) * t;
      n.y = a.y + (b.y - a.y) * t;
    });
  }
  confine(nodes, cells, w, h, GAP);
}

// How far a ray from (x, y) runs before it leaves cell i or the canvas.
function rayReach(cells, i, x, y, ux, uy, w, h) {
  let t = Infinity;
  for (let j = 0; j < cells.sites.length; j++) {
    if (j === i) continue;
    const b = cells.borders[i + ":" + j];
    const along = ux * b.ux + uy * b.uy;
    if (along > 1e-9) t = Math.min(t, (b.c - (x * b.ux + y * b.uy)) / along);
  }
  if (ux > 1e-9) t = Math.min(t, (w - x) / ux);
  if (ux < -1e-9) t = Math.min(t, -x / ux);
  if (uy > 1e-9) t = Math.min(t, (h - y) / uy);
  if (uy < -1e-9) t = Math.min(t, -y / uy);
  return Math.max(0, t);
}

function spread(hubs, nodes, cells, w, h) {
  // The grid: each point's cell (the one whose weighted distance is least), and its claim
  // distance to that cell's hub, which keeps a ring clear round the hub for its lines.
  const cols = Math.ceil(w / SAMPLE), rows = Math.ceil(h / SAMPLE), size = cols * rows;
  const cellOf = new Int8Array(size), hubClaim = new Float64Array(size);
  for (let gx = 0; gx < cols; gx++) {
    for (let gy = 0; gy < rows; gy++) {
      const x = (gx + 0.5) * SAMPLE, y = (gy + 0.5) * SAMPLE;
      let best = 0, bv = Infinity;
      cells.sites.forEach((st, i) => {
        const v = (x - st.x) ** 2 + (y - st.y) ** 2 - st.weight;
        if (v < bv) { bv = v; best = i; }
      });
      const hb = hubs[best], d = Math.max(0, Math.hypot(x - hb.x, y - hb.y) - hb.r - GAP) * HUB_CLAIM;
      cellOf[gx * rows + gy] = best;
      hubClaim[gx * rows + gy] = d * d;
    }
  }
  const nearest = new Float64Array(size), owner = new Int16Array(size);
  const sumX = new Float64Array(nodes.length), sumY = new Float64Array(nodes.length), count = new Float64Array(nodes.length);
  const own = nodes.map(n => n.cells.reduce((mask, i) => mask | (1 << i), 0));

  for (let round = 0; round < ROUNDS; round++) {
    nearest.set(hubClaim);
    owner.fill(-1);
    // each pill claims the points nearer its box than any other pill's box or the hub; a
    // pill only looks within REACH of its box, since nothing past that is really its own
    nodes.forEach((n, q) => {
      const hw = hwOf(n), hh = hhOf(n), x = n.x, y = cyOf(n);
      const gx0 = Math.max(0, Math.floor((x - hw - REACH) / SAMPLE)), gx1 = Math.min(cols - 1, Math.floor((x + hw + REACH) / SAMPLE));
      const gy0 = Math.max(0, Math.floor((y - hh - REACH) / SAMPLE)), gy1 = Math.min(rows - 1, Math.floor((y + hh + REACH) / SAMPLE));
      for (let gx = gx0; gx <= gx1; gx++) {
        let dx = Math.abs((gx + 0.5) * SAMPLE - x) - hw;
        dx = dx > 0 ? dx * dx : 0;
        for (let gy = gy0; gy <= gy1; gy++) {
          const g = gx * rows + gy;
          if (!(own[q] & (1 << cellOf[g]))) continue;
          let dy = Math.abs((gy + 0.5) * SAMPLE - y) - hh;
          const d = dx + (dy > 0 ? dy * dy : 0);
          if (d < nearest[g]) { nearest[g] = d; owner[g] = q; }
        }
      }
    });
    sumX.fill(0); sumY.fill(0); count.fill(0);
    for (let g = 0; g < size; g++) {
      const q = owner[g];
      if (q < 0) continue;
      sumX[q] += (Math.floor(g / rows) + 0.5) * SAMPLE;
      sumY[q] += (g % rows + 0.5) * SAMPLE;
      count[q]++;
    }
    // each pill moves most of the way to the middle of what it claimed
    let moved = 0;
    nodes.forEach((n, q) => {
      if (!count[q]) return;
      const dx = (sumX[q] / count[q] - n.x) * 0.6, dy = (sumY[q] / count[q] - cyOf(n)) * 0.6;
      n.x += dx; n.y += dy;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
    });
    // once spread out, pills start stepping off other projects' lines, and the rounds stop
    // when nothing is still moving
    const lines = round > ROUNDS / 3;
    if (lines) {
      for (const n of nodes) {
        const push = lineOverlap(n, nodes, hubs, GAP);
        n.x += push.x * 0.5;
        n.y += push.y * 0.5;
      }
    }
    confine(nodes, cells, w, h, GAP);
    if (lines && moved < 0.3) break;
  }
}

// The total shove that would take n's pill off every other project's line: for each line
// that runs under the pill (grown by pad), the distance to clear it, perpendicular to it.
function lineOverlap(n, nodes, hubs, pad) {
  const hw = hwOf(n) + pad, hh = hhOf(n) + pad, cy = cyOf(n);
  let x = 0, y = 0;
  for (const m of nodes) {
    if (m === n || !m.cells.some(i => n.cells.includes(i))) continue;
    for (const i of m.cells) {
      const hb = hubs[i];
      const dx = m.x - hb.x, dy = m.y - hb.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      const along = (n.x - hb.x) * ux + (cy - hb.y) * uy;
      const off = (n.x - hb.x) * -uy + (cy - hb.y) * ux;
      const reach = Math.abs(uy) * hw + Math.abs(ux) * hh;
      const lead = Math.abs(ux) * hw + Math.abs(uy) * hh;
      // past the line's end the pills themselves are what keep apart
      if (along < hb.r || along > len + lead * 0.2 || Math.abs(off) >= reach) continue;
      const s = (reach - Math.abs(off)) * (off < 0 ? -1 : 1);
      x += -uy * s;
      y += ux * s;
    }
  }
  return { x, y };
}

// ---- Hard constraints ---------------------------------------------------------

// Hold each pill inside its cell and the canvas with `gap` to spare; a shared project's
// point goes onto the border between its two cells.
function confine(nodes, cells, w, h, gap) {
  for (const n of nodes) {
    const hw = hwOf(n) + gap, hh = hhOf(n) + gap, off = PILL_TOP + hhOf(n);
    if (n.cells.length === 2) {
      const b = cells.borders[n.cells[0] + ":" + n.cells[1]];
      const s = b.c - (n.x * b.ux + n.y * b.uy);
      n.x += s * b.ux; n.y += s * b.uy;
    }
    for (let round = 0; round < 2; round++) {
      for (const i of n.cells) {
        for (let j = 0; j < cells.sites.length; j++) {
          if (n.cells.includes(j)) continue;
          const b = cells.borders[i + ":" + j];
          const need = Math.abs(b.ux) * hw + Math.abs(b.uy) * hh;
          const s = b.c - (n.x * b.ux + (n.y + off) * b.uy);
          if (s >= need) continue;
          if (n.cells.length === 2) {
            // slide along its own border rather than off it
            const own = cells.borders[n.cells[0] + ":" + n.cells[1]];
            const tx = -own.uy, ty = own.ux;
            const along = tx * b.ux + ty * b.uy;
            if (Math.abs(along) > 1e-6) { const t = -(need - s) / along; n.x += tx * t; n.y += ty * t; }
          } else {
            n.x -= (need - s) * b.ux; n.y -= (need - s) * b.uy;
          }
        }
      }
      n.x = Math.max(hw, Math.min(w - hw, n.x));
      n.y = Math.max(hh - off, Math.min(h - hh - off, n.y));
    }
  }
}

// Clear what the spread left: first every overlap, pill on pill and pill on hub, holding
// each pill in its cell as it goes; then each line under a pill, but only by moves that
// land the pill somewhere free, so taking it off a line never puts it on another pill.
function cleanUp(hubs, nodes, cells, w, h) {
  for (let round = 0; round < 60; round++) {
    const before = nodes.map(n => [n.x, n.y]);
    separate(nodes, hubs);
    confine(nodes, cells, w, h, GAP / 2);
    if (nodes.every((n, k) => Math.abs(n.x - before[k][0]) + Math.abs(n.y - before[k][1]) < 0.05)) break;
  }
  for (let round = 0; round < 12; round++) {
    let moved = false;
    for (const n of nodes) {
      const push = lineOverlap(n, nodes, hubs, GAP / 2);
      if (Math.abs(push.x) + Math.abs(push.y) < 0.05) continue;
      const x = n.x, y = n.y;
      n.x += push.x; n.y += push.y;
      confine([n], cells, w, h, GAP / 2);
      if (clashes(n, nodes, hubs)) { n.x = x; n.y = y; } else moved = true;
    }
    if (!moved) break;
  }
}

// One pass of pill-on-pill and pill-on-hub separation.
function separate(nodes, hubs) {
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const p = nodes[a], q = nodes[b];
      const dx = q.x - p.x, dy = cyOf(q) - cyOf(p);
      const ox = hwOf(p) + hwOf(q) + GAP - Math.abs(dx);
      const oy = hhOf(p) + hhOf(q) + GAP - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;
      // split along whichever axis is the shorter way out
      if (ox < oy) { const s = (dx < 0 ? -1 : 1) * (ox / 2 + 0.3); p.x -= s; q.x += s; }
      else { const s = (dy < 0 ? -1 : 1) * (oy / 2 + 0.3); p.y -= s; q.y += s; }
    }
  }
  for (const n of nodes) {
    for (const hb of hubs) {
      const d = hubDistance(n, hb);
      if (d >= hb.r + GAP) continue;
      const ux = n.x - hb.x, uy = cyOf(n) - hb.y, ul = Math.hypot(ux, uy) || 1;
      const s = hb.r + GAP - d + 0.3;
      n.x += (ux / ul) * s; n.y += (uy / ul) * s;
    }
  }
}

// How far a pill's box is from a hub's centre.
function hubDistance(n, hb) {
  const cy = cyOf(n), hw = hwOf(n), hh = hhOf(n);
  const qx = Math.max(n.x - hw, Math.min(hb.x, n.x + hw));
  const qy = Math.max(cy - hh, Math.min(hb.y, cy + hh));
  return Math.hypot(qx - hb.x, qy - hb.y);
}

// Whether n's pill is within GAP of another pill or a hub.
function clashes(n, nodes, hubs) {
  for (const m of nodes) {
    if (m === n) continue;
    if (hwOf(n) + hwOf(m) + GAP > Math.abs(n.x - m.x) && hhOf(n) + hhOf(m) + GAP > Math.abs(cyOf(n) - cyOf(m))) return true;
  }
  return hubs.some(hb => hubDistance(n, hb) < hb.r + GAP);
}
