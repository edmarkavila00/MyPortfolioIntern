const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const siteHeader = document.querySelector(".site-header");
const navSectionLinks = [...navLinks.querySelectorAll('a[href^="#"]')];
const themedSections = [...document.querySelectorAll("main > section[id]"), document.querySelector(".site-footer")];

function setTheme(theme) {
  document.body.dataset.theme = theme;
  const nextTheme = theme === "dark" ? "light" : "dark";
  themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
  themeToggle.setAttribute("title", `Switch to ${nextTheme} mode`);
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#171b20" : "#f5f4ef";
}

themeToggle.addEventListener("click", () => {
  setTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
});

function setActiveSection(sectionId) {
  document.body.dataset.section = sectionId;
  navSectionLinks.forEach((link) => {
    if (link.hash === `#${sectionId}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let sectionUpdatePending = false;
let requestedSection = null;
let requestedSectionTimer;

function updateActiveSection() {
  if (sectionUpdatePending || requestedSection) return;
  sectionUpdatePending = true;
  window.requestAnimationFrame(() => {
    const activationPoint = window.scrollY + siteHeader.offsetHeight + window.innerHeight * 0.3;
    const activeSection = themedSections.find((section) => (
      section.offsetTop <= activationPoint && section.offsetTop + section.offsetHeight > activationPoint
    ));
    setActiveSection(activeSection?.id || "home");
    sectionUpdatePending = false;
  });
}

window.addEventListener("scroll", updateActiveSection, { passive: true });
window.addEventListener("resize", updateActiveSection);
window.addEventListener("scrollend", () => {
  if (!requestedSection) return;
  window.clearTimeout(requestedSectionTimer);
  requestedSection = null;
  updateActiveSection();
});
setTheme("light");
updateActiveSection();

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  navLinks.classList.toggle("is-open", isOpen);
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

navLinks.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (link) {
    requestedSection = link.hash.slice(1);
    setActiveSection(requestedSection);
    window.clearTimeout(requestedSectionTimer);
    requestedSectionTimer = window.setTimeout(() => {
      requestedSection = null;
      updateActiveSection();
    }, 1200);
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

const projectCarousel = document.querySelector("#project-carousel");
const projectCards = [...projectCarousel.querySelectorAll(".project-card")];
const projectCarouselDots = [...document.querySelectorAll(".project-carousel-dot")];

function getProjectCardOffset(card) {
  const carouselStyle = getComputedStyle(projectCarousel);
  return card.getBoundingClientRect().left
    - projectCarousel.getBoundingClientRect().left
    + projectCarousel.scrollLeft
    - Number.parseFloat(carouselStyle.paddingLeft);
}

function updateProjectCarouselDots() {
  const isAtEnd = projectCarousel.scrollLeft + projectCarousel.clientWidth >= projectCarousel.scrollWidth - 1;
  const activeIndex = isAtEnd
    ? projectCards.length - 1
    : projectCards.reduce((closestIndex, card, index) => (
      Math.abs(getProjectCardOffset(card) - projectCarousel.scrollLeft)
        < Math.abs(getProjectCardOffset(projectCards[closestIndex]) - projectCarousel.scrollLeft)
        ? index
        : closestIndex
    ), 0);

  projectCarouselDots.forEach((dot, index) => {
    if (index === activeIndex) {
      dot.setAttribute("aria-current", "true");
    } else {
      dot.removeAttribute("aria-current");
    }
  });
}

projectCarouselDots.forEach((dot, index) => {
  const title = projectCards[index].querySelector("h3").textContent.trim();
  dot.setAttribute("aria-label", `Show project ${index + 1}: ${title}`);
  dot.addEventListener("click", () => {
    projectCarousel.scrollTo({
      left: getProjectCardOffset(projectCards[index]),
      behavior: "smooth",
    });
  });
});

let dragPointerId = null;
let dragStartX = 0;
let dragStartScroll = 0;
let hasDragged = false;
let suppressClick = false;

projectCarousel.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  dragPointerId = event.pointerId;
  dragStartX = event.clientX;
  dragStartScroll = projectCarousel.scrollLeft;
  hasDragged = false;
});

document.addEventListener("pointermove", (event) => {
  if (event.pointerId !== dragPointerId) return;
  const distance = event.clientX - dragStartX;
  if (!hasDragged && Math.abs(distance) > 4) {
    hasDragged = true;
    projectCarousel.classList.add("is-dragging");
  }
  if (hasDragged) {
    event.preventDefault();
    projectCarousel.scrollLeft = dragStartScroll - distance;
  }
}, { passive: false });

function finishProjectCarouselDrag(event) {
  if (event.pointerId !== dragPointerId) return;
  dragPointerId = null;
  projectCarousel.classList.remove("is-dragging");
  if (hasDragged) {
    suppressClick = true;
    window.setTimeout(() => {
      suppressClick = false;
    }, 0);
  }
}

document.addEventListener("pointerup", finishProjectCarouselDrag);
document.addEventListener("pointercancel", finishProjectCarouselDrag);
projectCarousel.addEventListener("click", (event) => {
  if (!suppressClick) return;
  event.preventDefault();
  event.stopPropagation();
  suppressClick = false;
}, true);
projectCarousel.addEventListener("dragstart", (event) => event.preventDefault());
projectCarousel.addEventListener("scroll", updateProjectCarouselDots, { passive: true });
window.addEventListener("resize", updateProjectCarouselDots);
updateProjectCarouselDots();

const contactForm = document.querySelector("#contact-form");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);

  window.location.href = `mailto:edmarkavila21@example.com?subject=${subject}&body=${body}`;
});

document.querySelector("#year").textContent = new Date().getFullYear();

const customCursor = document.querySelector(".custom-cursor");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

if (finePointer.matches) {
  document.body.classList.add("custom-cursor-enabled");

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    customCursor.style.setProperty("--cursor-x", `${event.clientX}px`);
    customCursor.style.setProperty("--cursor-y", `${event.clientY}px`);
    customCursor.classList.add("is-visible");
  });

  document.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    const target = event.target;
    customCursor.classList.toggle(
      "is-hovering",
      Boolean(target.closest("a, button, .project-card")),
    );
    customCursor.classList.toggle(
      "is-text-entry",
      Boolean(target.closest("input, textarea, select, [contenteditable='true']")),
    );
  });

  window.addEventListener("pointerout", (event) => {
    if (event.relatedTarget) return;
    customCursor.classList.remove("is-visible", "is-hovering");
  });
}
