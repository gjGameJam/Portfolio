// The three areas the graph is organised around. Their colors live in
// css/theme.css (--area-*), keyed by id through data-tone.

export const AREAS = [
  { id: "ai", name: "AI/ML" },
  { id: "games", name: "Games/Simulations" },
  { id: "cyber", name: "Cybersecurity" }
];

export const areaById = id => AREAS.find(a => a.id === id);

export const isArea = id => AREAS.some(a => a.id === id);

// "AI/ML + Games/Simulations"
export const areaLabel = ids => ids.map(id => areaById(id).name).join(" + ");

// The tone a project is drawn in: its area's color, or the shared accent when it
// belongs to more than one area.
export const toneOf = ids => (ids.length > 1 ? "shared" : ids[0]);
