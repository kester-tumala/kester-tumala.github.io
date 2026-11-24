// ============================================================
//  EDIT YOUR LINKS HERE. This is the only place you need to change.
//  Leave a value as "" to hide that link everywhere on the site.
//  Examples:
//    email:     "kester@gmail.com"
//    github:    "https://github.com/yourname"
//    linkedin:  "https://www.linkedin.com/in/yourname"
//    facebook:  "https://www.facebook.com/yourname"
//    messenger: "https://m.me/yourname"
//    website:   "https://yourname.netlify.app"
// ============================================================
const SOCIALS = {
  email: "kestertumala@gmail.com",
  github: "",
  linkedin: "",
  facebook: "https://www.facebook.com/share/1NsXDDZShP/?mibextid=wwXIfr",
  messenger: "",
  tiktok: "https://www.tiktok.com/@kester.3",
  website: ""
};

// ============================================================
//  PROJECT LINKS: where each project card goes when clicked.
//  Paste the live website / system URL (or your GitHub repo).
//  Leave "" and the card stays a normal, non-clickable card.
// ============================================================
const PROJECTS = {
  vpos: "",     // VPOS point-of-sale
  igp: "siquigp-web.online",      // SIQUIGP-WEB / IGP rentals
  mystic: ""    // Mystic Island Rides
};

// ============================================================
//  CONTACT FORM: sends the visitor's message to YOUR inbox.
//  Easiest setup (Web3Forms): get a free access key at web3forms.com
//  (enter your email, the key is emailed to you) and paste it below.
//  Using Formspree instead? Set endpoint to your form URL
//  (https://formspree.io/f/xxxxxxxx) and leave accessKey empty.
//  If nothing is set, the form falls back to opening the visitor's email app.
// ============================================================
const CONTACT_FORM = {
  endpoint: "https://api.web3forms.com/submit",
  accessKey: ""
};

function initTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".project-card, .feature-card").forEach(card => {
    card.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return; // tilt is for mouse only, not touch
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", ((x - 0.5) * 12).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - y) * 10).toFixed(2) + "deg");
      card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      card.classList.add("is-tilting");
    });
    card.addEventListener("pointerleave", () => card.classList.remove("is-tilting"));
  });
}

function applyProjects() {
  document.querySelectorAll("a[data-project]").forEach(link => {
    const key = link.dataset.project;
    const value = (PROJECTS[key] || "").trim();
    if (!value) return;
    link.href = /^https?:\/\//i.test(value) ? value : "https://" + value;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = false;
    const card = link.closest(".project-card");
    if (card) card.classList.add("is-linked");
    const empty = document.querySelector('[data-project-empty="' + key + '"]');
    if (empty) empty.hidden = true;
  });
}

function applySocials() {
  document.querySelectorAll("[data-social]").forEach(el => {
    const key = el.dataset.social;
    const value = (SOCIALS[key] || "").trim();
    const holder = el.closest(".contact-method") || el;
    if (!value) { holder.hidden = true; return; }
    const isEmail = key === "email";
    el.href = isEmail ? "mailto:" + value : (/^https?:\/\//i.test(value) ? value : "https://" + value);
    if (!isEmail) { el.target = "_blank"; el.rel = "noopener noreferrer"; }
    if (el.hasAttribute("data-social-text")) {
      el.textContent = isEmail ? value : value.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
    }
  });
}

// Shared interactions for all portfolio pages
document.addEventListener("DOMContentLoaded", () => {
  applySocials();
  applyProjects();
  initTilt();
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.innerHTML = isOpen
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navigation.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.innerHTML = '<i class="fa-solid fa-bars"></i>';
      });
    });
  }

  document.querySelectorAll(".year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Small reveal animation for content blocks
  const revealTargets = document.querySelectorAll(
    ".feature-card, .skill-panel, .project-card, .timeline-card, .quote-card, .contact-form"
  );
  revealTargets.forEach(el => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => observer.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("visible"));
  }

  // Contact form: delivers to your inbox via CONTACT_FORM, or falls back to mailto.
  const form = document.getElementById("contactForm");
  if (form) {
    const feedback = document.getElementById("formFeedback");
    const button = form.querySelector("button[type=submit]");
    const endpoint = CONTACT_FORM.endpoint.trim();
    const useService = Boolean(endpoint) && (Boolean(CONTACT_FORM.accessKey.trim()) || !/web3forms/i.test(endpoint));
    if (useService) feedback.textContent = "Your message goes straight to my inbox.";

    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      if (data.get("company_site")) return; // honeypot: bots fill this hidden field

      if (!useService) {
        const recipient = SOCIALS.email;
        if (!recipient) { feedback.textContent = "Contact form is not set up yet."; return; }
        const subject = encodeURIComponent(data.get("subject"));
        const body = encodeURIComponent(`Name: ${data.get("name")}
Email: ${data.get("email")}

${data.get("message")}`);
        feedback.textContent = "Opening your email app…";
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
        return;
      }

      const payload = {
        name: data.get("name"),
        email: data.get("email"),
        subject: "Portfolio message: " + data.get("subject"),
        message: data.get("message")
      };
      if (CONTACT_FORM.accessKey.trim()) payload.access_key = CONTACT_FORM.accessKey.trim();

      const label = button.innerHTML;
      button.disabled = true;
      button.textContent = "Sending…";
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000); // give up after 15 seconds
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || result.success === false) throw new Error(result.message || "HTTP " + res.status);
        form.reset();
        feedback.textContent = "Thank you! Your message was sent. I'll reply to your email soon.";
      } catch (err) {
        console.error("Contact form error:", err);
        const why = err.name === "AbortError" ? "The request timed out." : "Sorry, that didn't send (" + (err.message || "error") + ").";
        feedback.textContent = why + (SOCIALS.email ? " Please email me at " + SOCIALS.email + "." : " Please try again later.");
      } finally {
        clearTimeout(timer);
        button.disabled = false;
        button.innerHTML = label;
      }
    });
  }
});