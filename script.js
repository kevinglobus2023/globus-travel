const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav.setAttribute("data-open", String(!isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.setAttribute("data-open", "false");
    });
  });
}

document.querySelectorAll("[data-scroll-target]").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const target = document.querySelector(trigger.getAttribute("data-scroll-target"));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const getSlidesPerView = (carousel) => {
  const value = getComputedStyle(carousel).getPropertyValue("--slides-per-view").trim();
  return Number.parseFloat(value) || 1;
};

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const id = carousel.getAttribute("data-carousel");
  const track = carousel.querySelector(".mock-carousel-track");
  const originalSlides = Array.from(track?.children || []);
  const prevButton = document.querySelector(`[data-carousel-prev="${id}"]`);
  const nextButton = document.querySelector(`[data-carousel-next="${id}"]`);

  if (!track || !originalSlides.length || !prevButton || !nextButton) {
    return;
  }

  let autoRotate;
  let isJumping = false;
  const cloneCount = Math.ceil(getSlidesPerView(carousel)) + 1;

  const prependClones = originalSlides.slice(-cloneCount).map((slide) => slide.cloneNode(true));
  const appendClones = originalSlides.slice(0, cloneCount).map((slide) => slide.cloneNode(true));

  prependClones.forEach((clone) => {
    clone.setAttribute("data-clone", "true");
    track.insertBefore(clone, track.firstChild);
  });

  appendClones.forEach((clone) => {
    clone.setAttribute("data-clone", "true");
    track.appendChild(clone);
  });

  const slides = Array.from(track.children);
  let index = cloneCount;

  const moveToIndex = (nextIndex, withTransition = true) => {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const trackStyles = getComputedStyle(track);
    const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || "0");
    const offset = nextIndex * (slideWidth + gap);

    track.style.transition = withTransition ? "transform 0.35s ease" : "none";
    track.style.transform = `translateX(-${offset}px)`;
  };

  const updateCarousel = (withTransition = true) => {
    moveToIndex(index, withTransition);
    prevButton.disabled = false;
    nextButton.disabled = false;
  };

  const startAutoRotate = () => {
    clearInterval(autoRotate);
    autoRotate = window.setInterval(() => {
      if (isJumping) {
        return;
      }

      index += 1;
      updateCarousel();
    }, 3500);
  };

  prevButton.addEventListener("click", () => {
    if (isJumping) {
      return;
    }

    index -= 1;
    updateCarousel();
    startAutoRotate();
  });

  nextButton.addEventListener("click", () => {
    if (isJumping) {
      return;
    }

    index += 1;
    updateCarousel();
    startAutoRotate();
  });

  track.addEventListener("transitionend", () => {
    const originalCount = originalSlides.length;

    if (index >= originalCount + cloneCount) {
      isJumping = true;
      index = cloneCount;
      updateCarousel(false);
      requestAnimationFrame(() => {
        isJumping = false;
      });
    } else if (index < cloneCount) {
      isJumping = true;
      index = originalCount + cloneCount - 1;
      updateCarousel(false);
      requestAnimationFrame(() => {
        isJumping = false;
      });
    }
  });

  carousel.addEventListener("mouseenter", () => clearInterval(autoRotate));
  carousel.addEventListener("mouseleave", startAutoRotate);

  window.addEventListener("resize", () => updateCarousel(false));
  updateCarousel(false);
  startAutoRotate();
});
