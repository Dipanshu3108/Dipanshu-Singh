const burger = document.getElementById("burger");
const navLinks = document.getElementById("nav-links");
const navLinkItems = document.querySelectorAll(".nav-link");
const themeStylesheet = document.getElementById("theme-stylesheet");
const floatingThemeToggle = document.getElementById("floating-theme-toggle");
const floatingThemeButton = document.getElementById("floating-theme-button");
const floatingThemePanel = document.getElementById("floating-theme-panel");
const allThemeButtons = document.querySelectorAll(".theme-btn");

const themeFileMap = {
    "current-ui": "css/current-ui.css",
    "neumorphism": "css/neumorphism.css",
    "flat2": "css/flat2.css",
    "bento-grid": "css/bento-grid.css",
    "skeuomorphism": "css/skeuomorphism.css",
    "glassmorphism": "css/glassmorphism.css"
};

function applyTheme(themeName) {
    const cssFile = themeFileMap[themeName] || themeFileMap["current-ui"];
    if (!themeStylesheet.getAttribute("href") || themeStylesheet.getAttribute("href") !== cssFile) {
        themeStylesheet.setAttribute("href", cssFile);
    }
    localStorage.setItem("portfolio-theme", themeName);
    allThemeButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.theme === themeName);
    });
}

const savedTheme = localStorage.getItem("portfolio-theme");
const initialTheme = savedTheme && themeFileMap[savedTheme] ? savedTheme : "current-ui";
applyTheme(initialTheme);

allThemeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        applyTheme(btn.dataset.theme);
        floatingThemeToggle.classList.remove("open");
        floatingThemeButton.setAttribute("aria-expanded", "false");
        floatingThemePanel.setAttribute("aria-hidden", "true");
    });
});

floatingThemeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = floatingThemeToggle.classList.toggle("open");
    floatingThemeButton.setAttribute("aria-expanded", String(isOpen));
    floatingThemePanel.setAttribute("aria-hidden", String(!isOpen));
});

document.addEventListener("click", (event) => {
    if (!floatingThemeToggle.contains(event.target)) {
        floatingThemeToggle.classList.remove("open");
        floatingThemeButton.setAttribute("aria-expanded", "false");
        floatingThemePanel.setAttribute("aria-hidden", "true");
    }
});

burger.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    burger.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(isOpen));
});

navLinkItems.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const targetId = link.getAttribute("href");
        const target = document.querySelector(targetId);
        if (!target) return;

        target.scrollIntoView({ behavior: "smooth", block: "start" });
        navLinks.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
    });
});

const sections = document.querySelectorAll(".section-anchor");
const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const activeId = entry.target.getAttribute("id");
            navLinkItems.forEach((link) => {
                link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
            });
        });
    },
    { threshold: 0.35 }
);

sections.forEach((section) => sectionObserver.observe(section));

const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const tabId = button.dataset.tab;
        tabButtons.forEach((btn) => {
            btn.classList.remove("active");
            btn.setAttribute("aria-selected", "false");
        });
        tabPanels.forEach((panel) => panel.classList.remove("active"));

        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        const selectedPanel = document.getElementById(tabId);
        if (selectedPanel) selectedPanel.classList.add("active");
    });
});

const toggleButtons = document.querySelectorAll(".toggle-more");
toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.target);
        if (!target) return;
        const isOpen = target.classList.toggle("active");
        button.textContent = isOpen ? "Show Less" : "Show More";
    });
});
