/**
 * Entry point — loads the Excel-generated JSON and renders every section
 * in the chosen language (English / Telugu).
 */
import { loadSiteData } from './data-loader.js';
import { initNavigation } from './navigation.js';
import { renderContent } from './content.js';
import { renderServices } from './services.js';
import { initBooking } from './booking.js';
import { t, getLanguage, setLanguage, initialLanguage, localizeData } from './i18n.js';
import { $, h, observeReveal } from './utils.js';

let rawData = null;
let view = null;
let booking = null;

function showLoadError(error) {
  console.error(error);
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
  $('#main').prepend(
    h(
      'div',
      { class: 'container', style: 'padding-top: calc(var(--header-h) + 2rem)' },
      h('div', { class: 'load-error', role: 'alert' }, h('p', {}, t('load.error1')), h('p', {}, t('load.error2')))
    )
  );
}

/** The toggle always offers the *other* language, written in that language. */
function updateLanguageToggle() {
  const other = getLanguage() === 'te' ? 'en' : 'te';
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.lang = other === 'te' ? 'te' : 'en';
    btn.dataset.target = other;
  });
}

function render(lang, { remember = false } = {}) {
  setLanguage(lang, { remember }); // also translates the static HTML labels
  view = localizeData(rawData, lang);
  const servicesController = renderServices(view);
  renderContent({ ...view, servicesController });
  booking?.refresh();
  updateLanguageToggle();
}

async function init() {
  // Apply a previously chosen language straight away so the header doesn't flash in English
  setLanguage(initialLanguage(), { remember: false });
  updateLanguageToggle();
  initNavigation();

  try {
    rawData = await loadSiteData();
  } catch (error) {
    showLoadError(error);
    return;
  }

  render(initialLanguage(rawData.settings.defaultLanguage));
  booking = initBooking(() => view);

  document.querySelectorAll('[data-lang-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => render(btn.dataset.target, { remember: true }))
  );

  document.body.classList.remove('is-loading');
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
  observeReveal();

  // Honour a deep link such as /#contact once content has been rendered
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

init();
