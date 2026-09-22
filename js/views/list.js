// The List view: each area's projects as a column of rows. Static once rendered.

import { html } from "../lib/html.js";
import { AREAS, areaLabel } from "../model/areas.js";
import { areaItems, projectCount } from "../model/projects.js";

const rowTemplate = (p, area) => html`<button class="list-row list-row--tier${p.tier}" type="button" data-node="${p.id}">
  <span>${p.name}</span>
  <span class="list-row__also">${p.areas.length > 1 ? "also " + areaLabel(p.areas.filter(id => id !== area)) : ""}</span>
</button>`;

const groupTemplate = area => html`<div class="list-group" data-tone="${area.id}">
  <div class="list-group__head">
    <h2 class="list-group__name">${area.name}</h2>
    <span class="list-group__count">${projectCount(areaItems(area.id).length)}</span>
  </div>
  <div class="list-group__items">${areaItems(area.id).map(p => rowTemplate(p, area.id))}</div>
</div>`;

export function renderList(container, { onOpenProject }) {
  container.innerHTML = html`${AREAS.map(groupTemplate)}`;
  container.addEventListener("click", e => {
    const row = e.target.closest("button[data-node]");
    if (row) onOpenProject(row.dataset.node);
  });
}
