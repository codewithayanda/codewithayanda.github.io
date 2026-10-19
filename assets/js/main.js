/* Ayanda Biyela — portfolio
   Small, dependency-free enhancements: theme, navigation, reveal-on-scroll,
   screenshot lightbox, GitHub "updated" dates and the contact form. */
(() => {
  'use strict';

  const $ = (selector, ctx = document) => ctx.querySelector(selector);
  const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* storage blocked: ignore */ } },
  };

  // Safari before 14 only has the old addListener API for media-query changes.
  const onMediaChange = (query, handler) => {
    if (query.addEventListener) query.addEventListener('change', handler);
    else if (query.addListener) query.addListener(handler);
  };

  /* ---- Configuration ---------------------------------------------------- */
  const GITHUB_USER = 'codewithayanda';
  const CONTACT_EMAIL = 'biyelaayanda3@gmail.com';
  // EmailJS public identifiers (safe to expose; they only allow sending through the configured template).
  const EMAILJS = { publicKey: 'avQKvDoZKcDK9RwkT', serviceId: 'service_3ghtcsw', templateId: 'template_q4s213f' };

  /* ---- Theme ------------------------------------------------------------ */
  const themeToggle = $('#theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const currentTheme = () => root.dataset.theme || (prefersDark.matches ? 'dark' : 'light');

  const THEME_COLOR = { dark: '#090a0f', light: '#f6f7fb' }; // keep in sync with --bg in styles.css

  const syncThemeUI = () => {
    const theme = currentTheme();
    themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLOR[theme];
  };
  themeToggle?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    storage.set('theme', next);
    syncThemeUI();
  });
  onMediaChange(prefersDark, syncThemeUI);
  syncThemeUI();

  /* ---- Header + mobile navigation --------------------------------------- */
  const header = $('.site-header');
  const nav = $('#site-nav');
  const navToggle = $('#nav-toggle');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setNav = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.querySelector('use').setAttribute('href', open ? '#i-x' : '#i-menu');
  };
  navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
  });
  onMediaChange(window.matchMedia('(min-width: 861px)'), (event) => { if (event.matches) setNav(false); });

  /* ---- Scroll spy ------------------------------------------------------- */
  const navLinks = $$('.nav-link');
  const linkFor = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.removeAttribute('aria-current'));
        linkFor.get(entry.target.id)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', ...linkFor.keys()].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---- Reveal on scroll ------------------------------------------------- */
  const revealEls = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- Card spotlight --------------------------------------------------- */
  document.addEventListener('pointermove', (event) => {
    const card = event.target.closest?.('[data-spot]');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  }, { passive: true });

  /* ---- Screenshot lightbox ---------------------------------------------- */
  const dialog = $('#lightbox');
  if (dialog) {
    const image = $('img', dialog);
    const caption = $('.lb-caption', dialog);
    let group = [];
    let index = 0;

    const show = (i) => {
      index = (i + group.length) % group.length;
      const shot = group[index];
      image.src = shot.dataset.full;
      image.alt = shot.querySelector('img').alt;
      caption.textContent = `${shot.dataset.caption} (${index + 1} of ${group.length})`;
    };

    document.addEventListener('click', (event) => {
      const shot = event.target.closest('.shot');
      if (!shot) return;
      if (typeof dialog.showModal !== 'function') { window.open(shot.dataset.full, '_blank', 'noopener'); return; }
      group = $$(`.shot[data-gallery="${shot.dataset.gallery}"]`);
      show(group.indexOf(shot));
      dialog.showModal();
    });
    $('.lb-prev', dialog).addEventListener('click', () => show(index - 1));
    $('.lb-next', dialog).addEventListener('click', () => show(index + 1));
    $('.lb-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog || event.target.classList.contains('lb-stage')) dialog.close();
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') show(index - 1);
      if (event.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ---- "Updated …" dates from GitHub (progressive enhancement) ----------- */
  const timeAgo = (date) => {
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days < 1) return 'today';
    if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (days < 60) return `${Math.round(days / 7)} weeks ago`;
    return date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
  };

  const loadPushDates = async () => {
    // Anonymous GitHub API calls are limited to 60 an hour per IP, so cache for an hour
    // and fall back to the last known dates if GitHub is rate-limiting or unreachable.
    const cacheKey = 'gh-pushed-v1';
    let cached = null;
    try { cached = JSON.parse(storage.get(cacheKey) || 'null'); } catch { /* ignore */ }
    let rows = cached && Date.now() - cached.at < 60 * 60 * 1000 ? cached.rows : null;

    if (!rows) {
      try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`, {
          headers: { Accept: 'application/vnd.github+json' },
        });
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        rows = (await response.json()).map((repo) => [repo.name, repo.pushed_at]);
        storage.set(cacheKey, JSON.stringify({ at: Date.now(), rows }));
      } catch (error) {
        rows = cached?.rows;
        if (!rows) throw error;
      }
    }

    const pushed = new Map(rows);
    $$('[data-repos]').forEach((card) => {
      const dates = card.dataset.repos.split(' ').map((name) => pushed.get(name)).filter(Boolean).map((d) => new Date(d));
      const target = $('.pc-meta', card);
      if (!dates.length || !target) return;
      const latest = new Date(Math.max(...dates));
      target.textContent = `Updated ${timeAgo(latest)}`;
      target.title = latest.toLocaleDateString('en', { dateStyle: 'long' });
      target.hidden = false;
    });
  };
  loadPushDates().catch(() => { /* offline or rate-limited: the cards simply stay without a date */ });

  /* ---- Footer year ------------------------------------------------------ */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Contact form (EmailJS) ------------------------------------------- */
  const form = $('#contact-form');
  if (form) {
    const status = $('.form-status', form);
    const submit = $('button[type="submit"]', form);
    const submitLabel = submit.textContent;

    // Every outcome shows a message, and the message is scrolled into view (a phone keyboard hides the bottom of the screen).
    const reveal = () => status.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    const say = (message, state = '') => { status.textContent = message; status.dataset.state = state; reveal(); };
    const sayFallback = () => {
      const link = document.createElement('a');
      link.href = `mailto:${CONTACT_EMAIL}`;
      link.textContent = CONTACT_EMAIL;
      status.textContent = '';
      status.append('Sorry, that did not go through. Please email me directly at ', link, '.');
      status.dataset.state = 'error';
      reveal();
    };

    if (window.emailjs) {
      try { window.emailjs.init(EMAILJS.publicKey); } catch (error) { console.warn('EmailJS init failed', error); }
    }

    // A field stops being flagged as soon as it is edited.
    form.addEventListener('input', (event) => event.target.removeAttribute('aria-invalid'));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // The form has novalidate, so we show our own message: the browser's pop-ups are easy to miss (or never appear) on phones.
      const invalid = Array.from(form.querySelectorAll(':invalid'));
      if (invalid.length) {
        const field = invalid[0];
        const label = field.labels && field.labels[0] ? field.labels[0].textContent.trim() : 'This field';
        invalid.forEach((f) => f.setAttribute('aria-invalid', 'true'));
        say(`${label}: ${field.validationMessage || 'please check this field.'}`, 'error');
        // With a finger, focusing the field would pop the keyboard up over the message, so only do it with a mouse or keyboard.
        if (window.matchMedia('(pointer: fine)').matches) field.focus();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get('name')).trim();
      submit.disabled = true;
      submit.textContent = 'Sending…';
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); // close the phone keyboard
      say('Sending…');
      try {
        if (!window.emailjs) throw new Error('EmailJS did not load');
        await window.emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, {
          name,
          email: String(data.get('email')).trim(),
          message: String(data.get('message')).trim(),
          subject: `Portfolio message from ${name}`,
        });
        form.reset();
        say('Thanks! Your message is on its way and I will reply soon.', 'ok');
      } catch (error) {
        console.error(error);
        sayFallback();
      } finally {
        submit.disabled = false;
        submit.textContent = submitLabel;
      }
    });
  }
})();
