/**
 * Shared helpers — DOM, formatting, images, WhatsApp links, filters, reveal.
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const FALLBACK_IMAGE = 'assets/images/fallback.svg';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
/** 5000 → "₹5,000" */
export const formatPrice = (amount) => inr.format(amount);

export const slugify = (text) =>
  String(text).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-');

/**
 * Tiny element factory: h('a', { class: 'x', href: '#' }, 'text', childNode)
 * String children become text nodes (never parsed as HTML), so Excel content is always safe.
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value === null || value === undefined) continue;
    if (key === 'class') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

/** Like el.replaceChildren(), but skips null/false entries (replaceChildren would print "null"). */
export function fill(el, ...children) {
  if (!el) return el;
  el.replaceChildren(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
  return el;
}

/** Reference to an icon in the inline SVG sprite. */
export function icon(name, className = 'icon') {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', className);
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(NS, 'use');
  use.setAttribute('href', `#${name}`);
  svg.append(use);
  return svg;
}

/* ---------------- Images ---------------- */

const RESIZABLE_HOSTS = ['images.unsplash.com', 'images.pexels.com'];
const SRCSET_WIDTHS = [480, 800, 1200, 1600, 2400];

/** For CDN images that support ?w=, build a responsive srcset; otherwise return ''. */
export function buildSrcset(url) {
  try {
    const u = new URL(url);
    if (!RESIZABLE_HOSTS.includes(u.hostname)) return '';
    const max = Number(u.searchParams.get('w')) || 2400;
    return SRCSET_WIDTHS.filter((w) => w <= max)
      .map((w) => {
        u.searchParams.set('w', String(w));
        return `${u.toString()} ${w}w`;
      })
      .join(', ');
  } catch {
    return '';
  }
}

/**
 * Creates an <img> with lazy loading, responsive srcset and an automatic fallback
 * when the URL is empty or fails to load.
 */
export function createImage({ src, alt = '', position = 'center', sizes = '100vw', eager = false, className = '' }) {
  const img = document.createElement('img');
  img.alt = alt;
  img.decoding = 'async';
  img.loading = eager ? 'eager' : 'lazy';
  if (eager) img.fetchPriority = 'high';
  if (className) img.className = className;
  img.style.objectPosition = position || 'center';

  const useFallback = () => {
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.classList.add('is-fallback');
    img.src = FALLBACK_IMAGE;
  };

  if (!src) {
    useFallback();
    return img;
  }
  const srcset = buildSrcset(src);
  if (srcset) {
    img.sizes = sizes;
    img.srcset = srcset;
  }
  img.dataset.loading = '';
  img.addEventListener('load', () => delete img.dataset.loading);
  img.addEventListener('error', () => {
    delete img.dataset.loading;
    if (!img.classList.contains('is-fallback')) useFallback();
  });
  img.src = src;
  return img;
}

/* ---------------- Contact helpers ---------------- */

export const whatsappLink = (internationalNumber, message = '') =>
  `https://wa.me/${internationalNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const k = item[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  }
  return map;
}

/* ---------------- Scroll reveal ---------------- */

let revealObserver;
export function observeReveal(root = document) {
  const targets = $$('[data-reveal]:not(.is-visible)', root);
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  revealObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  targets.forEach((el) => revealObserver.observe(el));
}

/* ---------------- Filter chips (shared by services & gallery) ---------------- */

/**
 * Renders "All + categories" chips into `container` and calls onChange(category|null).
 * Arrow keys move between chips (tablist pattern). Safe to call again on re-render
 * (e.g. after a language switch): handlers are assigned, not stacked.
 */
export function renderFilterChips(container, categories, counts, onChange, { allLabel = 'All', labelFor = (c) => c } = {}) {
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const options = [{ label: allLabel, value: '', count: total }, ...categories.map((c) => ({ label: labelFor(c), value: c, count: counts.get(c) || 0 }))];

  const chips = options.map((opt, i) =>
    h(
      'button',
      {
        type: 'button',
        class: `chip${i === 0 ? ' is-active' : ''}`,
        role: 'tab',
        'aria-selected': i === 0 ? 'true' : 'false',
        tabindex: i === 0 ? '0' : '-1',
        dataset: { value: opt.value },
      },
      opt.label,
      h('span', { class: 'chip-count', 'aria-hidden': 'true' }, opt.count)
    )
  );

  const select = (chip, focus = false) => {
    chips.forEach((c) => {
      const active = c === chip;
      c.classList.toggle('is-active', active);
      c.setAttribute('aria-selected', String(active));
      c.tabIndex = active ? 0 : -1;
    });
    if (focus) chip.focus();
    // Keep the active chip visible in a horizontally-scrolling bar
    container.scrollTo?.({ left: chip.offsetLeft - container.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
    onChange(chip.dataset.value || null);
  };

  container.onclick = (e) => {
    const chip = e.target.closest('.chip');
    if (chip) select(chip);
  };
  container.onkeydown = (e) => {
    const idx = chips.indexOf(document.activeElement);
    if (idx < 0) return;
    const next = { ArrowRight: idx + 1, ArrowLeft: idx - 1, Home: 0, End: chips.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(chips[(next + chips.length) % chips.length], true);
  };

  container.replaceChildren(...chips);
  return {
    select(value) {
      const chip = chips.find((c) => c.dataset.value === (value || ''));
      if (chip) select(chip);
    },
  };
}
