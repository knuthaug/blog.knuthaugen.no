const modeLocalStorageKey = "blog.knuthaugen.no.mode";

document.addEventListener("DOMContentLoaded", () => {
  load();
});

function load() {
  addWebVitals();
  darkMode();
  addClickHandlers();
  addScrollHandler();
  hamburgerMenu();
  initTOC();
}

function addWebVitals() {
  // Load web-vitals.js and log LCP updates to console
  var script = document.createElement("script");
  script.src =
    "https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.iife.js";
  script.onload = function () {
    const values = {};

    window.webVitals.onLCP(
      ({ value }) => {
        values.lcp = `${Math.round(value)} ms`;
      },
      { reportAllChanges: true },
    );

    window.webVitals.onFCP(
      ({ value }) => {
        values.fcp = `${Math.round(value)} ms`;
      },
      { reportAllChanges: true },
    );

    window.webVitals.onINP(
      ({ value }) => {
        console.log(`INP time: ${Math.round(value)} ms`);
      },
      { reportAllChanges: true },
    );

    window.webVitals.onCLS(
      ({ value }) => {
        values.cls = `${value}`;
      },
      { reportAllChanges: true },
    );
    window.webVitals.onTTFB(
      ({ value }) => {
        values.ttfb = `${Math.round(value)} ms`;
      },
      { reportAllChanges: true },
    );

    setTimeout(() => {
      console.log("Web Vitals", values);
    }, 2000);
  };
  document.head.appendChild(script);
}

function darkMode() {
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

  icon.addEventListener("click", darkModeClickHandler);
  mobileIcon.addEventListener("click", darkModeClickHandler);
  footerIcon.addEventListener("click", darkModeClickHandler);
}

function darkModeClickHandler(_event) {
  const currentMode = localStorage.getItem(modeLocalStorageKey);
  if (currentMode === "dark") {
    if (!document.startViewTransition) {
      setMode("light");
    } else {
      document.startViewTransition(() => setMode("light"));
    }
  } else {
    if (!document.startViewTransition) {
      setMode("dark");
    } else {
      document.startViewTransition(() => setMode("dark"));
    }
  }
}

function setMode(mode) {
  const icon = document.querySelector("#dark-mode");
  const mobileIcon = document.querySelector("#dark-mode-mobile");
  const footerIcon = document.querySelector("#dark-mode-footer");

  if (mode === "dark") {
    localStorage.setItem(modeLocalStorageKey, mode);
    document.querySelector("html").classList.remove("light");
    document.querySelector("html").classList.add(mode);

    icon.parentElement.ariaLabel = "Switch to light mode";
    icon.parentElement.title =
      "May the light be with you and illuminate your path";
    icon.innerHTML = getIcon("sun-moon");

    mobileIcon.ariaLabel = "Switch to light mode";
    mobileIcon.title = "May the light be with you and illuminate your path";
    mobileIcon.innerHTML = `${getIcon("sun-moon")} Light Mode`;

    footerIcon.ariaLabel = "Switch to light mode";
    footerIcon.title = "May the light be with you and illuminate your path";
    footerIcon.innerHTML = `${getIcon("sun-moon")} Light Mode`;
  } else {
    localStorage.setItem(modeLocalStorageKey, mode);
    document.querySelector("html").classList.remove("dark");
    document.querySelector("html").classList.add(mode);

    icon.parentElement.ariaLabel = "Switch to dark mode";
    icon.parentElement.title = "Enter the dark realm my lovelies";
    icon.innerHTML = getIcon("moon");

    mobileIcon.ariaLabel = "Switch to dark mode";
    mobileIcon.title = "Enter the dark realm my lovelies";
    mobileIcon.innerHTML = `${getIcon("moon")} Dark mode`;

    footerIcon.ariaLabel = "Switch to light mode";
    footerIcon.title = "May the light be with you and illuminate your path";
    footerIcon.innerHTML = `${getIcon("sun-moon")} Light Mode`;
  }
}

function addClickHandlers() {
  document.querySelectorAll("summary").forEach((element) => {
    element.addEventListener("click", (event) => {
      const detailsElement = event.target.parentElement.parentElement;
      const contentElement = detailsElement.querySelector("ul");
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

function initTOC() {
  const headings = Array.from(document.querySelectorAll("h3"));
  const tocContainer = document.querySelector("#toc");
  if (headings.length >= 6) {
    for (let i = 0; i <= headings.length; i++) {
      if (headings[i] === undefined) {
        continue;
      }

      tocContainer.appendChild(createElementTocLink(headings[i], i + 1));
    }
    document.querySelector("#toc")?.classList.remove("opacity-0");
    document.querySelector("body").classList.add("has-toc");
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
function setCurrent(entries) {
  const bar = document.querySelector("#toc .bar");
  for (const entry of entries) {
    if (entry.isIntersecting === true) {
      const current = document.querySelector(
        `#toc a[href="#${entry.target.firstElementChild.getAttribute(
          "name",
        )}"]`,
      );
      if (!current) return;

      const row = current.getAttribute("data-row");
      bar.setAttribute("data-row", Number(row));

      if (Number(row) !== 1) {
        bar.style.setProperty("top", `calc(${row - 1} * 29px)`);
      } else {
        bar.style.setProperty("top", `0px`);
      }
      return;
    }
  }
}

function createElementTocLink(el, num) {
  const a = document.createElement("a");
  a.classList.add("toc-link");
  a.setAttribute("data-row", num);
  a.href = `#${el.firstElementChild.name}`;
  a.appendChild(document.createTextNode(el.firstElementChild.innerHTML));
  return a;
}

function hamburgerMenu() {
  const hamburger = document.querySelector("#burger");
  const menu = document.querySelector("#mobile-menu");

  hamburger.addEventListener("click", (event) => {
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

function addScrollHandler() {
  window.addEventListener("scroll", (event) => {
    if (window.scrollY > 10 && window.scrollY < 50) {
      document.querySelector("header").classList.add("fixed");
    }

    if (window.scrollY === 0) {
      document.querySelector("header").classList.remove("fixed");
    }
  });
}

function getIcon(icon) {
  if (icon === "sun-moon") {
    return `<svg
  class="lucide lucide-sun-moon icon"
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
}
