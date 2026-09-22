// The Contact view: portrait, About text, email, link buttons and footer.
// Static once rendered.

import { html } from "../lib/html.js";
import { mediaURL } from "../model/projects.js";

export function renderContact(container, { about, contact }) {
  container.innerHTML = html`<div class="contact">
    <img class="contact__portrait" src="${mediaURL(about.portrait.src)}" alt="${about.portrait.alt}">
    <div class="contact__body">
      <div class="contact__bio">${about.paragraphs.map(p => html`<p class="contact__paragraph">${p}</p>`)}</div>
      <div class="contact__card">
        <div class="contact__email">
          <span class="eyebrow">Email</span>
          <a class="contact__email-link" href="${contact.emailHref}">${contact.emailLabel}</a>
        </div>
      </div>
      <div class="contact__links">${contact.buttons.map((b, i) =>
        html`<a class="btn ${i === 0 ? "btn-primary" : "btn-secondary"}" href="${b.url}" target="_blank" rel="noreferrer">${b.label}</a>`)}</div>
      <p class="contact__footer">${about.footer}</p>
    </div>
  </div>`;
}
