/**
 * Renders everything that comes from the "Website Settings" sheet:
 * brand, hero, contact, quick-action bar, social links, footer and page metadata.
 * Receives already-localised data (see localizeData in i18n.js) and is safe to re-run.
 */
import { $, $$, h, fill, icon, createImage, formatPrice, whatsappLink } from './utils.js';
import { t } from './i18n.js';

function setMeta(selector, value) {
  const el = document.head.querySelector(selector);
  if (el && value) el.setAttribute('content', value);
}

function renderBrand(settings) {
  const [first, ...rest] = settings.parlourName.trim().split(/\s+/);
  $$('[data-brand]').forEach((el) => {
    fill(
      el,
      h('span', { class: 'brand-mark', 'aria-hidden': 'true' }, first.charAt(0)),
      h('span', { class: 'brand-text' }, h('span', { class: 'brand-name' }, first), rest.length ? h('span', { class: 'brand-sub' }, rest.join(' ')) : null)
    );
    el.setAttribute('aria-label', t('footer.homeAria', { name: settings.parlourName }));
  });
}

/** Simple text bindings: <el data-setting="tagline"> */
function renderTextBindings(settings) {
  $$('[data-setting]').forEach((el) => {
    const value = settings[el.dataset.setting];
    el.hidden = !value;
    if (value) el.textContent = value;
  });
}

