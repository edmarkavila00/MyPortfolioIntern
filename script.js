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
let projectCards = [...projectCarousel.querySelectorAll(".project-card")];
const projectCarouselDotsNav = document.querySelector(".project-carousel-dots");
let projectCarouselDots = [];

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

function refreshProjectCarousel() {
  projectCards = [...projectCarousel.querySelectorAll(".project-card")];
  projectCarouselDotsNav.replaceChildren();
  projectCarouselDots = projectCards.map((card, index) => {
    const dot = document.createElement("button");
    dot.className = "project-carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-controls", "project-carousel");
    dot.setAttribute("aria-label", `Show project ${index + 1}: ${card.querySelector("h3").textContent.trim()}`);
    dot.addEventListener("click", () => {
      projectCarousel.scrollTo({ left: getProjectCardOffset(projectCards[index]), behavior: "smooth" });
    });
    projectCarouselDotsNav.append(dot);
    return dot;
  });
  updateProjectCarouselDots();
}

refreshProjectCarousel();

function createGithubProjectCard(repository, index) {
  const card = document.createElement("article");
  card.className = "project-card github-project-card";

  const image = document.createElement("div");
  image.className = `project-image project-art ${index % 2 ? "art-green" : "art-orange"}`;
  image.setAttribute("aria-hidden", "true");
  const symbol = document.createElement("span");
  symbol.className = "art-symbol";
  symbol.textContent = repository.name.slice(0, 2).toUpperCase();
  const number = document.createElement("span");
  number.className = "project-index";
  number.textContent = String(index + 1).padStart(2, "0");
  image.append(symbol, number);

  const info = document.createElement("div");
  info.className = "project-info";
  const meta = document.createElement("div");
  meta.className = "project-meta";
  const category = document.createElement("span");
  category.textContent = repository.language ? repository.language.toUpperCase() : "GITHUB REPOSITORY";
  const updated = document.createElement("span");
  updated.textContent = `★ ${repository.stargazers_count}`;
  meta.append(category, updated);

  const title = document.createElement("h3");
  title.textContent = repository.name.replace(/[-_]/g, " ");
  const description = document.createElement("p");
  description.textContent = repository.description || "A public project on GitHub. Open the repository to learn more.";
  const tags = document.createElement("ul");
  tags.className = "tag-list";
  tags.setAttribute("aria-label", "Repository topics");
  [repository.language, ...(repository.topics || []).slice(0, 4)].filter(Boolean).forEach((tag) => {
    const item = document.createElement("li");
    item.textContent = tag;
    tags.append(item);
  });
  const link = document.createElement("a");
  link.className = "project-link";
  link.href = repository.html_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(document.createTextNode("View on GitHub "));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.append(arrow);

  info.append(meta, title, description, tags, link);
  card.append(image, info);
  return card;
}

async function loadGithubProjects() {
  const username = projectCarousel.dataset.githubUser;
  const status = document.querySelector("#github-project-status");
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
    const repositories = await response.json();
    const featuredNames = new Set([...projectCarousel.querySelectorAll(".project-link[href]")]
      .map((link) => {
        try {
          const parts = new URL(link.href).pathname.split("/").filter(Boolean);
          return parts.length >= 2 && parts[0].toLowerCase() === username.toLowerCase() ? parts[1].toLowerCase() : null;
        } catch {
          return null;
        }
      }).filter(Boolean));
    const additionalRepositories = repositories.filter((repository) => (
      !repository.fork && !repository.archived && !featuredNames.has(repository.name.toLowerCase())
    ));

    additionalRepositories.forEach((repository, index) => {
      projectCarousel.append(createGithubProjectCard(repository, index + projectCards.length));
    });
    status.textContent = additionalRepositories.length
      ? `Showing ${additionalRepositories.length} more public ${additionalRepositories.length === 1 ? "repository" : "repositories"} from GitHub. New repositories appear here automatically.`
      : "Your selected projects are up to date with GitHub. New public repositories will appear here automatically.";
    refreshProjectCarousel();
  } catch (error) {
    status.textContent = "GitHub projects could not be loaded right now. Your selected projects are still available above.";
    console.warn("Could not load GitHub repositories:", error);
  }
}

loadGithubProjects();

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
const formToast = document.querySelector("#form-toast");
let formToastTimer;

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('[type="submit"]');
  const status = document.querySelector("#form-status");
  const originalButtonHTML = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  status.textContent = "Sending your message…";
  status.dataset.state = "sending";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "The message could not be sent.");
    }

    contactForm.reset();
    status.textContent = "Thanks! Your message has been sent.";
    status.dataset.state = "success";
    formToast.textContent = "Message sent successfully. Thanks for getting in touch!";
    formToast.hidden = false;
    window.clearTimeout(formToastTimer);
    formToastTimer = window.setTimeout(() => {
      formToast.hidden = true;
    }, 5000);
  } catch (error) {
    status.textContent = "Sorry, your message could not be sent. Please try again or email me directly.";
    status.dataset.state = "error";
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonHTML;
  }
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
