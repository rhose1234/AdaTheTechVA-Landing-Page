const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animateIn(element, keyframes, options) {
  const nativeOptions = { ...options, easing: options.ease === "easeOut" ? "ease-out" : options.easing };
  delete nativeOptions.ease;
  element.animate(keyframes, nativeOptions).finished.then(() => {
    element.style.removeProperty("opacity");
    element.style.removeProperty("transform");
  }).catch(() => {});
}

if (!reduceMotion && "IntersectionObserver" in window) {
  const heroItems = document.querySelectorAll("#home h1, #home p, #home a[href]");
  heroItems.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(26px)";
    animateIn(
      element,
      { opacity: [0, 1], transform: ["translateY(26px)", "translateY(0px)"] },
      { duration: 0.75, delay: index * 0.12, ease: "easeOut" },
    );
  });

  const revealTargets = document.querySelectorAll(
    'main > section:not(#home) > div:first-child, .offering-card, .cohort-includes-list > li, .why-choose-us-card, .faq-item, .site-footer-inner, .site-footer-bottom',
  );
  revealTargets.forEach((element) => {
    element.dataset.motionReveal = "";
  });
  document.documentElement.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      element.classList.add("is-visible");
      const staggerGroup = element.matches(".offering-card, .cohort-includes-list > li, .why-choose-us-card, .faq-item");
      const siblingIndex = [...element.parentElement.children].indexOf(element) % 4;
      animateIn(
        element,
        {
          opacity: [0, 1],
          transform: ["translateY(32px) scale(.985)", "translateY(0px) scale(1)"],
        },
        { duration: 0.72, delay: staggerGroup ? siblingIndex * 0.11 : 0, ease: "easeOut" },
      );
      observer.unobserve(element);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -44px 0px" });

  revealTargets.forEach((element) => {
    revealObserver.observe(element);
  });
}
