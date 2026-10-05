const menuButton = document.querySelector("#mobile-menu-button");
const navigation = document.querySelector("#primary-navigation");
const openIcon = document.querySelector("#menu-open-icon");
const closeIcon = document.querySelector("#menu-close-icon");

document.querySelector("#copyright-year").textContent = new Date().getFullYear();

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  const loadedAtField = contactForm.elements.namedItem("form_loaded_at");
  const submitButton = contactForm.querySelector(".contact-submit");
  const feedback = contactForm.querySelector(".contact-form-feedback");
  let feedbackTimer;
  const setLoadedAt = () => { loadedAtField.value = String(Math.floor(Date.now() / 1000)); };
  setLoadedAt();
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearTimeout(feedbackTimer);
    feedback.hidden = true;
    feedback.textContent = "";
    const name = contactForm.elements.namedItem("name");
    const email = contactForm.elements.namedItem("email");
    const message = contactForm.elements.namedItem("message");
    let error = "";
    if (!name.value.trim()) error = "Please enter your name.";
    else if (!email.value.trim()) error = "Please enter your email address.";
    else if (!email.validity.valid) error = "Please enter a valid email address, such as name@example.com.";
    else if (!message.value.trim()) error = "Please enter a message.";
    if (error) {
      feedback.textContent = error;
      feedback.dataset.state = "error";
      feedback.hidden = false;
      (error.includes("email") ? email : error.includes("message") ? message : name).focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    let response;
    try {
      response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error(`The server returned an unexpected response (HTTP ${response.status}). This usually means PHP is not enabled for this site. Please email info@adathevahealthtech.com directly.`);
      }
      if (!response.ok) throw new Error(result.message || "Please check your details and try again.");
      contactForm.reset();
      feedback.textContent = result.message || "Your message has been sent. Thank you!";
      feedback.dataset.state = "success";
      feedback.hidden = false;
      feedbackTimer = setTimeout(() => { feedback.hidden = true; feedback.textContent = ""; }, 3000);
    } catch (requestError) {
      feedback.textContent = requestError.message || "We could not reach the contact service. Please check your connection and try again.";
      feedback.dataset.state = "error";
      feedback.hidden = false;
    } finally {
      setLoadedAt();
      submitButton.disabled = false;
      submitButton.textContent = "Send Message";
    }
  });
}

function setMenuOpen(isOpen) {
  navigation.classList.toggle("hidden", !isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu",
  );
  openIcon.hidden = isOpen;
  closeIcon.hidden = !isOpen;
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuOpen(false);
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 801) setMenuOpen(false);
});

const cohortPills = document.querySelectorAll(".cohort-pill");
const cohortDescription = document.querySelector("#cohort-includes-description");

cohortPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const wasExpanded = pill.getAttribute("aria-expanded") === "true";

    cohortPills.forEach((item) => {
      item.setAttribute("aria-expanded", "false");
      item.closest("li").classList.remove("is-expanded");
      const itemDescription = document.getElementById(item.getAttribute("aria-controls").split(" ")[1]);
      itemDescription.hidden = true;
      itemDescription.textContent = "";
    });
    cohortDescription.hidden = wasExpanded;

    if (wasExpanded) {
      cohortDescription.textContent = "";
      return;
    }

    pill.setAttribute("aria-expanded", "true");
    pill.closest("li").classList.add("is-expanded");
    cohortDescription.textContent = pill.dataset.description;
    const itemDescription = document.getElementById(pill.getAttribute("aria-controls").split(" ")[1]);
    itemDescription.textContent = pill.dataset.description;
    itemDescription.hidden = false;
  });
});

const testimonialsTrack = document.querySelector("#testimonials-track");
const testimonialCards = [...testimonialsTrack.querySelectorAll(".testimonial-card")];
let activeTestimonial = 0;

function showTestimonial(index) {
  activeTestimonial = (index + testimonialCards.length) % testimonialCards.length;
  const previous = (activeTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
  const next = (activeTestimonial + 1) % testimonialCards.length;

  testimonialCards.forEach((card, cardIndex) => {
    const position = cardIndex === activeTestimonial ? "active" : cardIndex === previous ? "previous" : cardIndex === next ? "next" : "";
    card.hidden = !position;
    card.dataset.position = position;
    card.setAttribute("aria-hidden", String(!position));
  });
}

showTestimonial(activeTestimonial);

document.querySelectorAll("[data-testimonial-direction]").forEach((button) => {
  button.addEventListener("click", () => {
    showTestimonial(activeTestimonial + Number(button.dataset.testimonialDirection));
  });
});

testimonialsTrack.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    showTestimonial(activeTestimonial + (event.key === "ArrowRight" ? 1 : -1));
  }
});

let testimonialSwipeStart = null;
testimonialsTrack.addEventListener("pointerdown", (event) => {
  testimonialSwipeStart = event.clientX;
});
testimonialsTrack.addEventListener("pointerup", (event) => {
  if (testimonialSwipeStart === null) return;
  const distance = event.clientX - testimonialSwipeStart;
  testimonialSwipeStart = null;
  if (Math.abs(distance) > 45) {
    testimonialsTrack.dataset.swiped = "true";
    showTestimonial(activeTestimonial + (distance < 0 ? 1 : -1));
  }
});
testimonialsTrack.addEventListener("pointercancel", () => { testimonialSwipeStart = null; });
testimonialsTrack.addEventListener("click", (event) => {
  if (testimonialsTrack.dataset.swiped === "true") {
    event.preventDefault();
    event.stopImmediatePropagation();
    testimonialsTrack.dataset.swiped = "false";
  }
}, true);

const testimonialDialog = document.querySelector(".testimonial-dialog");
const testimonialDialogImage = document.querySelector(".testimonial-dialog-image");
document.querySelectorAll(".testimonial-open").forEach((button) => {
  button.addEventListener("click", () => {
    testimonialDialogImage.src = button.dataset.testimonialImage;
    testimonialDialogImage.alt = button.dataset.testimonialAlt;
    const pageScrollX = window.scrollX;
    const pageScrollY = window.scrollY;
    testimonialDialog.showModal();
    requestAnimationFrame(() => window.scrollTo({ left: pageScrollX, top: pageScrollY, behavior: "auto" }));
  });
});

document.querySelector(".testimonial-dialog-close").addEventListener("click", () => {
  testimonialDialog.close();
});

testimonialDialog.addEventListener("click", (event) => {
  if (event.target === testimonialDialog) testimonialDialog.close();
});
