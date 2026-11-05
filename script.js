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

const resumeToggle = document.querySelector(".resume-toggle");
const resumeContent = document.querySelector("#resume-content");
const resumeBack = document.querySelector(".resume-back");

function setResumeOpen(isOpen) {
  resumeToggle.setAttribute("aria-expanded", String(isOpen));
  resumeContent.hidden = !isOpen;
  if (isOpen) {
    const resumeFrame = resumeContent.querySelector(".resume-frame");
    if (!resumeFrame.hasAttribute("src")) {
      resumeFrame.src = resumeFrame.dataset.src;
    }
    resumeBack.focus();
  } else {
    resumeToggle.focus();
  }
}

resumeToggle.addEventListener("click", () => setResumeOpen(true));
resumeBack.addEventListener("click", () => setResumeOpen(false));

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
