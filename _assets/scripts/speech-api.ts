import { findLanguages, hamburgerMenu, addScrollHandler } from "./common.ts";

document.addEventListener("DOMContentLoaded", () => {
  load();
  findLanguages();
  hamburgerMenu();
  addScrollHandler();
});

function load() {}
