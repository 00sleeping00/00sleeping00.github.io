const nav = document.querySelector(".site-nav");
const toggle = document.querySelector(".menu-toggle");
const progress = document.querySelector(".scroll-progress");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const rootStyle = document.documentElement.style;

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const updateProgress = () => {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const value = max > 0 ? window.scrollY / max : 0;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, value))})`;
  if (!reducedMotion.matches) {
    rootStyle.setProperty("--scroll-shift", `-${Math.min(48, window.scrollY * 0.035)}px`);
  }
};

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

window.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches) return;
  document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
  document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
}, { passive: true });

document.addEventListener("pointerdown", (event) => {
  if (reducedMotion.matches) return;

  const burst = document.createElement("span");
  burst.className = "click-burst";
  burst.style.left = `${event.clientX}px`;
  burst.style.top = `${event.clientY}px`;
  document.body.appendChild(burst);
  burst.addEventListener("animationend", () => burst.remove(), { once: true });

  const target = event.target.closest("a, button");
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  target.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
});

document.querySelectorAll(".stage, .video-card, .news-card").forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;
    const rect = item.getBoundingClientRect();
    item.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    item.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
});

document.querySelectorAll(".motion-frame").forEach((frame) => {
  frame.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;
    const rect = frame.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    frame.style.transform = `rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-2px)`;
  });
  frame.addEventListener("pointerleave", () => {
    frame.style.transform = "";
  });
});

document.querySelectorAll('a[href$=".html"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (reducedMotion.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
    event.preventDefault();
    const wipe = document.querySelector(".page-wipe");
    if (wipe) {
      wipe.style.setProperty("--tx", `${event.clientX}px`);
      wipe.style.setProperty("--ty", `${event.clientY}px`);
    }
    document.body.classList.add("page-exiting");
    window.setTimeout(() => {
      window.location.href = link.href;
    }, 320);
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((item, index) => {
  item.style.setProperty("--delay", `${Math.min(index * 70, 280)}ms`);
  observer.observe(item);
});
