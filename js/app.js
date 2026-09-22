// The controller. Holds the UI state, runs the fixed-step loop (simulation, camera,
// drawer easing), and routes every user action.
//
// State:
//   view     "projects" | "contact"
//   mode     "graph" | "list"          (within projects)
//   iso      the focused area id, or null for the overview
//   sel      the selected project id, or null
//   hover    the hovered node or hub id, or null
//   compact  true below COMPACT_W wide or COMPACT_H tall; read at boot, then re-measured only
//            while the graph shows
//
// setState batches a render into a microtask. Rendering toggles classes and swaps the
// drawer's content; positions and easing are written every tick by paint().

import {
  COMPACT_H, COMPACT_LAYOUT_AREA, COMPACT_LAYOUT_W, COMPACT_W, DRAWER_MAX_W, DRAWER_VW, INITIAL_STAGE, LINK_LENGTH, MOTION, TICK_MS
} from "./config.js";
import { SITE } from "./data/site.js";
import { aimCamera, keepCovered, sheetHeight, viewport } from "./graph/camera.js";
import { Simulation } from "./graph/simulation.js";
import { onPinchOut } from "./lib/pinch.js";
import { AREAS, isArea } from "./model/areas.js";
import { PROJECTS } from "./model/projects.js";
import { ArcsView } from "./views/arcs.js";
import { renderContact } from "./views/contact.js";
import { DrawerView } from "./views/drawer.js";
import { GraphView } from "./views/graph.js";
import { HeaderView } from "./views/header.js";
import { renderList } from "./views/list.js";

const isCompact = () => window.innerWidth < COMPACT_W || window.innerHeight < COMPACT_H;

export class App {
  constructor(root) {
    this.root = root;
    // a phone opens on the List view, a wider screen on the graph
    const compact = isCompact();
    this.state = { view: "projects", mode: compact ? "list" : "graph", iso: null, sel: null, hover: null, compact };
    this.size = { ...INITIAL_STAGE };   // the stage in pixels, as last measured
    this.measured = { w: 0, h: 0 };
    this.stageTop = undefined;
    this.sheetPx = 0;                   // --sheet-height, as last written
    this.open = 0;                     // the drawer's slide, 0 closed to 1 open
    this.cover = 1;                     // how hard keepCovered holds, 0 in an area to 1 outside
    this.swap = 1;                      // the drawer body's cross-fade
    this.renderQueued = false;
  }

