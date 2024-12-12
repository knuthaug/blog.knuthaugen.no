const modeLocalStorageKey = "blog.knuthaugen.no.mode";

document.addEventListener("DOMContentLoaded", () => {
  load();
});

function load() {
  darkMode();
  addClickHandlers();
  addScrollHandler();
  hamburgerMenu();
  initTOC();
}

function darkMode() {
  const mode = localStorage.getItem(modeLocalStorageKey) || "dark";
  setMode(mode);
  const icon = document.querySelector("#dark-mode");

  icon.addEventListener("click", (event) => {
    const currentMode = localStorage.getItem(modeLocalStorageKey);
    if (currentMode === "dark") {
      localStorage.setItem(modeLocalStorageKey, "light");
      document.startViewTransition(() => setMode("light"));
    } else {
      localStorage.setItem(modeLocalStorageKey, "dark");
      document.startViewTransition(() => setMode("dark"));
    }
    icon.getBoundingClientRect;
  });
}

function setMode(mode) {
  const icon = document.querySelector("#dark-mode");

  if (mode === "dark") {
    document.querySelector("html").classList.remove("light");
    document.querySelector("html").classList.add("dark");

    icon.parentElement.ariaLabel = "Switch to light mode";
    icon.src = "/assets/icons/sun-moon.svg";
  } else {
    document.querySelector("html").classList.remove("dark");
    document.querySelector("html").classList.add("light");

    icon.parentElement.ariaLabel = "Switch to dark mode";
    icon.src = "/assets/icons/moon.svg";
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
        hamburger.setAttribute("src", "/assets/icons/x.svg");
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
        hamburger.setAttribute("src", "/assets/icons/menu.svg");
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
