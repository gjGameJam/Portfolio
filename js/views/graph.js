// The graph: builds the hub, node and edge elements once, toggles their state
// classes on every render, and writes positions and the camera every frame.

import { html } from "../lib/html.js";
import { areaLabel, isArea, toneOf } from "../model/areas.js";

// Hub discs are 124px, 138px when lit (.hub__disc in css/views/graph.css); the label
// gets the disc less 26px.
const DISC = 124;
const DISC_LIT = 138;

// Long area names break after the slash, and only there.
const hubName = name => (name.length > 14 ? name.replace("/", "/\n") : name);

// Size the label off the box, never the other way round: the type shrinks until
// the longest line fits.
function hubFont(name, box) {
  const longest = Math.max(...name.split("\n").map(s => s.trim().length));
  return Math.max(13, Math.min(20, Math.floor(box / (longest * 0.53))));
}

const hubTemplate = hub => {
  const name = hubName(hub.area.name);
  const fonts = `--hub-font: ${hubFont(name, DISC - 26)}px; --hub-font-lit: ${hubFont(name, DISC_LIT - 26)}px`;
  return html`<div class="hub" data-node="${hub.id}" data-tone="${hub.id}">
    <div class="hub__halo" style="animation-delay: ${hub.ph}s"></div>
    <div class="hub__disc"><span class="hub__title" style="${fonts}">${name}</span></div>
  </div>`;
};

const nodeTemplate = node => {
  const p = node.p;
  // a shared project's dot is split between the colors of the areas it belongs to
  const n = p.areas.length;
  const dotFill = n > 1
    ? "--dot-fill: linear-gradient(90deg, " +
      p.areas.map((id, i) => `rgb(var(--area-${id})) ${i * 100 / n}% ${(i + 1) * 100 / n}%`).join(", ") + ")"
    : null;
  return html`<div class="node node--tier${p.tier}" data-node="${p.id}" data-tone="${toneOf(p.areas)}"${dotFill ? html` style="${dotFill}"` : ""}>
    <div class="node__pill"><span class="node__dot"></span><span class="node__label">${p.name}</span></div>
    <div class="peek${p.blurb ? " has-blurb" : ""}"><span class="peek__area">${areaLabel(p.areas)}</span><span class="peek__blurb">${p.blurb}</span></div>
  </div>`;
};

export class GraphView {
  constructor(stage, sim, { onHover, onHubClick, onNodeClick, onEmptyClick }) {
    this.stage = stage;
    this.sim = sim;
    this.world = stage.querySelector("[data-world]");

    const edges = [];
    for (const n of sim.nodes) for (const id of n.areas) edges.push({ key: id + "-" + n.id, area: id });

    this.world.innerHTML = html`<svg class="edges" width="100%" height="100%">${edges.map(e =>
      html`<line class="edge" data-edge="${e.key}" data-tone="${e.area}"></line>`)}</svg>
      ${sim.hubs.map(hubTemplate)}
      ${sim.nodes.map(nodeTemplate)}`;

    this.els = new Map();
    for (const el of this.world.querySelectorAll("[data-node]")) {
      this.els.set(el.dataset.node, el);
      el.addEventListener("mouseenter", () => onHover(el.dataset.node));
      el.addEventListener("mouseleave", () => onHover(null));
    }
    this.edges = new Map([...this.world.querySelectorAll("[data-edge]")].map(el => [el.dataset.edge, el]));

    stage.addEventListener("click", e => {
      const el = e.target.closest("[data-node]");
      if (el) {
        const id = el.dataset.node;
        return isArea(id) ? onHubClick(id) : onNodeClick(id);
      }
      // empty space steps up a level; the edges' <svg> covers the whole world
      if (e.target === stage || e.target.tagName === "svg") onEmptyClick();
    });
  }