  start() {
    const css = document.documentElement.style;
    css.setProperty("--drawer-width", `min(${DRAWER_MAX_W}px, ${DRAWER_VW * 100}vw)`);

    this.stage = this.root.querySelector("[data-stage]");
    this.listView = this.root.querySelector('[data-view="list"]');
    this.contactView = this.root.querySelector('[data-view="contact"]');

    this.header = new HeaderView(this.root, SITE, {
      onProjects: () => this.setState({ view: "projects" }),
      onContact: () => this.setState({ view: "contact", sel: null, iso: null, hover: null }),
      // switching between Graph and List closes whatever the drawer holds
      onGraph: () => this.setState({ mode: "graph", sel: null }),
      onList: () => this.setState({ mode: "list", iso: null, sel: null, hover: null })
    });

    // A phone opens on the List view, which hides the stage until the first Graph tap.
    // The initial HTML still shows it, so measure it now in its compact layout: the
    // simulation then settles at the phone's size rather than re-settling on that tap.
    if (this.state.compact) {
      this.root.toggleAttribute("data-compact", true);
      this.header.update(this.state);
      const r = this.stage.getBoundingClientRect();
      if (r.width >= 40) {
        this.size = { w: r.width, h: r.height };
        this.measured = { w: r.width, h: r.height };
        this.stageTop = r.top;
      }
    }
    this.sizeSheet();

    const layout = this.layout();
    this.sim = new Simulation({
      areas: AREAS, projects: PROJECTS,
      width: layout.w, height: layout.h,
      linkLength: LINK_LENGTH, motion: MOTION, compact: this.state.compact
    });
    this.cam = { x: layout.w / 2, y: layout.h / 2, k: 1 };
    this.camTarget = { ...this.cam };

    this.graph = new GraphView(this.stage, this.sim, {
      onHover: id => this.setState({ hover: id }),
      onHubClick: id => this.toggleArea(id),
      onNodeClick: id => this.toggleProject(id),
      onEmptyClick: () => this.stepUp()
    });
    // Compact solves its layout from the pills' sizes, so take them now, while the stage
    // still shows, and again whenever a web font lands and changes them. Otherwise the
    // first Graph tap would find the sizes changed and rearrange the web in front of you.
    if (this.state.compact) this.graph.measure();
    const refit = () => { if (this.state.compact) this.graph.measure(); };
    if (document.fonts) {
      document.fonts.ready.then(refit);
      document.fonts.addEventListener("loadingdone", refit);
    }
    this.arcs = new ArcsView(this.root, { onStep: id => this.setArea(id) });
    this.drawer = new DrawerView(this.root, {
      onClose: () => this.stepUp(),
      onExitArea: () => this.exitArea(),
      onOpenProject: id => this.setState({ sel: id }),
      // a click through the scrim onto a node behaves exactly as a click on the node;
      // empty space steps up one level
      onScrimClick: id => (!id ? this.stepUp() : isArea(id) ? this.toggleArea(id) : this.toggleProject(id))
    });
    renderList(this.listView, { onOpenProject: id => this.setState({ sel: id }) });
    renderContact(this.contactView, SITE);

    this.render();
    this.graph.paint(this.state, this.sim.frame, false);
    window.addEventListener("resize", this.measure);
    document.addEventListener("keydown", e => { if (e.key === "Escape") this.stepUp(); });
    // compact zooms out of an area by pinching; the sheet scrolls instead
    onPinchOut(this.root, {
      when: () => {
        const st = this.state;
        return st.compact && st.view === "projects" && st.mode === "graph" && !!st.iso && !st.sel;
      },
      ignore: "[data-panel]",
      onOut: () => this.exitArea()
    });
    setInterval(() => this.tick(), TICK_MS);
  }

  setState(patch) {
    this.state = { ...this.state, ...patch };
    if (this.renderQueued) return;
    this.renderQueued = true;
    queueMicrotask(() => {
      this.renderQueued = false;
      this.render();
    });
  }

  // ---- Actions ------------------------------------------------------------

  setArea(id) {
    if (this.state.iso === id) return;
    if (this.open > 0.2) this.swap = 0.25;
    this.setState({ iso: id, sel: null });
  }

  // One level up, whatever asked for it: a project closes back to its area list, and
  // only then does the area release to the overview. The drawer's close button, the
  // area's hub, a click on empty space and Escape all come through here, so they can
  // never disagree.
  stepUp() {
    if (this.state.sel) return this.setState({ sel: null });
    if (this.state.iso) this.setState({ iso: null });
  }

  exitArea() {
    this.setState({ iso: null, sel: null });
  }

  // Clicking the area you are already in steps up; clicking a different one switches to it.
  toggleArea(id) {
    if (this.state.iso !== id) return this.setArea(id);
    this.stepUp();
  }

  toggleProject(id) {
    this.setState({ sel: this.state.sel === id ? null : id });
  }

  // ---- Loop ---------------------------------------------------------------

  measure = () => {
    const r = this.stage.getBoundingClientRect();
    // the stage is hidden on the List and Contact views, where its last measure stands
    if (r.width >= 40) {
      const compact = isCompact();
      const changed = Math.abs(r.width - this.measured.w) > 1.5 || Math.abs(r.height - this.measured.h) > 1.5;
      this.measured = { w: r.width, h: r.height };
      this.size = { w: r.width, h: r.height };
      this.stageTop = r.top;
      if (changed || compact !== this.state.compact) {
        if (changed) this.sim.resetAnchors();
        this.setState({ compact });
        this.sim.compact = compact;
      }
      // the stage shows, so this reading needs none of GraphView#measure's hide-and-show
      if (compact) this.graph.measure();
    }
    // a project opened from the List view shows the sheet too, so this runs regardless
    this.sizeSheet();
  };

