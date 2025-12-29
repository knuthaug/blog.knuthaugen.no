import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals/attribution";
import { Vitals } from "./types";
import { writeINP, writeVitals, writeHit } from "./influx";
import {
  addScrollHandler,
  findLanguages,
  getIcon,
  hamburgerClickHandler,
  hamburgerMenu,
} from "./common.ts";

// Configuration constants
const modeLocalStorageKey = "blog.knuthaugen.no.mode";
const WEB_VITALS_REPORT_DELAY_MS = 2500;
const MODE_TRANSITION_DURATION_HIDE = "350ms";
const MODE_TRANSITION_DURATION_SHOW = "350ms";
const PAGE_TRANSITION_DURATION_HIDE = "250ms";
const PAGE_TRANSITION_DURATION_SHOW = "250ms";
const MIN_HEADINGS_FOR_TOC = 6;
const TOC_OBSERVER_ROOT_MARGIN = "10px";
const TOC_OBSERVER_THRESHOLD = 1.0;
const TOC_ROW_HEIGHT_PX = 26;

// Cached DOM element references
let htmlElement: HTMLElement | null = null;
let bodyElement: HTMLElement | null = null;
let darkModeIcon: HTMLElement | null = null;
let darkModeMobileIcon: HTMLElement | null = null;
let darkModeFooterIcon: HTMLElement | null = null;
let bigMenuElement: HTMLElement | null = null;
let tocElement: HTMLElement | null = null;

// Initialize cached elements
function initCachedElements(): void {
  htmlElement = document.querySelector("html");
  bodyElement = document.querySelector("body");
  darkModeIcon = document.querySelector("#dark-mode");
  darkModeMobileIcon = document.querySelector("#dark-mode-mobile");
  darkModeFooterIcon = document.querySelector("#dark-mode-footer");
  bigMenuElement = document.getElementById("big-menu");
  tocElement = document.querySelector("#toc");
}

document.addEventListener("DOMContentLoaded", () => {
  load();
  hit();
});

function load(): void {
  initCachedElements();
  addWebVitals();
  darkMode();
  addClickHandlers();
  addKeyHandlers();
  addScrollHandler();
  //addPageEventHandlers();
  hamburgerMenu();
  findLanguages();
  initTOC();
}

function hit(): void {
  writeHit();
}

function addWebVitals(): void {
  const values: Vitals = {
    cls: "",
    ttfb: "",
    inp: "",
    lcp: "",
    fcp: "",
  };

  onLCP(
    ({ value, rating, attribution }) => {
      values.lcp = `${Math.round(value)}`;
      console.log(
        "LCP time: ",
        Math.round(value),
        "rating:",
        rating,
        attribution,
      );
    },
    { reportAllChanges: true },
  );

  onFCP(
    ({ value, rating, attribution }) => {
      values.fcp = `${Math.round(value)}`;
      console.log(
        "FCP time",
        Math.round(value),
        "rating:",
        rating,
        attribution,
      );
    },
    { reportAllChanges: true },
  );

  onINP(
    ({ value, rating, attribution }) => {
      writeINP(value);
      console.log(
        "INP time",
        Math.round(value),
        "rating:",
        rating,
        attribution,
      );
    },
    { reportAllChanges: true },
  );

  onCLS(
    ({ value, rating }) => {
      values.cls = `${value}`;
      console.log("CLS value", value, "rating:", rating);
    },
    { reportAllChanges: true },
  );

  onTTFB(
    ({ value, rating, attribution }) => {
      values.ttfb = `${Math.round(value)}`;
      console.log(
        "TTFB time",
        Math.round(value),
        "rating:",
        rating,
        attribution,
      );
    },
    { reportAllChanges: true },
  );

  setTimeout(() => {
    console.log("Web Vitals", values);
    writeVitals(values);
  }, WEB_VITALS_REPORT_DELAY_MS);
}

function darkMode(): void {
  const mode = localStorage.getItem(modeLocalStorageKey);

  if (mode) {
    setMode(mode);
  } else {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      setMode("light");
    } else {
      setMode("dark");
    }
  }

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      setMode(event.matches ? "dark" : "light");
    });

  darkModeIcon?.parentElement?.addEventListener("click", darkModeClickHandler);
  darkModeMobileIcon?.addEventListener("click", darkModeClickHandler);
  darkModeFooterIcon?.addEventListener("click", darkModeClickHandler);
}

