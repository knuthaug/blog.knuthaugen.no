export function findLanguages(): void {
  document.querySelectorAll("pre.font-highlight code").forEach((element) => {
    const classes = element.getAttribute("class");
    const parts = classes ? classes.split("language-") : [];
    element.parentElement!.setAttribute("data-lang", parts[1] || "text");
  });
}

export function hamburgerMenu(): void {
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

      const onAnimationEnd = (cb: any) =>
        menu.addEventListener("animationend", cb, { once: true });

      const iconOnAnimationEnd = (cb: any) =>
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

      const onAnimationEnd2 = (cb: any) =>
        menu.addEventListener("animationend", cb, { once: true });

      onAnimationEnd2(() => {
        menu.classList.remove("hide");
        menu.classList.remove("active");
      });

      const iconOnAnimationEnd = (cb: any) =>
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

export function addScrollHandler(): void {
  window.addEventListener("scroll", (event) => {
    if (window.scrollY > 10 && window.scrollY < 50) {
      document.querySelector("header")?.classList.add("fixed");
    }

    if (window.scrollY === 0) {
      document.querySelector("header")?.classList.remove("fixed");
    }
  });
}

export function getIcon(icon: string, id?: string): string {
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