  sizeSheet() {
    const px = Math.round(sheetHeight(this.stageTop));
    if (px === this.sheetPx) return;
    this.sheetPx = px;
    document.documentElement.style.setProperty("--sheet-height", px + "px");
  }

  // The canvas the simulation lays the web out on, in stage pixels. Desktop uses the
  // stage itself. Compact scales the stage up to COMPACT_LAYOUT_W wide and
  // COMPACT_LAYOUT_AREA in area, keeping its shape, so the projects have room; the camera
  // shows as much of it as fits.
  layout() {
    const { w, h } = this.size;
    const s = this.state.compact ? Math.max(1, COMPACT_LAYOUT_W / w, Math.sqrt(COMPACT_LAYOUT_AREA / (w * h))) : 1;
    return { w: w * s, h: h * s };
  }

  viewport() {
    return viewport({ ...this.size, compact: this.state.compact, open: this.open, stageTop: this.stageTop });
  }

  tick() {
    const sim = this.sim;
    if (sim.frame % 30 === 0) this.measure();
    const st = this.state;
    // the drawer is open for a project detail and for an area list alike
    const target = st.sel || st.iso ? 1 : 0;
    this.open += (target - this.open) * 0.18;
    if (Math.abs(this.open - target) < 0.002) this.open = target;

    const layout = this.layout();
    const area = st.mode === "graph" ? st.iso : null;
    aimCamera(this.camTarget, {
      sim, ...layout, vp: this.viewport(), area, compact: st.compact
    });
    for (const key of ["x", "y", "k"]) {
      this.cam[key] += (this.camTarget[key] - this.cam[key]) * 0.09;
      if (Math.abs(this.camTarget[key] - this.cam[key]) < 0.004) this.cam[key] = this.camTarget[key];
    }
    // An open area is centred beside the drawer, so the clamp lets go of it. It eases
    // back in at the camera's rate on the way out: switched straight back on, it would
    // throw a camera still zooming out of Cybersecurity 160px in a single frame.
    const cover = area ? 0 : 1;
    this.cover += (cover - this.cover) * 0.09;
    if (Math.abs(cover - this.cover) < 0.002) this.cover = cover;
    // after easing, never before: see keepCovered
    keepCovered(this.cam, { ...this.size, vp: this.viewport(), compact: st.compact, strength: this.cover });
    // the drawer body dips and recovers when the area changes underneath it, so stepping
    // with the arcs reads as the contents swapping rather than the drawer re-opening
    this.swap += (1 - this.swap) * 0.14;

    sim.step(layout.w, layout.h, new Set([st.hover, st.sel, st.iso].filter(Boolean)));
    sim.frame++;
    this.paint();
  }

  // Direct DOM writes every tick: re-rendering 27 nodes and their edges at 60Hz
  // would cost far more than a frame.
  paint() {
    const st = this.state;
    const vp = this.viewport();
    this.graph.paint(st, this.sim.frame);
    this.graph.setCamera(this.cam, vp);
    this.drawer.paint({ compact: st.compact, open: this.open, swap: this.swap });
    this.graph.setDim(st.sel ? this.open * 0.18 : 0);
    this.arcs.paint({ compact: st.compact, open: this.open, stageTop: this.stageTop, vp });
  }

  render() {
    const st = this.state;
    const onProjects = st.view === "projects";
    this.root.toggleAttribute("data-compact", st.compact);
    this.header.update(st);
    this.stage.hidden = !(onProjects && st.mode === "graph");
    this.listView.hidden = !(onProjects && st.mode === "list");
    this.contactView.hidden = !(st.view === "contact");
    // on compact inside an area the band above the sheet shows that area's hub alone
    this.graph.update(st, { solo: st.compact && !!st.iso, stageWidth: this.size.w });
    this.graph.setDim(st.sel ? this.open * 0.18 : 0);
    this.arcs.update(st, { open: this.open });
    this.drawer.update(st, { open: this.open, swap: this.swap });
  }
}
