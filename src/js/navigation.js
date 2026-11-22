/**
 * Sticky header, mobile menu and active-section highlighting.
 */
import { $, $$ } from './utils.js';
import { t } from './i18n.js';

export function initNavigation() {
  const header = $('[data-header]');
  const nav = $('[data-nav]');
  const toggle = $('[data-nav-toggle]');
  const links = $$('.nav-link', nav);
  const waFloat = $('.wa-float');

  /* Header background + floating WhatsApp after scrolling past the fold */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      waFloat?.classList.toggle('is-visible', y > window.innerHeight * 0.6);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'menu.close' : 'menu.open'));
    toggle.dataset.i18nAria = open ? 'menu.close' : 'menu.open';
    document.body.classList.toggle('no-scroll', open);
    if (open) links[0]?.focus({ preventScroll: true });
  };
  const isOpen = () => nav.classList.contains('is-open');

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a, [data-open-booking]') && isOpen()) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  // Close the overlay if the viewport grows to desktop size
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => e.matches && isOpen() && setOpen(false));

  /* Active link follows the section in view */
  const sections = links.map((l) => document.getElementById(l.hash.slice(1))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          links.forEach((l) => {
            const active = l.hash === `#${entry.target.id}`;
            l.classList.toggle('is-active', active);
            if (active) l.setAttribute('aria-current', 'location');
            else l.removeAttribute('aria-current');
          });
        }
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
  }
}
