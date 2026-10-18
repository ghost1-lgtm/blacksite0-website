(() => {
  'use strict';
  document.getElementById('year').textContent = new Date().getFullYear();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Retain the three approved presets and the existing saved preference key.
  const fontButtons = [...document.querySelectorAll('[data-font-choice]')];
  const optionalFonts = {
    hacker: 'Courier+Prime:wght@400;700',
    developer: 'JetBrains+Mono:wght@400;500;600;700;800'
  };
  function selectFont(mode) {
    if (!['terminal', 'hacker', 'developer'].includes(mode)) mode = 'terminal';
    if (optionalFonts[mode] && !document.getElementById(`font-${mode}`)) {
      const link = document.createElement('link');
      link.id = `font-${mode}`;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${optionalFonts[mode]}&display=swap`;
      document.head.append(link);
    }
    document.body.dataset.fontMode = mode;
    fontButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.fontChoice === mode)));
    try { localStorage.setItem('blacksite0-preview-font-mode', mode); } catch { /* Storage is optional. */ }
  }
  fontButtons.forEach(button => {
    button.addEventListener('click', () => selectFont(button.dataset.fontChoice));
    button.disabled = false;
  });
  try { selectFont(localStorage.getItem('blacksite0-preview-font-mode') || 'terminal'); }
  catch { selectFont('terminal'); }

  const menu = document.getElementById('menuToggle');
  const links = document.getElementById('navlinks');
  const mobile = window.matchMedia('(max-width: 1000px)');
  function setMenu(open, restoreFocus = false) {
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.textContent = open ? '✕' : '☰';
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    setMenu(false);
    if (mobile.matches) {
      const section = document.getElementById(link.hash.slice(1));
      section?.setAttribute('tabindex', '-1');
      section?.focus({ preventScroll: true });
    }
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && links.classList.contains('open')) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (links.classList.contains('open') && !links.contains(event.target) && !menu.contains(event.target)) {
      setMenu(false, links.contains(document.activeElement));
    }
  });
  mobile.addEventListener('change', () => setMenu(false));
  document.querySelectorAll('[data-package]').forEach(link => link.addEventListener('click', () => {
    const context = document.getElementById('packageContext');
    context.textContent = `Package of interest: ${link.dataset.package}. Please mention this in the Google Form's Project Description.`;
    context.hidden = false;
  }));

  const faqItems = [...document.querySelectorAll('.faq-item')];
  function setFaq(item, open) {
    item.classList.toggle('open', open);
    item.querySelector('.faq-q').setAttribute('aria-expanded', String(open));
    item.querySelector('.faq-q span').textContent = open ? '−' : '+';
    item.querySelector('.faq-a').hidden = !open;
  }
  faqItems.forEach(item => {
    const button = item.querySelector('.faq-q');
    setFaq(item, item.classList.contains('open'));
    button.disabled = false;
    button.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      faqItems.forEach(other => setFaq(other, other === item && !wasOpen));
    });
  });

  // Content is readable before JS and when observers are unavailable.
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('reveal-pending');
      observer.observe(element);
    });
  }

  // Preserve the supplied prototype values and zero-padding. Never infer verification.
  const counters = document.querySelectorAll('.count[data-target]');
  function runCount(element) {
    const target = Number(element.dataset.target);
    const padded = element.textContent.trim().startsWith('0');
    const display = value => { element.textContent = padded ? String(value).padStart(2, '0') : String(value); };
    if (motion.matches) { display(target); return; }
    const start = performance.now();
    function tick(now) {
      const progress = motion.matches ? 1 : Math.min((now - start) / 1100, 1);
      display(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { runCount(entry.target); observer.unobserve(entry.target); }
    }), { threshold: 0.35 });
    counters.forEach(element => observer.observe(element));
  } else { counters.forEach(runCount); }

})();
