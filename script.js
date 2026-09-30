/* VISION DES FRÈRES UNIS — interactions, animations & 3D */

(function () {
  "use strict";

  const header = document.querySelector(".site-header");
  const nav = document.getElementById("mainNav");
  const toggle = document.getElementById("navToggle");
  const waFloat = document.querySelector(".wa-float");
  const yearEl = document.getElementById("year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header au scroll ---------- */
  const onScroll = () => {
    const y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 20);
    if (waFloat) waFloat.classList.toggle("show", y > 420);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      document.body.style.overflow = open ? "hidden" : "";
    };

    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.querySelectorAll("a").forEach((l) => l.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 860) setOpen(false); });
  }

  /* ---------- Reveal au scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Lien actif dans la nav ---------- */
  const sections = ["produits", "galerie", "avantages", "pour-qui", "methode", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.main-nav > a[href^="#"]:not(.nav-cta)'));

  if ("IntersectionObserver" in window && sections.length && navLinks.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((l) => {
            l.style.color = l.getAttribute("href") === id ? "var(--blue-700)" : "";
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ============================================================
     3D — Tilt au survol (souris)
     ============================================================ */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const maxTilt = 7;

      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add("tilting");
        el.style.setProperty("--ry", (px * maxTilt * 2).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-py * maxTilt * 2).toFixed(2) + "deg");
      });

      el.addEventListener("pointerleave", () => {
        el.classList.remove("tilting");
        el.style.setProperty("--ry", "0deg");
        el.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ============================================================
     3D — Parallaxe du hero (mosaic + cartes flottantes)
     ============================================================ */
  const hero = document.getElementById("hero");
  const heroVisual = hero && hero.querySelector(".hero-visual");
  if (hero && heroVisual && finePointer && !reduceMotion) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5;
      const my = (e.clientY - r.top) / r.height - 0.5;
      heroVisual.style.setProperty("--hmx", mx.toFixed(3));
      heroVisual.style.setProperty("--hmy", my.toFixed(3));
    });
    hero.addEventListener("pointerleave", () => {
      heroVisual.style.setProperty("--hmx", "0");
      heroVisual.style.setProperty("--hmy", "0");
    });
  }

  /* ============================================================
     Boutons magnétiques
     ============================================================ */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      const strength = 0.28;
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ============================================================
     Parallaxe de la bande photo
     ============================================================ */
  const parallaxEls = Array.from(document.querySelectorAll("[data-parallax]"));
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const factor = parseFloat(el.dataset.parallax) || 0.1;
        const delta = (r.top + r.height / 2 - vh / 2) * factor;
        el.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ============================================================
     Compteurs animés
     ============================================================ */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (reduceMotion) { el.textContent = String(target); return; }
      const dur = 1300;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const co = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run(entry.target);
            co.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach((c) => co.observe(c));
    } else {
      counters.forEach(run);
    }
  }

  /* ============================================================
     Carrousel 3D (coverflow)
     ============================================================ */
  const stage = document.getElementById("carStage");
  if (stage) {
    const items = Array.from(stage.querySelectorAll(".car-item"));
    const prevBtn = document.querySelector(".car-prev");
    const nextBtn = document.querySelector(".car-next");
    const dotsWrap = document.getElementById("carDots");
    let active = Math.min(2, items.length - 1);
    let autoTimer = null;

    const dist = (i) => {
      let off = i - active;
      const half = items.length / 2;
      if (off > half) off -= items.length;
      if (off < -half) off += items.length;
      return off;
    };

    const render = () => {
      const step = Math.max(150, Math.min(330, stage.clientWidth * 0.4));
      items.forEach((item, i) => {
        const off = dist(i);
        const a = Math.abs(off);
        const x = off * step;
        const z = a === 0 ? 30 : -a * 150;
        const rotY = -off * 26;
        const scale = 1 - a * 0.07;
        item.style.transform =
          `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) scale(${Math.max(scale, .5)})`;
        item.classList.toggle("is-active", a === 0);
        item.classList.toggle("is-near", a === 1);
        item.classList.toggle("is-far", a === 2);
        item.classList.toggle("is-hidden", a > 2);
        item.setAttribute("aria-hidden", a === 0 ? "false" : "true");
        item.style.zIndex = String(10 - a);
      });
      if (dotsWrap) {
        dotsWrap.querySelectorAll(".car-dot").forEach((d, i) => {
          d.classList.toggle("is-active", i === active);
          d.setAttribute("aria-selected", i === active ? "true" : "false");
        });
      }
    };

    const go = (i) => {
      active = ((i % items.length) + items.length) % items.length;
      render();
    };

    if (dotsWrap) {
      items.forEach((_, i) => {
        const d = document.createElement("button");
        d.type = "button";
        d.className = "car-dot";
        d.setAttribute("role", "tab");
        d.setAttribute("aria-label", "Image " + (i + 1));
        d.addEventListener("click", () => { go(i); restartAuto(); });
        dotsWrap.appendChild(d);
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => { go(active - 1); restartAuto(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { go(active + 1); restartAuto(); });

    /* clavier */
    stage.setAttribute("tabindex", "0");
    stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { go(active - 1); restartAuto(); }
      if (e.key === "ArrowRight") { go(active + 1); restartAuto(); }
    });

    /* swipe tactile */
    let startX = null;
    stage.addEventListener("pointerdown", (e) => { startX = e.clientX; }, { passive: true });
    stage.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 45) { go(active + (dx < 0 ? 1 : -1)); restartAuto(); }
      startX = null;
    }, { passive: true });

    /* autoplay */
    const startAuto = () => {
      if (reduceMotion || items.length < 2) return;
      autoTimer = window.setInterval(() => go(active + 1), 4500);
    };
    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
    function restartAuto() { stopAuto(); startAuto(); }

    const region = document.getElementById("carousel3d");
    if (region) {
      region.addEventListener("pointerenter", stopAuto);
      region.addEventListener("pointerleave", startAuto);
      region.addEventListener("focusin", stopAuto);
      region.addEventListener("focusout", startAuto);
    }

    window.addEventListener("resize", render);
    render();
    startAuto();
  }
})();