async function darkModeClickHandler(_event: Event): Promise<void> {
  const hideProp = "--mode-animation-duration-hide";
  const showProp = "--mode-animation-duration-show";
  const currentMode = localStorage.getItem(modeLocalStorageKey);

  if (!bodyElement) return;

  if (currentMode === "dark") {
    if (!document.startViewTransition) {
      setMode("light");
    } else {
      setProperty(bodyElement, hideProp, MODE_TRANSITION_DURATION_HIDE);
      setProperty(bodyElement, showProp, MODE_TRANSITION_DURATION_SHOW);
      const trans = document.startViewTransition(() => setMode("light"));
      await trans.finished;
      setProperty(bodyElement, hideProp, PAGE_TRANSITION_DURATION_HIDE);
      setProperty(bodyElement, showProp, PAGE_TRANSITION_DURATION_SHOW);
    }
  } else {
    if (!document.startViewTransition) {
      setMode("dark");
    } else {
      setProperty(bodyElement, hideProp, MODE_TRANSITION_DURATION_HIDE);
      setProperty(bodyElement, showProp, MODE_TRANSITION_DURATION_SHOW);
      const trans = document.startViewTransition(() => setMode("dark"));
      await trans.finished;
      setProperty(bodyElement, hideProp, PAGE_TRANSITION_DURATION_HIDE);
      setProperty(bodyElement, showProp, PAGE_TRANSITION_DURATION_SHOW);
    }
  }
}

function setProperty(
  element: HTMLElement,
  property: string,
  value: string,
): void {
  element.style.setProperty(property, value);
}

function setMode(mode: string): void {
  if (!htmlElement) return;

  if (mode === "dark") {
    localStorage.setItem(modeLocalStorageKey, mode);
    htmlElement.classList.remove("light");
    htmlElement.classList.add(mode);

    if (darkModeIcon && darkModeIcon.parentElement) {
      darkModeIcon.parentElement.ariaLabel = "Switch to light mode";
      darkModeIcon.parentElement.title =
        "May the light be with you and illuminate your path";
      darkModeIcon.parentElement.innerHTML = getIcon("sun-moon", "dark-mode");
    }

    if (darkModeMobileIcon) {
      darkModeMobileIcon.ariaLabel = "Switch to light mode";
      darkModeMobileIcon.title = "May the light be with you and illuminate your path";
      darkModeMobileIcon.innerHTML = `${getIcon(
        "sun-moon",
        "dark-mode-mobile",
      )} Light Mode`;
    }

    if (darkModeFooterIcon && darkModeFooterIcon.parentElement) {
      darkModeFooterIcon.parentElement.ariaLabel = "Switch to light mode";
      darkModeFooterIcon.parentElement.title =
        "May the light be with you and illuminate your path";
      darkModeFooterIcon.innerHTML = `${getIcon("sun-moon", "dark-mode-footer")}`;
    }
  } else {
    localStorage.setItem(modeLocalStorageKey, mode);
    htmlElement.classList.remove("dark");
    htmlElement.classList.add(mode);

    if (darkModeIcon && darkModeIcon.parentElement) {
      darkModeIcon.parentElement.ariaLabel = "Switch to dark mode";
      darkModeIcon.parentElement.title = "Enter the dark realm my lovelies";
      darkModeIcon.parentElement.innerHTML = getIcon("moon", "dark-mode");
      darkModeIcon.id = "dark-mode";
    }

    if (darkModeMobileIcon) {
      darkModeMobileIcon.ariaLabel = "Switch to dark mode";
      darkModeMobileIcon.title = "Enter the dark realm my lovelies";
      darkModeMobileIcon.innerHTML = `${getIcon("moon", "dark-mode-mobile")} Dark mode`;
    }

    if (darkModeFooterIcon && darkModeFooterIcon.parentElement) {
      darkModeFooterIcon.parentElement.ariaLabel = "Switch to dark mode";
      darkModeFooterIcon.parentElement.title = "Enter the dark realm my lovelies";
      darkModeFooterIcon.innerHTML = `${getIcon("moon", "dark-mode-footer")}`;
    }
  }
}

