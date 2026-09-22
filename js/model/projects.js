// Project records as the views use them: the generated data with defaults
// filled in, plus the lookups and orderings built on top of it.

import { MEDIA_BASE, PROJECTS as RECORDS } from "../data/projects.js";

export const mediaURL = src => MEDIA_BASE + src;

const normalize = record => ({
  tier: 3, blurb: "", desc: "", tags: [], links: [], media: {}, order: {},
  thumb: null, role: null, event: null, year: null,
  ...record,
  primaryLink: (record.links || []).find(l => l.primary) || null
});

export const PROJECTS = RECORDS.map(normalize);

export const projectById = id => PROJECTS.find(p => p.id === id) || null;

// Position within one area, authored per area because a shared project can sit at
// different places in each of its lists. Unset records fall in behind the ordered
// ones, still in tier order.
export const orderIn = (p, area) => (p.order && p.order[area]) ?? (900 + p.tier);

// Projects in one area, in the order authored on the records for that area.
export const areaItems = area =>
  PROJECTS.filter(p => p.areas.includes(area)).slice().sort((a, b) => orderIn(a, area) - orderIn(b, area));

// "11 projects", and "1 project" for Cybersecurity.
export const projectCount = n => n + (n === 1 ? " project" : " projects");

// Seven projects ship no still image, so their list rows get a tile carrying
// initials instead of an empty well.
export function initials(name) {
  const skip = { of: 1, the: 1, a: 1, and: 1 };
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const big = words.filter(w => !skip[w.toLowerCase()]);
  if (!big.length) return "?";
  if (big.length === 1) return big[0].slice(0, 2).toUpperCase();
  return (big[0][0] + big[1][0]).toUpperCase();
}

// A 174px square cut from the project's first image by content/tools/build_media.py,
// so a 58px row no longer downloads the full-size image.
export const thumbOf = p => (p.thumb ? mediaURL(p.thumb) : null);
