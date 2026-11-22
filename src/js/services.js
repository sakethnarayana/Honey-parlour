/**
 * Services & prices: cards grouped by category (photo cards on desktop,
 * compact rate-card rows on phones — see responsive.css), with category filters.
 * Safe to call again after a language switch.
 */
import { $, h, icon, createImage, formatPrice, groupBy, slugify, renderFilterChips } from './utils.js';
import { t } from './i18n.js';

const CARD_SIZES = '(max-width: 760px) 72px, (max-width: 1100px) 50vw, 400px';

function serviceCard(service, index) {
  const frame = h(
    'div',
    { class: 'img-frame' },
    createImage({ src: service.image, alt: service.name, position: service.imagePosition, sizes: CARD_SIZES })
  );

  return h(
    'article',
    { class: `service-card${service.featured ? ' is-featured' : ''}`, style: `--i:${index}` },
    service.featured ? h('span', { class: 'badge' }, icon('i-diamond'), t('services.popular')) : null,
    frame,
    h(
      'div',
      { class: 'service-body' },
      h('span', { class: 'service-cat' }, service.categoryLabel),
      service.featured ? h('span', { class: 'service-popular' }, `★ ${t('services.popular')}`) : null,
      h('h4', { class: 'service-name' }, service.name),
      service.description ? h('p', { class: 'service-desc' }, service.description) : h('span', { class: 'service-desc' }),
      h(
        'div',
        { class: 'service-foot' },
        h('p', { class: 'price' }, h('small', {}, t('services.price')), formatPrice(service.price)),
        h(
          'button',
          { type: 'button', class: 'link-arrow book-btn', 'data-open-booking': '', 'data-service': service.id, 'aria-label': t('services.bookAria', { name: service.name }) },
          t('services.book'),
          icon('i-arrow')
        )
      )
    )
  );
}

/**
 * Renders category groups of service cards plus the filter chips.
 * Returns a controller with selectCategory(), used by footer links.
 */
export function renderServices({ services, categories, categoryLabel }) {
  const container = $('[data-services]');
  const filters = $('[data-service-filters]');
  if (!container) return null;

  if (!services.length) {
    container.replaceChildren(h('p', { class: 'section-intro', style: 'text-align:center' }, t('services.empty')));
    filters?.replaceChildren();
    return null;
  }

  const grouped = groupBy(services, 'category');
  const groups = categories.map((category) => {
    const items = grouped.get(category) || [];
    return h(
      'section',
      { class: 'service-group', id: `services-${slugify(category)}`, dataset: { category }, 'aria-label': categoryLabel(category) },
      h(
        'header',
        { class: 'service-group-head' },
        h('h3', { class: 'service-group-title' }, categoryLabel(category)),
        h('span', { class: 'service-group-count' }, items.length === 1 ? t('services.count.one') : t('services.count.other', { n: items.length }))
      ),
      // Small groups get a roomier layout instead of leaving empty grid cells
      h('div', { class: `service-grid${items.length < 3 ? ` service-grid--${items.length}` : ''}` }, items.map(serviceCard))
    );
  });
  container.replaceChildren(...groups);

  const counts = new Map([...grouped].map(([k, v]) => [k, v.length]));
  const chips = filters
    ? renderFilterChips(
        filters,
        categories,
        counts,
        (category) => {
          groups.forEach((g) => {
            const show = !category || g.dataset.category === category;
            g.hidden = !show;
            // Restart the entrance animation for newly shown cards
            if (show)
              g.querySelectorAll('.service-card').forEach((c) => {
                c.style.animation = 'none';
                void c.offsetWidth;
                c.style.animation = '';
              });
          });
        },
        { allLabel: t('services.all'), labelFor: categoryLabel }
      )
    : null;

  return {
    selectCategory(category) {
      // Phones hide the filter chips, so jump to the group instead of filtering
      if (!chips || window.matchMedia('(max-width: 760px)').matches) {
        chips?.select(null);
        document.getElementById(`services-${slugify(category)}`)?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      chips.select(category);
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
    },
  };
}
