// The page header: heading and subtitle for the current view, the Projects/Contact
// tabs and the Graph/List toggle.

export class HeaderView {
  constructor(root, site, { onProjects, onContact, onGraph, onList }) {
    this.site = site;
    this.heading = root.querySelector('[data-site="heading"]');
    this.subtitle = root.querySelector('[data-site="subtitle"]');
    this.modeToggle = root.querySelector("[data-mode-toggle]");
    this.buttons = {};
    const actions = { "show-projects": onProjects, "show-contact": onContact, "mode-graph": onGraph, "mode-list": onList };
    for (const [action, handler] of Object.entries(actions)) {
      const el = root.querySelector(`[data-action="${action}"]`);
      el.addEventListener("click", handler);
      this.buttons[action] = el;
    }
  }

  update({ view, mode, compact }) {
    const contact = view === "contact";
    const copy = contact ? this.site.contactHeader : this.site.header;
    if (this.heading.textContent !== copy.heading) this.heading.textContent = copy.heading;
    if (this.subtitle.textContent !== copy.subtitle) this.subtitle.textContent = copy.subtitle;
    // A phone needs the height for the hub above the sheet, and there the hub and the
    // sheet's heading already say where you are. Contact scrolls, so it keeps its line.
    this.subtitle.hidden = compact && !contact;

    this.buttons["show-projects"].classList.toggle("is-active", !contact);
    this.buttons["show-contact"].classList.toggle("is-active", contact);
    this.modeToggle.hidden = contact;
    this.buttons["mode-graph"].classList.toggle("is-active", mode === "graph");
    this.buttons["mode-list"].classList.toggle("is-active", mode === "list");
  }
}
