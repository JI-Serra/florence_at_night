import Lenis from "lenis";

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  lerp: 0.08, // Linear interpolation (smoothness)
  smoothWheel: true, // Smooth scrolling for mouse wheels
  wheelMultiplier: 1.2, // Scrolling speed multiplier
});

// Elements for Parallax
const heroBg = document.querySelector(".hero-bg");
const heroTitle = document.querySelector(".hero-title");
const vbBg = document.querySelector(".vb-bg");
const vbCircles = document.querySelector(".vb-circles");

lenis.on("scroll", (e) => {
  const scrollY = e.scroll;

  // Hero Parallax
  if (heroBg) {
    heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
  }
  if (heroTitle) {
    heroTitle.style.transform = `translateY(${scrollY * 0.15}px)`;
  }

  // Visual Break Parallax
  if (vbBg && vbCircles) {
    const parent = vbBg.parentElement;
    const rect = parent.getBoundingClientRect();
    // Check if in view
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const yOffset = (window.innerHeight - rect.top) * 0.15;
      vbBg.style.transform = `translateY(${yOffset}px)`;
      vbCircles.style.transform = `translateY(${-yOffset * 0.5}px)`;
    }
  }
});

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Smooth scroll for anchor links using Lenis
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      // Prevent scrolling to '#' alone
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        lenis.scrollTo(targetElement, {
          offset: -80, // Offset for the fixed navbar
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
        });
      }
    });
  });
});
// Cursor logic
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;

// Add tracking
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  if (cursor) {
    cursor.style.left = mx - 5 + "px";
    cursor.style.top = my - 5 + "px";
  }
});

function animRing() {
  rx += (mx - rx - 20) * 0.12;
  ry += (my - ry - 20) * 0.12;
  if (ring) {
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
  }
  requestAnimationFrame(animRing);
}
animRing();

// Event Card Video Controller
const eventCards = document.querySelectorAll(".event-card");
eventCards.forEach((card) => {
  const video = card.querySelector("video");
  if (!video) return;

  // Desktop Hover Logic
  card.addEventListener("mouseenter", () => {
    if (window.matchMedia("(pointer: fine)").matches) {
      video.play().catch(() => {});
    }
  });

  card.addEventListener("mouseleave", () => {
    if (window.matchMedia("(pointer: fine)").matches) {
      video.pause();
      video.currentTime = 0; // Reset to show the first frame
    }
  });

  // Mobile/Touch Click Logic
  card.addEventListener("click", (e) => {
    // If not a desktop (or if it's a touch device)
    if (!window.matchMedia("(pointer: fine)").matches) {
      // Toggle playing class
      const isPlaying = card.classList.contains("playing");
      
      // Stop all others
      eventCards.forEach(c => {
        c.classList.remove("playing");
        const v = c.querySelector("video");
        if (v) {
          v.pause();
          v.currentTime = 0;
        }
      });

      if (!isPlaying) {
        card.classList.add("playing");
        video.play().catch(() => {});
      }
    }
  });
});

// Interactions (rest of the elements)
document
  .querySelectorAll("a, button, .floor-card, .gallery-cell")
  .forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (cursor && ring) {
        cursor.style.transform = "scale(2.5)";
        ring.style.width = "60px";
        ring.style.height = "60px";
      }
    });
    el.addEventListener("mouseleave", () => {
      if (cursor && ring) {
        cursor.style.transform = "scale(1)";
        ring.style.width = "40px";
        ring.style.height = "40px";
      }
    });
  });

// Particles canvas logic
const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const pts = Array.from({ length: 55 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.2 + 0.3,
    dx: (Math.random() - 0.5) * 0.3,
    dy: -Math.random() * 0.5 - 0.1,
    o: Math.random() * 0.4 + 0.1,
    c: Math.random() > 0.65 ? "#DFAE40" : "#F0EDE6",
  }));

  function drawPts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.o;
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.y < 0) {
        p.y = canvas.height;
        p.x = Math.random() * canvas.width;
      }
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawPts);
  }
  drawPts();
}

// Reveal logic (intersection observer)
const obs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("visible"), i * 60);
        obs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

// Form submit logic — VIP Access section (index page)
const submitBtn = document.getElementById("submitBtn");
if (submitBtn) {
  submitBtn.addEventListener("click", function () {
    const name    = (document.getElementById("vipName")?.value    || "").trim();
    const contact = (document.getElementById("vipContact")?.value || "").trim();
    const clubSel = document.getElementById("vipClub");
    const typeSel = document.getElementById("vipType");
    const club    = clubSel?.value ? clubSel.options[clubSel.selectedIndex].text : "";
    const type    = typeSel?.value ? typeSel.options[typeSel.selectedIndex].text : "";

    // Basic validation
    if (!name || !club) {
      if (!name    && document.getElementById("vipName"))    { document.getElementById("vipName").style.outline    = "1px solid #DFAE40"; setTimeout(() => { document.getElementById("vipName").style.outline    = ""; }, 1500); }
      if (!club    && clubSel)                               { clubSel.style.outline    = "1px solid #DFAE40"; setTimeout(() => { clubSel.style.outline    = ""; }, 1500); }
      return;
    }

    // Build the WhatsApp message
    const lines = [
      "Hello! I'm writing from the Florence at Night website.",
      "",
      `Name: ${name}`,
      contact ? `Contact (Phone / Instagram): ${contact}` : null,
      `Club: ${club}`,
      type    ? `Reservation type: ${type}` : null,
      "",
      "I'd like to request a reservation. Thank you!",
    ].filter(l => l !== null).join("\n");

    const phone = "393409596084"; // +39 340 959 6084 (no + or spaces)
    const url   = `https://wa.me/${phone}?text=${encodeURIComponent(lines)}`;

    // Visual feedback, then open WhatsApp
    this.textContent = "Opening WhatsApp… ✓";
    this.style.background = "#3a2a07";
    this.style.color = "#DFAE40";

    window.open(url, "_blank");

    setTimeout(() => {
      this.textContent = "Get on the List";
      this.style.background = "";
      this.style.color = "";
    }, 3000);
  });
}

// Dynamic text loader — fetches editable texts from the admin panel
;(async function loadDynamicTexts() {
  try {
    const res = await fetch('/api/texts')
    if (!res.ok) return
    const texts = await res.json()

    // Update artist name in hero section
    if (texts.artist_name) {
      const name = texts.artist_name
      // Update the main title
      const titleEl = document.querySelector('.sidequest-title')
      if (titleEl) {
        titleEl.textContent = name
        titleEl.setAttribute('data-text', name)
      }
      // Update all ticker spans that had the artist name
      document.querySelectorAll('.main-event-ticker-content span:not(.dot)').forEach((span) => {
        if (span.textContent.trim() !== 'SPACE CLUB' &&
            !span.textContent.trim().match(/^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)/i) &&
            !span.textContent.trim().match(/^\d/)) {
          span.textContent = name
        }
      })
    }
  } catch (_) {
    // Fail silently — static text remains as fallback
  }
})()