function addKeyHandlers(): void {
  window.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
      if (!bigMenuElement) return;
      bigMenuElement.removeAttribute("open");
      hamburgerClickHandler();
    }
  });
}

function addClickHandlers(): void {
  // click handler for closing the details when clicking outside it
  window.addEventListener("click", (event) => {
    if ((event.target as HTMLElement)?.nodeName === "a") {
      return;
    }

    if (bigMenuElement) {
      bigMenuElement.removeAttribute("open");
    }
    if (document.querySelector("#mobile-menu")?.classList.contains("active")) {
      hamburgerClickHandler();
    }
  });

  document.querySelectorAll("summary").forEach((element) => {
    element.addEventListener("click", (event) => {
      const detailsElement = (event.target as HTMLElement).parentElement
        ?.parentElement;

      if (!detailsElement) {
        return;
      }

      const contentElement = detailsElement.querySelector("ul");
      if (!contentElement) {
        return;
      }
      if (contentElement.classList.contains("animation")) {
        contentElement.classList.remove("animation", "collapsing");
        void element.offsetWidth;
        return;
      }

      const onAnimationEnd = (cb: EventListener) =>
        contentElement.addEventListener("animationend", cb, { once: true });

      // request an animation frame to force Safari 16 to actually perform the animation
      requestAnimationFrame(() => contentElement.classList.add("animation"));
      onAnimationEnd(() => contentElement.classList.remove("animation"));

      const isDetailsOpen = detailsElement.getAttribute("open") !== null;
      if (isDetailsOpen) {
        // prevent default collapsing and delay it until the animation has completed
        event.preventDefault();
        contentElement.classList.add("collapsing");
        onAnimationEnd(() => {
          detailsElement.removeAttribute("open");
          contentElement.classList.remove("collapsing");
        });
      }
    });
  });
}

function initTOC(): void {
  const headings = Array.from(document.querySelectorAll("h3"));
  if (!tocElement) return;
  
  if (headings.length >= MIN_HEADINGS_FOR_TOC) {
    for (let i = 0; i < headings.length; i++) {
      tocElement.appendChild(createElementTocLink(headings[i], `${i + 1}`));
    }
    tocElement.classList.remove("opacity-0");
    if (bodyElement) {
      bodyElement.classList.add("has-toc");
    }
  } else {
    tocElement.remove();
    return;
  }

  // Intersection Observer Options
  var options = {
    root: null,
    rootMargin: TOC_OBSERVER_ROOT_MARGIN,
    threshold: TOC_OBSERVER_THRESHOLD,
  };
  var observeHtags = new IntersectionObserver(setCurrent, options);

  headings.forEach((tag) => {
    observeHtags.observe(tag);
  });
}

// intersectiobserver callback
function setCurrent(entries: IntersectionObserverEntry[]): void {
  if (!tocElement) return;
  const bar = tocElement.querySelector(".bar") as HTMLElement;
  if (!bar) return;

  for (const entry of entries) {
    if (entry.isIntersecting === true) {
      const firstChild = entry.target.firstElementChild;
      if (!firstChild) return;
      
      const current = tocElement.querySelector(
        `a[href="#${firstChild.getAttribute("name")}"]`,
      );
      if (!current) return;

      const row = current.getAttribute("data-row");
      if (!row) return;
      
      bar.setAttribute("data-row", Number(row).toString());

      if (Number(row) !== 1) {
        bar.style.setProperty("top", `calc(${Number(row) - 1} * ${TOC_ROW_HEIGHT_PX}px)`);
      } else {
        bar.style.setProperty("top", `0px`);
      }
      return;
    }
  }
}

function createElementTocLink(el: HTMLElement, num: string) {
  const a = document.createElement("a");
  a.classList.add("toc-link");
  a.setAttribute("data-row", num);
  if (el.firstElementChild) {
    a.href = `#${(el.firstElementChild as HTMLAnchorElement).name}`;
    a.appendChild(document.createTextNode(el.firstElementChild.innerHTML));
  }
  return a;
}
