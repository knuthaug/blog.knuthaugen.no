document.addEventListener("DOMContentLoaded", () => {
  load();
});

function load() {
  addClickHandlers();
  scrollHandler();
  hamburgerMenu();
  initTOC();
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
  const headings = document.querySelectorAll("h3");
  const tocContainer = document.querySelector("#toc");

  if (headings.length >= 5) {
    let i = 1;
    for (const heading of headings) {
      tocContainer.appendChild(createElementTocLink(heading, i++));
    }
    document.querySelector("#toc").classList.remove("opacity-0");
  }

  // Intersection Observer Options
  var options = {
    root: null,
    rootMargin: "0px",
    threshold: [1],
  };
  var observeHtags = new IntersectionObserver(setCurrent, options);

  headings.forEach((tag) => {
    observeHtags.observe(tag);
  });
}

// intersectiobserver callback
function setCurrent(e) {
  const allSectionLinks = document.querySelectorAll("#toc .toc-link");
  const bar = document.querySelector("#toc .bar");
  e.map((i) => {
    if (i.isIntersecting === true) {
      const current = document.querySelector(
        `#toc a[href="#${i.target.firstElementChild.getAttribute("name")}"]`,
      );
      const row = current.getAttribute("data-row");
      const previousRow = bar.getAttribute("data-row");
      bar.setAttribute("data-row", Number(row));

      if (Number(row) !== 1) {
        bar.style.setProperty("top", `calc(${row - 1} * 28px)`);
      } else {
        bar.style.setProperty("top", `0px`);
      }
    }
  });
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

function scrollHandler() {
  window.addEventListener("scroll", (event) => {
    if (window.scrollY > 10 && window.scrollY < 50) {
      document.querySelector("header").classList.add("fixed");
    }

    if (window.scrollY === 0) {
      document.querySelector("header").classList.remove("fixed");
    }
  });
}
