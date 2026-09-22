import { App } from "./app.js";

const app = new App(document.querySelector("[data-app]"));
app.start();

// A handle for inspecting and driving the page from the console, e.g.
// portfolio.setState({ iso: "games", sel: null })
window.portfolio = app;
