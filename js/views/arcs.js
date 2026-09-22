// The arc controls at the stage's left and right edges, which step the graph
// between areas, wrapping. Each is toned for the area it moves into.

import { AREAS } from "../model/areas.js";
import { drawerWidth } from "../graph/camera.js";

export class ArcsView {
  constructor(root, { onStep }) {
    this.left = root.querySelector('[data-arc="left"]');
    this.right = root.querySelector('[data-arc="right"]');
    for (const el of [this.left, this.right]) {
      el.addEventListener("click", e => {
        e.stopPropagation();
        onStep(el.dataset.tone);
      });
    }
  }

  update({ iso, view, mode, compact }, { open }) {
    const here = Math.max(0, AREAS.findIndex(a => a.id === iso));
    // the arcs move the graph's camera, so they only exist on the graph, once an area is focused
    const shown = view === "projects" && mode === "graph" && !!iso;
    const targets = [
      [this.left, AREAS[(here - 1 + AREAS.length) % AREAS.length], "Previous area: "],
      [this.right, AREAS[(here + 1) % AREAS.length], "Next area: "]
    ];
    for (const [el, to, verb] of targets) {
      el.dataset.tone = to.id;
      el.setAttribute("aria-label", verb + to.name);
      el.title = verb + to.name;
      el.classList.toggle("is-shown", shown);
    }
    this.right.style.right = (compact ? 0 : open * drawerWidth()) + "px";
  }

  // Every frame: the right arc rides inboard of the desktop drawer, and both centre on
  // the band of stage the graph actually occupies (above the sheet, on compact).
  paint({ compact, open, stageTop, vp }) {
    this.right.style.right = (compact ? 0 : open * drawerWidth()) + "px";
    if (stageTop === undefined) return;
    // 74 is half the arc's 148px height (.arc in css/views/arcs.css)
    const mid = stageTop + vp.y + vp.h / 2 - 74;
    for (const el of [this.left, this.right]) {
      el.style.top = mid.toFixed(1) + "px";
      el.style.marginTop = "0px";
    }
  }
}
