document.addEventListener("DOMContentLoaded", () => {
  load();
});

function load() {
  addClickHandlers();
  scrollHandler();
  hamburgerMenu();
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

function hamburgerMenu() {
  const hamburger = document.querySelector(".hamburger");
  const menu = document.querySelector("#mobile-menu");

  hamburger.addEventListener("click", (event) => {
    if (!menu.classList.contains("active")) {
      menu.classList.add("active");
      menu.classList.add("show");
      void menu.offsetWidth;

      const onAnimationEnd = (cb) =>
        menu.addEventListener("animationend", cb, { once: true });

      // request an animation frame to force Safari 16 to actually perform the animation
      requestAnimationFrame(() => menu.classList.add("show"));
      onAnimationEnd(() => {
        console.log("onAnimationEnd show");
        menu.classList.remove("show");
      });

      return;
    }

    if (menu.classList.contains("active")) {
      event.preventDefault();
      menu.classList.remove("show");
      menu.classList.add("hide");

      const onAnimationEnd2 = (cb) =>
        menu.addEventListener("animationend", cb, { once: true });

      onAnimationEnd2(() => {
        console.log("onAnimationEnd2 hide");
        menu.classList.remove("hide");
        menu.classList.remove("active");
      });
    }
  });
}

function scrollHandler() {
  window.addEventListener("scroll", (event) => {
    if (window.scrollY > 10 && window.scrollY < 50) {
      console.log("scrolling", window.scrollY);
      document.querySelector("header").classList.add("fixed");
    }

    if (window.scrollY === 0) {
      console.log("scrolling", window.scrollY);
      document.querySelector("header").classList.remove("fixed");
    }
  });
}
