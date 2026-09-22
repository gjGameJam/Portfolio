// The drawer and its scrim. One drawer, two contents: a project's detail when one is
// selected, otherwise the focused area's project list. Closing a project falls back
// to the list underneath rather than dismissing the drawer outright.

import { areaById } from "../model/areas.js";
import { areaItems, projectById } from "../model/projects.js";
import { areaListTemplate } from "./area-list.js";
import { projectTemplate } from "./project.js";

export class DrawerView {
  constructor(root, { onClose, onExitArea, onOpenProject, onScrimClick }) {
    this.scrim = root.querySelector("[data-scrim]");
    this.panel = root.querySelector("[data-panel]");
    this.body = root.querySelector("[data-panel-body]");
    this.contentKey = "";

    this.body.addEventListener("click", e => {
      const action = e.target.closest("[data-action]");
      if (action && action.dataset.action === "close") return onClose();
      if (action && action.dataset.action === "exit-area") return onExitArea();
      const row = e.target.closest("button[data-node]");
      if (row) onOpenProject(row.dataset.node);
    });

    // The scrim covers the graph so a click anywhere outside the drawer dismisses it,
    // which also means it swallows clicks meant for the nodes underneath. Look through
    // it: report the topmost node under the pointer, or null for empty space.
    this.scrim.addEventListener("click", e => {
      const hit = document.elementsFromPoint(e.clientX, e.clientY)
        .map(el => el.closest && el.closest("[data-node]"))
        .find(Boolean);
      onScrimClick(hit ? hit.dataset.node : null);
    });
  }

  update({ sel, iso, compact }, { open, swap }) {
    this.scrim.classList.toggle("is-active", !!(sel || iso));

    const project = sel ? projectById(sel) : null;
    const area = iso && !sel ? areaById(iso) : null;
    const key = project ? "project:" + project.id : area ? "area:" + area.id : "";
    if (key !== this.contentKey) {
      this.contentKey = key;
      this.body.innerHTML = project
        ? projectTemplate(project)
        : area ? areaListTemplate(area, areaItems(area.id)) : "";
    }
    this.paint({ compact, open, swap });
  }

  // Every frame: the slide, the scrim's fade, and the body's cross-fade when the
  // area changes underneath an open drawer.
  paint({ compact, open, swap }) {
    const off = ((1 - open) * 104).toFixed(2);
    // compact shows the drawer as a bottom sheet, so it leaves along the other axis
    this.panel.style.transform = compact ? "translateY(" + off + "%)" : "translateX(" + off + "%)";
    this.body.style.opacity = swap.toFixed(3);
    this.scrim.style.opacity = open;
  }
}
