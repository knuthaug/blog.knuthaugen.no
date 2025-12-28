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
const modeLocalStorageKey = "blog.knuthaugen.no.mode";

document.addEventListener("DOMContentLoaded", () => {
  load();
  hit();
});

function load(): void {
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
  }, 2500);
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

  const icon = document.querySelector("#dark-mode");
  const mobileIcon = document.querySelector("#dark-mode-mobile");
  const footerIcon = document.querySelector("#dark-mode-footer");

  icon?.parentElement?.addEventListener("click", darkModeClickHandler);
  mobileIcon?.addEventListener("click", darkModeClickHandler);
  footerIcon?.addEventListener("click", darkModeClickHandler);
}

async function darkModeClickHandler(_event: Event): Promise<void> {
  const hideProp = "--mode-animation-duration-hide";
  const showProp = "--mode-animation-duration-show";
  const modetransitionDurationHide = "350ms";
  const modeTransitionDurationShow = "350ms";

  const pageTransitionDurationHide = "250ms";
  const pageTransitionDurationShow = "250ms";
  const currentMode = localStorage.getItem(modeLocalStorageKey);

  const body = document.querySelector("body")!;

  if (currentMode === "dark") {
    if (!document.startViewTransition) {
      setMode("light");
    } else {
      setProperty(body, hideProp, modetransitionDurationHide);
      setProperty(body, showProp, modeTransitionDurationShow);
      const trans = document.startViewTransition(() => setMode("light"));
      await trans.finished;
      setProperty(body, hideProp, pageTransitionDurationHide);
      setProperty(body, showProp, pageTransitionDurationShow);
    }
  } else {
    if (!document.startViewTransition) {
      setMode("dark");
    } else {
      setProperty(body, hideProp, modetransitionDurationHide);
      setProperty(body, showProp, modeTransitionDurationShow);
      const trans = document.startViewTransition(() => setMode("dark"));
      await trans.finished;
      setProperty(body, hideProp, pageTransitionDurationHide);
      setProperty(body, showProp, pageTransitionDurationShow);
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
  const icon = document.querySelector("#dark-mode") as HTMLElement;
  const mobileIcon = document.querySelector("#dark-mode-mobile") as HTMLElement;
  const footerIcon = document.querySelector("#dark-mode-footer") as HTMLElement;

  if (mode === "dark") {
    localStorage.setItem(modeLocalStorageKey, mode);
    document.querySelector("html")?.classList.remove("light");
    document.querySelector("html")?.classList.add(mode);

    if (icon && icon.parentElement) {
      icon.parentElement.ariaLabel = "Switch to light mode";
      icon.parentElement.title =
        "May the light be with you and illuminate your path";
      icon.parentElement.innerHTML = getIcon("sun-moon", "dark-mode");
    }

    if (mobileIcon) {
      mobileIcon.ariaLabel = "Switch to light mode";
      mobileIcon.title = "May the light be with you and illuminate your path";
      mobileIcon.innerHTML = `${getIcon(
        "sun-moon",
        "dark-mode-mobile",
      )} Light Mode`;
    }

    if (footerIcon && footerIcon.parentElement) {
      footerIcon.parentElement.ariaLabel = "Switch to light mode";
      footerIcon.parentElement.title =
        "May the light be with you and illuminate your path";
      footerIcon.innerHTML = `${getIcon("sun-moon", "dark-mode-footer")}`;
    }
  } else {
    localStorage.setItem(modeLocalStorageKey, mode);
    document.querySelector("html")?.classList.remove("dark");
    document.querySelector("html")?.classList.add(mode);

    if (icon && icon.parentElement) {
      icon.parentElement.ariaLabel = "Switch to dark mode";
      icon.parentElement.title = "Enter the dark realm my lovelies";
      icon.parentElement.innerHTML = getIcon("moon", "dark-mode");
      icon.id = "dark-mode";
    }

    mobileIcon.ariaLabel = "Switch to dark mode";
    mobileIcon.title = "Enter the dark realm my lovelies";
    mobileIcon.innerHTML = `${getIcon("moon", "dark-mode-mobile")} Dark mode`;

    if (footerIcon && footerIcon.parentElement) {
      footerIcon.parentElement.ariaLabel = "Switch to dark mode";
      footerIcon.parentElement.title = "Enter the dark realm my lovelies";
      footerIcon.innerHTML = `${getIcon("moon", "dark-mode-footer")}`;
    }
  }
}

function addKeyHandlers(): void {
  window.addEventListener("keyup", (event) => {
    if (event.key === "Escape") {
      document.getElementById("big-menu")?.removeAttribute("open");
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

    document.getElementById("big-menu")?.removeAttribute("open");
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

      const onAnimationEnd = (cb: any) =>
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
  const tocContainer = document.querySelector("#toc");
  if (headings.length >= 6 && tocContainer) {
    for (let i = 0; i <= headings.length; i++) {
      if (headings[i] === undefined) {
        continue;
      }

      tocContainer.appendChild(createElementTocLink(headings[i], `${i + 1}`));
    }
    document.querySelector("#toc")?.classList.remove("opacity-0");
    document.querySelector("body")?.classList.add("has-toc");
  } else {
    document.querySelector("#toc")?.remove();
    return;
  }

  // Intersection Observer Options
  var options = {
    root: null,
    rootMargin: "10px",
    threshold: 1.0,
  };
  var observeHtags = new IntersectionObserver(setCurrent, options);

  headings.forEach((tag) => {
    observeHtags.observe(tag);
  });
}

// intersectiobserver callback
function setCurrent(entries: any[]): void {
  const bar = document.querySelector("#toc .bar") as HTMLElement;
  if (!bar) return;

  for (const entry of entries) {
    if (entry.isIntersecting === true) {
      const current = document.querySelector(
        `#toc a[href="#${entry.target.firstElementChild.getAttribute(
          "name",
        )}"]`,
      );
      if (!current) return;

      const row = current.getAttribute("data-row");
      bar.setAttribute("data-row", Number(row).toString());

      if (Number(row) !== 1) {
        bar.style.setProperty("top", `calc(${Number(row) - 1} * 26px)`);
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
