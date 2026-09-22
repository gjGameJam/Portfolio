// Drawer content: one project's detail.

import { html } from "../lib/html.js";
import { areaById, areaLabel, toneOf } from "../model/areas.js";
import { mediaURL } from "../model/projects.js";

const externalLink = (link, cls) =>
  html`<a class="btn ${cls}" href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>`;

const caption = text => text && html`<figcaption class="caption">${text}</figcaption>`;

// The file's pixel size, which the browser turns into an aspect ratio, so a gallery
// holds its layout while images load. CSS keeps the width at 100% and the height auto.
const sizeAttrs = m => m.width && m.height && html` width="${m.width}" height="${m.height}"`;

// Media slots, in display order: the live embed, then videos, then the gallery.
function mediaTemplate(p) {
  const { embed, videos = [], images = [] } = p.media || {};
  return html`
    ${embed && html`<div class="project__media project__media--embed">
      <span class="eyebrow">Live demo</span>
      <iframe class="media-frame media-frame--embed" src="${embed.src}" title="${p.name} live demo" loading="lazy" style="height: ${embed.height}px"></iframe>
    </div>`}
    ${videos.length > 0 && html`<div class="project__media">
      <span class="eyebrow">${videos.length > 1 ? "Videos" : "Video"}</span>
      ${videos.map(v => html`<figure class="project__figure">
        <video class="media-frame" src="${mediaURL(v.src)}"${sizeAttrs(v)}${v.poster && html` poster="${mediaURL(v.poster)}"`} controls loop muted playsinline preload="metadata"></video>
        ${caption(v.caption)}
      </figure>`)}
    </div>`}
    ${images.length > 0 && html`<div class="project__media">
      <span class="eyebrow">${images.length > 1 ? "Gallery" : "Image"}</span>
      ${images.map(im => html`<figure class="project__figure">
        <img class="media-frame" src="${mediaURL(im.src)}"${sizeAttrs(im)} alt="${im.caption || p.name}" loading="lazy">
        ${caption(im.caption)}
      </figure>`)}
    </div>`}`;
}

export const projectTemplate = p => html`<div class="project">
  <div class="drawer__bar">
    <span class="chip chip--area" data-tone="${toneOf(p.areas)}">${areaLabel(p.areas)}</span>
    <button class="icon-button" type="button" data-action="close">✕</button>
  </div>
  <div class="project__intro">
    <h2 class="project__title">${p.name}</h2>
    ${p.role && html`<span class="project__role">${p.role}</span>`}
    ${p.desc
      ? html`<p class="project__desc">${p.desc}</p>`
      : html`<p class="project__pending">One-line description pending.</p>`}
  </div>
  ${p.tags.length > 0 && html`<div class="project__tags">${p.tags.map(t => html`<span class="tag tag-accent-2">${t}</span>`)}</div>`}
  ${p.links.length > 0 && html`<div class="project__actions">
    ${p.primaryLink && externalLink(p.primaryLink, "btn-primary")}
    ${p.links.filter(l => !l.primary).map(l => externalLink(l, "btn-secondary"))}
  </div>`}
  ${mediaTemplate(p)}
  ${p.areas.length > 1 && html`<div class="project__areas">
    <span class="eyebrow">Connected areas</span>
    <div class="project__area-pills">${p.areas.map(id => html`<span class="chip chip--pill" data-tone="${id}">${areaById(id).name}</span>`)}</div>
  </div>`}
</div>`;
