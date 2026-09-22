# Grant Benson: Computer Science Portfolio

An interactive portfolio that lays out Grant Benson's projects as a force-directed graph across
three areas: AI/ML, Games/Simulations and Cybersecurity. Choose an area to zoom in, open a project
for its write-up, media and links, or switch to the List view. The Contact page has the bio and the
resume.

**Live site:** <https://gjgamejam.github.io/Portfolio/>

## How it is built

- **No framework and no build step:** plain HTML, CSS and ES modules, served as they are.
- **The graph** is a small force simulation (`js/graph/simulation.js`) that settles each project
  around its area's hub. `js/graph/camera.js` frames an area beside the project drawer and eases
  the zoom. A fixed 16ms loop steps the simulation and repaints only what moves.
- **On phones** the page opens on the List view. The graph's layout is solved once per screen size
  instead of simulated (`js/graph/compact-layout.js`: a cell per area, then a Lloyd relaxation that
  spreads the projects through it), and pinching out returns to the overview.
- **Styling** comes from design tokens (`css/tokens.css`, `css/theme.css`) and BEM class names. A
  `data-tone` attribute gives each area its colour.
- **The project data** in `js/data/` is generated from structured content records by a tool kept
  outside this repository, which is why its header comments name files that are not here.

## Run it locally

```bash
npx http-server -p 8765 -c-1    # from the repository root
```

Then open <http://127.0.0.1:8765/>. It has to be served over HTTP: browsers block ES modules on
pages opened straight from disk (`file://`), so only the header would render.

## Layout

```
index.html                  the page shell
css/                        tokens and theme, then components, layout and one file per view
js/
  main.js, app.js           entry point and controller (state, the 16ms loop, rendering)
  config.js                 every tuning number: breakpoints, zoom, drawer size, motion
  data/                     generated project and site data
  model/                    areas and projects: lookups and ordering
  graph/                    the simulation, the phone layout and the camera
  views/                    one module per piece of UI
  lib/                      an escaping HTML template and the pinch-out gesture
assets/flocking/            the live flocking demo shown in its project panel
media/                      the images, videos and list thumbnails the site shows
Grant-Benson-Resume.pdf     the resume linked from the Contact page
```

## License

The code is released under the MIT License (see `LICENSE`). The images, videos, resume and written
content are not covered by that license: they remain © Grant Benson, all rights reserved.
