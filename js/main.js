/* ==========================================================================
   Vy Nguyen — portfolio interactions
   Vanilla JS, no dependencies. Modules:
     theme · header/progress · mobile nav · scrollspy · reveal · counters ·
     pipeline · deck tilt · project filters · case dialog · accordions ·
     timeline details · copy email · toast · back-to-top · contact form
   Every animated behaviour respects prefers-reduced-motion.
   ========================================================================== */

(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;

  /* ------------------------------ THEME ------------------------------ */
  const themeToggle = $('#theme-toggle');
  const themeMetas = $$('meta[name="theme-color"]');
  const THEME_BG = { light: '#FAF6F0', dark: '#171310' };

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    themeMetas.forEach((m) => { m.content = THEME_BG[theme]; });
    if (themeToggle) {
      const dark = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(dark));
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    if (persist) {
      try { localStorage.setItem('vn-theme', theme); } catch (e) { /* private mode */ }
    }
  }

  applyTheme(root.dataset.theme === 'dark' ? 'dark' : 'light', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ------------------------- HEADER + SCROLL PROGRESS ------------------------- */
  const header = $('.site-header');
  const progressBar = $('#scroll-progress-bar');
  let scrollTicking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 4);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    scrollTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ------------------------------ MOBILE NAV ------------------------------ */
  const burger = $('#nav-burger');
  const navMenu = $('#nav-menu');

  function setMenu(open) {
    if (!burger || !navMenu) return;
    navMenu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && navMenu) {
    burger.addEventListener('click', () => setMenu(!navMenu.classList.contains('is-open')));
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) setMenu(false);
    });
  }

  /* ------------------------------ SCROLLSPY ------------------------------ */
  const navLinks = $$('.nav-link');
  const spyTargets = navLinks
    .map((link) => {
      const href = link.getAttribute('href') || '';
      /* only same-page anchors participate in scrollspy — page links like /ielts don't */
      return href.startsWith('#') && href.length > 1 ? $(href) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spyTargets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spyTargets.forEach((sec) => spy.observe(sec));
  }

  /* ------------------------------ REVEAL ON SCROLL ------------------------------ */
  const revealEls = $$('.reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    revealEls.forEach((el) => revealer.observe(el));
  }

  /* ------------------------------ ANIMATED COUNTERS ------------------------------ */
  const counters = $$('.stat-num');
  const nf = new Intl.NumberFormat('en-AU');

  function renderCount(el, value) {
    el.textContent = el.dataset.format === 'comma' ? nf.format(value) : String(value);
  }

  if (counters.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    counters.forEach((el) => renderCount(el, 0));
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        countObserver.unobserve(el);
        el._animated = true;
        const target = parseInt(el.dataset.count, 10) || 0;
        const duration = 1300;
        const start = performance.now();
        (function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3); /* easeOutCubic */
          renderCount(el, Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countObserver.observe(el));
  }

  /* Safety net: if observers never deliver (hidden embedders, odd browsers,
     print), force-reveal everything so content can never stay invisible. */
  function forceRevealAll() {
    revealEls.forEach((el) => el.classList.add('in-view'));
    counters.forEach((el) => {
      if (!el._animated) renderCount(el, parseInt(el.dataset.count, 10) || 0);
    });
  }
  window.addEventListener('beforeprint', forceRevealAll);
  window.setTimeout(() => {
    if (!document.querySelector('.reveal.in-view')) forceRevealAll();
  }, 2500);

  /* ------------------------------ HERO PIPELINE ------------------------------ */
  const pipeline = $('#pipeline');
  if (pipeline) {
    const steps = $$('.pipe-step', pipeline);
    let litIndex = -1;
    let cycleTimer = null;
    let paused = false;

    function light(index) {
      steps.forEach((s, i) => s.classList.toggle('is-lit', i === index));
    }
    function startCycle() {
      if (reduceMotion.matches || cycleTimer) return;
      cycleTimer = window.setInterval(() => {
        if (paused) return;
        litIndex = (litIndex + 1) % steps.length;
        light(litIndex);
      }, 1900);
    }
    function closeTips(except) {
      steps.forEach((s) => { if (s !== except) s.setAttribute('aria-expanded', 'false'); });
    }

    pipeline.addEventListener('pointerenter', () => { paused = true; });
    pipeline.addEventListener('pointerleave', () => { paused = false; });
    pipeline.addEventListener('focusin', () => { paused = true; });
    pipeline.addEventListener('focusout', () => { paused = false; });

    steps.forEach((step) => {
      step.addEventListener('click', () => {
        const open = step.getAttribute('aria-expanded') === 'true';
        closeTips(step);
        step.setAttribute('aria-expanded', String(!open));
      });
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.pipe-step')) closeTips(null);
    });

    startCycle();
  }

  /* ------------------------------ DECK TILT ------------------------------ */
  const deck = $('#deck');
  if (deck && !reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    const cards = $$('.deck-card', deck);
    const depths = [0.5, 0.75, 1.15]; /* back → front */

    deck.addEventListener('pointermove', (e) => {
      const rect = deck.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      cards.forEach((card, i) => {
        const d = depths[i] || 1;
        card.style.transition = 'transform 0.16s ease-out';
        card.style.transform =
          'rotateX(' + (-dy * 6 * d).toFixed(2) + 'deg) rotateY(' + (dx * 8 * d).toFixed(2) + 'deg)';
      });
    });
    deck.addEventListener('pointerleave', () => {
      cards.forEach((card) => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 0.7, 0.3, 1)';
        card.style.transform = '';
      });
    });
  }

  /* ------------------------------ PROJECT FILTERS ------------------------------ */
  const filterChips = $$('.filter-chip');
  const projectCards = $$('.project-card');

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      filterChips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      projectCards.forEach((card) => {
        const cats = (card.dataset.cats || '').split(/\s+/);
        const show = filter === 'all' || cats.includes(filter);
        window.clearTimeout(card._filterTimer);
        if (show) {
          card.classList.remove('is-hidden');
          requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-hiding')));
        } else {
          card.classList.add('is-hiding');
          card._filterTimer = window.setTimeout(() => card.classList.add('is-hidden'), 220);
        }
      });
    });
  });

  /* ------------------------------ CASE STUDY DIALOG ------------------------------ */
  const dialog = $('#case-dialog');
  const dialogContent = $('#case-content');
  let lastFocused = null;

  function openCase(templateId, trigger) {
    if (!dialog || !dialogContent) return;
    const template = document.getElementById(templateId);
    if (!template) return;
    dialogContent.replaceChildren(template.content.cloneNode(true));
    lastFocused = trigger || null;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      const frame = $('.case-dialog-frame', dialog);
      if (frame) frame.scrollTop = 0;
      const closeBtn = $('#case-close');
      if (closeBtn) closeBtn.focus();
    } else {
      /* ancient browser fallback: jump to the repo link instead */
      const repo = $('a[href^="https://github.com"]', template.content);
      if (repo) window.open(repo.href, '_blank', 'noopener');
    }
  }

  $$('.case-open').forEach((btn) => {
    btn.addEventListener('click', () => openCase(btn.dataset.case, btn));
  });

  function closeCase() {
    if (dialog.open) dialog.close();
    document.body.style.overflow = '';
    if (dialogContent) dialogContent.replaceChildren();
    if (lastFocused) { lastFocused.focus(); lastFocused = null; }
  }

  if (dialog) {
    $('#case-close').addEventListener('click', closeCase);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeCase(); /* backdrop click */
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeCase(); }
    });
    /* Esc / browser-initiated closes also land here; closeCase is idempotent */
    dialog.addEventListener('close', closeCase);
    dialog.addEventListener('cancel', () => window.setTimeout(closeCase, 0));
  }

  /* ------------------------------ SKILLS ACCORDION ------------------------------ */
  $$('.skill-group').forEach((group) => {
    const head = $('.skill-head', group);
    if (!head) return;
    if (head.getAttribute('aria-expanded') === 'true') group.classList.add('is-open');
    head.addEventListener('click', () => {
      const open = head.getAttribute('aria-expanded') === 'true';
      head.setAttribute('aria-expanded', String(!open));
      group.classList.toggle('is-open', !open);
    });
  });

  /* ------------------------------ TIMELINE DETAILS ------------------------------ */
  $$('.tl-more').forEach((btn) => {
    const detail = btn.nextElementSibling;
    if (!detail || !detail.classList.contains('tl-detail')) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.textContent = open ? 'Details' : 'Hide details';
      detail.classList.toggle('is-open', !open);
    });
  });

  /* ------------------------------ TOAST ------------------------------ */
  const toast = $('#toast');
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-shown');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-shown'), 2600);
  }

  /* ------------------------------ COPY EMAIL ------------------------------ */
  const copyBtn = $('#copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        showToast('Email copied — talk soon.');
      } catch (err) {
        window.location.href = 'mailto:' + email;
      }
    });
  }

  /* ------------------------------ BACK TO TOP ------------------------------ */
  const toTop = $('#to-top');
  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------ CONTACT FORM ------------------------------ */
  const form = $('#contact-form');
  const formStatus = $('#form-status');

  if (form && formStatus) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const submitBtn = $('button[type="submit"]', form);
      const data = new FormData(form);
      formStatus.className = 'form-status';
      formStatus.textContent = 'Sending…';
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString()
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        formStatus.classList.add('is-ok');
        formStatus.textContent = 'Thanks — your message is on its way. I reply within one business day.';
      } catch (err) {
        /* Not on Netlify (or offline): degrade to the visitor's mail app. */
        formStatus.classList.add('is-err');
        formStatus.textContent = "Couldn't send from here — opening your email app instead.";
        const subject = encodeURIComponent('Hello from your portfolio — ' + (data.get('name') || ''));
        const body = encodeURIComponent(String(data.get('message') || '') + '\n\n— ' + (data.get('name') || '') + ' (' + (data.get('email') || '') + ')');
        window.location.href = 'mailto:tonynguyen1996.jb@gmail.com?subject=' + subject + '&body=' + body;
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();