  // State-driven classes: what is lit, dimmed or hidden. `solo` is compact inside an
  // area, where only that area shows: its hub, its projects and the edges between them,
  // though most of the projects sit past the band above the sheet.
  update({ hover, sel, iso }, { solo, stageWidth }) {
    const dimFor = ids => (!iso ? 1 : ids.includes(iso) ? 1 : solo ? 0 : 0.12);

    for (const hub of this.sim.hubs) {
      const el = this.els.get(hub.id);
      const on = iso === hub.id;
      const dim = iso && !on ? (solo ? 0 : 0.3) : 1;
      el.classList.toggle("is-lit", hover === hub.id || on);
      el.classList.toggle("is-dimmed", dim === 0.3);
      el.classList.toggle("is-hidden", dim === 0);
    }

    for (const node of this.sim.nodes) {
      const el = this.els.get(node.id);
      const dim = dimFor(node.areas);
      el.classList.toggle("is-hover", hover === node.id);
      el.classList.toggle("is-selected", sel === node.id);
      el.classList.toggle("is-faded", dim === 0.12);
      el.classList.toggle("is-hidden", dim === 0);
      // the wrapper is a zero-size box at the node's point: clamp the card (236px wide,
      // .peek in css/views/graph.css) into the stage instead of centring it blindly
      el.lastElementChild.style.left = Math.max(10, Math.min(stageWidth - 246, node.x - 118)) - node.x + "px";

      for (const id of node.areas) {
        const line = this.edges.get(id + "-" + node.id);
        line.classList.toggle("is-lit", hover === node.id || hover === id || sel === node.id);
        // solo hides the other hubs, so a shared project's edge to one of them goes too
        line.style.setProperty("--dim", solo ? (id === iso ? 1 : 0) : dimFor(node.areas) * (iso && iso !== id ? 0.25 : 1));
      }
    }
  }

  // Every frame: node positions, measured label sizes, and edge endpoints. At startup
  // it runs once with measure = false, so the first frame already shows the seeded
  // layout without taking a pill measurement before the simulation's first step.
  paint({ hover, iso, compact }, frame, measure = true) {
    for (const n of this.sim.all) {
      const el = this.els.get(n.id);
      el.style.left = n.x + "px";
      el.style.top = n.y + "px";
      // re-measure periodically: the label's max-width transition means the first
      // reading after mount is narrower than the pill's true settled width. Compact
      // measures on its own schedule instead, see measure().
      if (measure && !compact && !n.hub && (n.hw === undefined || frame % 45 === 0)) {
        const b = el.firstElementChild.getBoundingClientRect();
        if (b.width > 10) { n.hw = Math.max(n.hw || 0, b.width / 2); n.hh = b.height / 2; }
      }
    }
    const hubs = {};
    for (const hub of this.sim.hubs) hubs[hub.id] = hub;
    for (const n of this.sim.nodes) {
      for (const id of n.areas) {
        const hub = hubs[id];
        const line = this.edges.get(id + "-" + n.id);
        const ex = n.x - hub.x, ey = n.y - hub.y;
        // start the edge at the hub's rim, which grows when the hub is lit
        const rim = (hover === id || iso === id ? 71 : 64) / (Math.hypot(ex, ey) || 1);
        line.setAttribute("x1", hub.x + ex * rim);
        line.setAttribute("y1", hub.y + ey * rim);
        line.setAttribute("x2", n.x);
        line.setAttribute("y2", n.y);
      }
    }
  }

  // Compact's measurement of every pill, which its layout is solved from. It reads layout
  // sizes (offsetWidth ignores the camera's scale) of pills at rest, since a hovered or
  // selected pill draws a larger dot. The List view hides the stage, and a hidden pill
  // has no size, so the stage is shown just for the reading: the browser does not paint
  // between the two writes, so nothing flashes.
  measure() {
    const hidden = this.stage.hidden;
    if (hidden) this.stage.hidden = false;
    for (const n of this.sim.nodes) {
      const el = this.els.get(n.id);
      if (n.hw !== undefined && (el.classList.contains("is-hover") || el.classList.contains("is-selected"))) continue;
      const pill = el.firstElementChild;
      if (pill.offsetWidth > 10) { n.hw = pill.offsetWidth / 2; n.hh = pill.offsetHeight / 2; }
    }
    if (hidden) this.stage.hidden = true;
  }

  setCamera(cam, vp) {
    const tx = vp.x + vp.w / 2 - cam.x * cam.k, ty = vp.y + vp.h / 2 - cam.y * cam.k;
    this.world.style.transform =
      "translate(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px) scale(" + cam.k.toFixed(4) + ")";
  }

  // Only a project detail dims the graph. An area list is read beside its own
  // cluster, so dimming the thing it describes would be self-defeating.
  setDim(amount) {
    this.stage.style.opacity = 1 - amount;
  }
}
