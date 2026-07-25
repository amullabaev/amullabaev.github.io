document.addEventListener('DOMContentLoaded', () => {
  const docEl = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const footerYear = document.getElementById('footer-year');
  const burgerButton = document.getElementById('nav-burger');
  const header = document.querySelector('.site-nav');

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    docEl.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  };

  // 1. Theme (system preference, no localStorage)
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
  themeToggle?.addEventListener('click', () => {
    applyTheme(docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // 2. Footer year
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  // 3. Burger menu
  const isMenuOpen = () => !!header?.classList.contains('nav--open');

  const openMenu = () => {
    header?.classList.add('nav--open');
    if (burgerButton) {
      burgerButton.setAttribute('aria-expanded', 'true');
      burgerButton.setAttribute('aria-label', 'Close menu');
    }
  };

  const closeMenu = () => {
    header?.classList.remove('nav--open');
    if (burgerButton) {
      burgerButton.setAttribute('aria-expanded', 'false');
      burgerButton.setAttribute('aria-label', 'Open menu');
    }
  };

  closeMenu();

  burgerButton?.addEventListener('click', () => { isMenuOpen() ? closeMenu() : openMenu(); });
  document.addEventListener('click', e => {
    if (isMenuOpen() && header && !header.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isMenuOpen()) closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });

  // 4. Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      closeMenu();
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // 5. Active nav
  const sectionIds = ['resume', 'about', 'skills', 'experience', 'other', 'projects', 'contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = sectionIds.map(id => ({ id, links: document.querySelectorAll(`a[href="#${id}"]`) }));
  const ratios = {};

  const setActive = activeId => {
    navLinks.forEach(({ id, links }) => {
      links.forEach(a => a.classList.toggle('is-active', id === activeId));
    });
  };

  if (sections.length) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(entry => { ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0; });
      let best = '', bestR = 0.3;
      sections.forEach(s => { const r = ratios[s.id] || 0; if (r > bestR) { bestR = r; best = s.id; } });
      setActive(best);
    }, { threshold: [0, 0.3, 0.5, 0.75, 1] });
    sections.forEach(s => navObs.observe(s));
  }
});
