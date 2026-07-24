// site.js — marketing-page interactions (hero background, scroll reveals,
// animated stats, testimonial slider). Each block guards on its own
// elements so this file can be safely included on every template.

(function () {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ----------------------------------------------------------------
  // Scroll reveal — GSAP + ScrollTrigger if available, otherwise a
  // plain IntersectionObserver. Either way, .reveal elements end up
  // visible even if neither is available (see the CSS fallback).
  // ----------------------------------------------------------------

  const revealEls = document.querySelectorAll(".reveal");

  if (revealEls.length) {
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    } else if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      revealEls.forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: (i % 4) * 0.06,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("is-visible"));
    }
  }

  // ----------------------------------------------------------------
  // Hero particle network — lightweight canvas, no 3D library.
  // Paused off-screen and skipped entirely under reduced-motion.
  // ----------------------------------------------------------------

  const heroBg = document.querySelector(".hero-particles");

  if (heroBg && !prefersReducedMotion) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    heroBg.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let width, height, dpr;
    let particles = [];
    let running = true;
    let rafId = null;

    const isLight = () =>
      document.documentElement.getAttribute("data-theme") === "light";

    function sizeCanvas() {
      const rect = heroBg.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedParticles() {
      const count = Math.min(60, Math.round((width * height) / 14000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    }

    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      const dotColor = isLight() ? "47,111,237" : "138,155,255";
      const lineColor = isLight() ? "47,111,237" : "180,150,255";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor},0.75)`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${lineColor},${0.16 * (1 - dist / 110)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(step);
    }

    sizeCanvas();
    seedParticles();
    rafId = requestAnimationFrame(step);

    window.addEventListener("resize", () => {
      sizeCanvas();
      seedParticles();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          running = entry.isIntersecting;
          if (running && !rafId) rafId = requestAnimationFrame(step);
          if (!running && rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      }).observe(heroBg);
    }
  }

  // ----------------------------------------------------------------
  // Animated stat counters
  // ----------------------------------------------------------------

  const statEls = document.querySelectorAll("[data-count-to]");

  if (statEls.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute("data-count-to"));
      const suffix = el.getAttribute("data-count-suffix") || "";
      const isInt = Number.isInteger(target);

      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }

      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = (isInt ? Math.round(value) : value.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      statEls.forEach((el) => io.observe(el));
    } else {
      statEls.forEach(animateCount);
    }
  }

  // ----------------------------------------------------------------
  // Testimonial slider
  // ----------------------------------------------------------------

  const track = document.querySelector(".testimonial-track");
  const dotsWrap = document.querySelector(".testimonial-dots");

  if (track && dotsWrap) {
    const cards = Array.from(track.children);
    let index = 0;
    let timer = null;

    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.children);

    function goTo(i) {
      index = (i + cards.length) % cards.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle("active", di === index));
    }

    function autoplay() {
      if (prefersReducedMotion) return;
      timer = setInterval(() => goTo(index + 1), 6000);
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    const slider = document.querySelector(".testimonial-slider");
    if (slider) {
      slider.addEventListener("mouseenter", stopAutoplay);
      slider.addEventListener("mouseleave", autoplay);
      slider.addEventListener("focusin", stopAutoplay);
      slider.addEventListener("focusout", autoplay);
    }

    autoplay();
  }
})();