import { onCLS, onFCP, onLCP, onINP, onTTFB } from "web-vitals";
import { Vitals } from "./types";
import { writeINP, writeVitals } from "./influx";

const modeLocalStorageKey = "blog.knuthaugen.no.mode";

document.addEventListener("DOMContentLoaded", () => {
  load();
});

function load(): void {
  addWebVitals();
  darkMode();
  addClickHandlers();
  addScrollHandler();
  //addPageEventHandlers();
  hamburgerMenu();
  initTOC();
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
    ({ value }) => {
      values.lcp = `${Math.round(value)}`;
    },
    { reportAllChanges: true },
  );

  onFCP(
    ({ value }) => {
      values.fcp = `${Math.round(value)}`;
    },
    { reportAllChanges: true },
  );

  onINP(
    ({ value }) => {
      console.log(`INP time: ${Math.round(value)}`);
      writeINP(value);
    },
    { reportAllChanges: true },
  );

  onCLS(
    ({ value }) => {
      values.cls = `${value}`;
    },
    { reportAllChanges: true },
  );

  onTTFB(
    ({ value }) => {
      values.ttfb = `${Math.round(value)}`;
    },
    { reportAllChanges: true },
  );

  setTimeout(() => {
    console.log("Web Vitals", values);
    writeVitals(values);
  }, 1500);
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

function addClickHandlers(): void {
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

      const onAnimationEnd = (cb) =>
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
        bar.style.setProperty("top", `calc(${Number(row) - 1} * 29px)`);
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

function hamburgerMenu(): void {
  const hamburger = document.querySelector("#burger");
  const menu = document.querySelector("#mobile-menu") as HTMLElement;

  if (!hamburger || !menu) {
    return;
  }

  hamburger.addEventListener("click", (_event) => {
    if (!menu.classList.contains("active")) {
      menu.classList.add("active");
      menu.classList.add("show");
      hamburger.classList.add("icon-fade-out");
      void menu.offsetWidth;

      const onAnimationEnd = (cb) =>
        menu.addEventListener("animationend", cb, { once: true });

      const iconOnAnimationEnd = (cb) =>
        hamburger.addEventListener("animationend", cb, { once: true });

      iconOnAnimationEnd(() => {
        hamburger.innerHTML = getIcon("x");
        hamburger.classList.remove("icon-fade-out");
        hamburger.classList.add("icon-fade-in");

        hamburger.addEventListener(
          "animationend",
          () => {
            hamburger.classList.remove("icon-fade-in");
          },
          { once: true },
        );
      });

      // request an animation frame to force Safari 16 to actually perform the animation
      requestAnimationFrame(() => menu.classList.add("show"));
      onAnimationEnd(() => {
        menu.classList.remove("show");
      });

      return;
    }

    if (menu.classList.contains("active")) {
      menu.classList.remove("show");
      menu.classList.add("hide");
      hamburger.classList.add("icon-fade-out");
      void menu.offsetWidth;

      const onAnimationEnd2 = (cb) =>
        menu.addEventListener("animationend", cb, { once: true });

      onAnimationEnd2(() => {
        menu.classList.remove("hide");
        menu.classList.remove("active");
      });

      const iconOnAnimationEnd = (cb) =>
        hamburger.addEventListener("animationend", cb, { once: true });

      iconOnAnimationEnd(() => {
        hamburger.innerHTML = getIcon("menu");
        hamburger.classList.remove("icon-fade-out");
        hamburger.classList.add("icon-fade-in");

        hamburger.addEventListener(
          "animationend",
          () => {
            hamburger.classList.remove("icon-fade-in");
          },
          { once: true },
        );
      });
    }
  });
}

function addScrollHandler(): void {
  window.addEventListener("scroll", (event) => {
    if (window.scrollY > 10 && window.scrollY < 50) {
      document.querySelector("header")?.classList.add("fixed");
    }

    if (window.scrollY === 0) {
      document.querySelector("header")?.classList.remove("fixed");
    }
  });
}

function getIcon(icon: string, id?: string): string {
  if (icon === "sun-moon") {
    return `<svg
  class="lucide lucide-sun-moon icon"
  id="${id}"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 8a2.83 2.83 0 0 0 4 4 4 4 0 1 1-4-4" />
  <path d="M12 2v2" />
  <path d="M12 20v2" />
  <path d="m4.9 4.9 1.4 1.4" />
  <path d="m17.7 17.7 1.4 1.4" />
  <path d="M2 12h2" />
  <path d="M20 12h2" />
  <path d="m6.3 17.7-1.4 1.4" />
  <path d="m19.1 4.9-1.4 1.4" />
</svg>`;
  } else if (icon === "moon") {
    return `<svg
  class="lucide lucide-moon icon"
  id="${id}"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
</svg>`;
  } else if (icon === "x") {
    return `<svg
  class="lucide lucide-x"
  id="${id}"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M18 6 6 18" />
  <path d="m6 6 12 12" />
</svg>`;
  } else if (icon === "menu") {
    return `<svg
  class="lucide lucide-menu"
  id="${id}"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <line x1="4" x2="20" y1="12" y2="12" />
  <line x1="4" x2="20" y1="6" y2="6" />
  <line x1="4" x2="20" y1="18" y2="18" />
</svg>`;
  }

  return "";
}
