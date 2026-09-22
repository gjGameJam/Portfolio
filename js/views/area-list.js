// Drawer content: one area's projects, in the order authored for that area.

import { html } from "../lib/html.js";
import { initials, projectCount, thumbOf } from "../model/projects.js";

const rowTemplate = p => {
  const thumb = thumbOf(p);
  return html`<button class="area-row" type="button" data-node="${p.id}">
    <span class="area-row__thumb">${thumb
      ? html`<img class="area-row__img" src="${thumb}" alt="" loading="lazy">`
      : html`<span class="area-row__initials">${initials(p.name)}</span>`}</span>
    <span class="area-row__text">
      <span class="area-row__name">${p.name}</span>
      <span class="area-row__blurb">${p.blurb}</span>
      ${p.tags.length > 0 && html`<span class="area-row__tags">${p.tags.slice(0, 3).map(t => html`<span class="mini-tag">${t}</span>`)}</span>`}
    </span>
  </button>`;
};

export const areaListTemplate = (area, projects) => html`<div class="area-list" data-tone="${area.id}">
  <div class="drawer__bar">
    <span class="chip chip--count">${projectCount(projects.length)}</span>
    <button class="icon-button" type="button" data-action="exit-area" aria-label="Back to all areas">✕</button>
  </div>
  <h2 class="area-list__title">${area.name}</h2>
  <div class="area-list__items">${projects.map(rowTemplate)}</div>
</div>`;
