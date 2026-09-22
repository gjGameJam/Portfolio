// A tagged template for building markup from data. Interpolated values are
// escaped unless they are themselves html`` results, arrays of them, or empty
// (null, undefined and false render nothing).
//
//   html`<p class="caption">${caption}</p>`
//
// Array items are separated by a newline, so adjacent elements keep a text
// boundary: a row's accessible name reads "C# Unity", not "C#Unity". Only
// interpolate arrays where whitespace between items does not render (flex, grid
// or block containers), never inside running text.

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

class SafeHTML {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

export const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ESCAPES[ch]);

function stringify(value) {
  if (value == null || value === false) return "";
  if (value instanceof SafeHTML) return value.value;
  if (Array.isArray(value)) return value.map(stringify).join("\n");
  return escapeHTML(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += stringify(values[i]) + strings[i + 1];
  return new SafeHTML(out);
}