function renderHero(settings, services) {
  const [first, ...rest] = settings.parlourName.trim().split(/\s+/);
  fill($('[data-hero-title]'), h('span', { class: 'line' }, first), rest.length ? h('span', { class: 'line line-accent' }, rest.join(' ')) : null);

  const slot = $('[data-image-slot="heroImage"]');
  // Only rebuild the photo when it actually changes (a language switch keeps the same image)
  if (slot && slot.dataset.src !== settings.heroImage) {
    slot.dataset.src = settings.heroImage;
    fill(slot, createImage({ src: settings.heroImage, alt: settings.parlourName, sizes: '(max-width: 960px) 100vw, 460px', eager: true }));
  }

  // Highlights derived from the live data — never hard-coded
  const stats = $('[data-hero-stats]');
  if (services.length) {
    const minPrice = Math.min(...services.map((s) => s.price));
    fill(
      stats,
      [
        [services.length, t('stats.services')],
        [formatPrice(minPrice), t('stats.from')],
      ].map(([value, label]) => h('li', {}, h('span', { class: 'stat-value' }, value), h('span', { class: 'stat-label' }, label)))
    );
  } else stats.hidden = true;

  // Floating card highlights the first featured service
  const featured = services.find((s) => s.featured);
  const card = $('[data-hero-card]');
  if (featured && card) {
    fill(
      card,
      h('span', { class: 'hero-card-img img-frame' }, createImage({ src: featured.image, alt: '', position: featured.imagePosition, sizes: '60px' })),
      h(
        'span',
        {},
        h('span', { class: 'hero-card-label' }, t('hero.popular')),
        h('span', { class: 'hero-card-name' }, featured.name),
        h('span', { class: 'hero-card-price' }, formatPrice(featured.price))
      )
    );
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Book ${featured.name}, ${formatPrice(featured.price)}`);
    card.dataset.openBooking = '';
    card.dataset.service = featured.id;
    card.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    };
    card.hidden = false;
  }
}

/** The address may use "|" for line breaks (e.g. "Flat 302, 3rd Floor | Sai Teja Home | …"). */
const addressLines = (settings) => String(settings.address || '').split('|').map((s) => s.trim()).filter(Boolean);

function renderContact(settings) {
  const { phones, whatsapp } = settings;
  const waUrl = whatsapp ? whatsappLink(whatsapp.international, settings.whatsappMessage) : '';
  const mainPhone = phones[0];

  // Every WhatsApp button / every "Call" button on the page
  $$('[data-whatsapp-link]').forEach((a) => {
    a.hidden = !waUrl;
    if (waUrl) a.href = waUrl;
  });
  $$('[data-call-link]').forEach((a) => {
    a.hidden = !mainPhone;
    if (mainPhone) {
      a.href = `tel:${mainPhone.tel}`;
      a.setAttribute('aria-label', t('contact.callAria', { number: mainPhone.display }));
    }
  });

  fill($('[data-contact-phones]'), phones.map((p) => h('li', {}, h('a', { href: `tel:${p.tel}`, 'aria-label': t('contact.callAria', { number: p.display }) }, p.display))));

  const wa = $('[data-contact-whatsapp]');
  if (whatsapp) {
    fill(wa, h('a', { href: waUrl, target: '_blank', rel: 'noopener' }, whatsapp.display), h('span', { class: 'muted' }, t('contact.whatsappNote')));
  } else wa.closest('.contact-row').hidden = true;

  fill(
    $('[data-contact-address]'),
    addressLines(settings).length
      ? h('address', { class: 'contact-address' }, addressLines(settings).map((line) => h('span', {}, line)))
      : h('span', {}, t('contact.noAddress')),
    settings.mapUrl
      ? h('a', { class: 'btn btn-outline btn-sm map-btn', href: settings.mapUrl, target: '_blank', rel: 'noopener' }, icon('i-pin'), t('contact.directions'))
      : null
  );

  const hours = $('[data-contact-hours]');
  hours.closest('.contact-row').hidden = !settings.openingHours.length;
  fill(hours, settings.openingHours.map((line) => h('span', {}, line)));

  // Contact shortcuts inside the mobile menu
  fill($('[data-nav-contact]'), phones.map((p) => h('a', { href: `tel:${p.tel}` }, icon('i-phone'), p.display)));

  // The mobile quick-action bar needs at least one way to reach the parlour
  const bar = $('[data-action-bar]');
  if (bar) bar.hidden = !(mainPhone || waUrl);
}

function renderSocial(settings) {
  const links = [
    ['instagram', 'Instagram', 'i-instagram'],
    ['facebook', 'Facebook', 'i-facebook'],
  ].filter(([key]) => settings.social[key]);

  $$('[data-social]').forEach((row) => {
    if (!links.length) {
      row.hidden = true;
      return;
    }
    fill(
      row,
      links.map(([key, label, ic]) =>
        h('a', { class: 'social-link', href: settings.social[key], target: '_blank', rel: 'noopener', 'aria-label': t('social.aria', { name: settings.parlourName, network: label }) }, icon(ic))
      )
    );
  });
}

function renderFooter(settings, categories, categoryLabel, servicesController, imageSources) {
  fill(
    $('[data-footer-categories]'),
    categories.map((cat) =>
      h(
        'li',
        {},
        h(
          'a',
          {
            href: '#services',
            onclick: (e) => {
              if (!servicesController) return;
              e.preventDefault();
              servicesController.selectCategory(cat);
            },
          },
          categoryLabel(cat)
        )
      )
    )
  );

  fill(
    $('[data-footer-contact]'),
    settings.phones.map((p) => h('li', {}, h('a', { href: `tel:${p.tel}` }, p.display))),
    settings.whatsapp
      ? h('li', {}, h('a', { href: whatsappLink(settings.whatsapp.international, settings.whatsappMessage), target: '_blank', rel: 'noopener' }, t('footer.whatsappUs')))
      : null,
    addressLines(settings).length
      ? h('li', {}, settings.mapUrl
          ? h('a', { href: settings.mapUrl, target: '_blank', rel: 'noopener' }, addressLines(settings).join(', '))
          : h('span', {}, addressLines(settings).join(', ')))
      : null
  );

  $('[data-copyright]').textContent = `© ${new Date().getFullYear()} ${settings.parlourName}. ${t('footer.rights')}`;

  // Credit the photo libraries actually used in the workbook
  const libraries = ['Unsplash', 'Pexels', 'Pixabay'].filter((lib) => imageSources.some((s) => s.toLowerCase().includes(lib.toLowerCase())));
  const credit = $('[data-photo-credit]');
  if (credit) {
    if (libraries.length) credit.textContent = `${t('footer.photos')}: ${libraries.join(' & ')}`;
    else credit.hidden = true;
  }
}

export function renderContent({ settings, services, categories, categoryLabel, servicesController }) {
  document.title = `${settings.parlourName} — ${settings.tagline}`;
  setMeta('meta[name="description"]', settings.heroIntro);
  setMeta('meta[property="og:title"]', document.title);
  setMeta('meta[property="og:description"]', settings.heroIntro);

  renderBrand(settings);
  renderTextBindings(settings);
  renderHero(settings, services);
  renderContact(settings);
  renderSocial(settings);

  const imageSources = [...services.map((s) => s.imageSource), settings.heroImageSource].filter(Boolean);
  renderFooter(settings, categories, categoryLabel, servicesController, imageSources);
}
