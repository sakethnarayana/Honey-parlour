/**
 * Language support (English / Telugu).
 *
 * - Business content (services, categories, settings) is translated in the Excel workbook.
 * - This file holds only the interface labels: buttons, form fields, messages.
 *
 * Static HTML uses:  data-i18n="key"              → textContent
 *                    data-i18n-placeholder="key"  → placeholder
 *                    data-i18n-aria="key"         → aria-label
 */
export const LANGUAGES = ['en', 'te'];
const STORAGE_KEY = 'hbp-language';

const STRINGS = {
  en: {
    'skip': 'Skip to content',
    'nav.home': 'Home',
    'nav.services': 'Services & Prices',
    'nav.contact': 'Contact',
    'nav.main': 'Main navigation',
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',
    'lang.switchTo': 'తెలుగు',
    'lang.switchAria': 'తెలుగులో చూడండి — View in Telugu',

    'cta.book': 'Book Appointment',
    'hero.seeServices': 'See Services & Prices',
    'hero.callNow': 'Call Now',
    'hero.popular': 'Popular service',
    'stats.services': 'Services',
    'stats.from': 'Prices from',

    'services.eyebrow': 'Our Services',
    'services.title1': 'Services &',
    'services.title2': 'Prices',
    'services.filterAria': 'Filter services by category',
    'services.all': 'All',
    'services.count.one': '1 service',
    'services.count.other': '{n} services',
    'services.popular': 'Popular',
    'services.price': 'Price',
    'services.book': 'Book',
    'services.bookAria': 'Book {name}',
    'services.empty': 'Our service list is being updated. Please call us for details.',

    'contact.eyebrow': 'Contact',
    'contact.title1': 'Visit',
    'contact.title2': 'Us',
    'contact.callUs': 'Call us',
    'contact.callAria': 'Call {number}',
    'contact.whatsappUs': 'WhatsApp Us',
    'contact.whatsapp': 'WhatsApp',
    'contact.whatsappNote': 'Message us to ask or to book',
    'contact.address': 'Address',
    'contact.noAddress': 'Please call us for our address.',
    'contact.directions': 'Open in Google Maps',
    'contact.hours': 'Opening hours',
    'social.aria': '{name} on {network}',

    'footer.explore': 'Explore',
    'footer.services': 'Services',
    'footer.touch': 'Get in Touch',
    'footer.whatsappUs': 'WhatsApp us',
    'footer.rights': 'All rights reserved.',
    'footer.photos': 'Photography',
    'footer.homeAria': '{name} — home',

    'action.aria': 'Quick contact',
    'action.call': 'Call',
    'action.whatsapp': 'WhatsApp',
    'action.book': 'Book',
    'wa.float': 'Chat on WhatsApp',

    'modal.eyebrow': 'Appointment Enquiry',
    'modal.title1': 'Book Your',
    'modal.title2': 'Visit',
    'modal.close': 'Close',
    'form.name': 'Your name',
    'form.namePh': 'e.g. Lakshmi',
    'form.phone': 'Phone number',
    'form.phonePh': '10-digit mobile number',
    'form.service': 'Service you want',
    'form.selectService': 'Select a service',
    'form.unsure': 'Not sure yet — please advise',
    'form.date': 'Which day?',
    'form.message': 'Anything else? (optional)',
    'form.messagePh': 'Preferred time, number of people, look you have in mind…',
    'form.submit': 'Send on WhatsApp',
    'form.footnote': 'WhatsApp will open with your details filled in. Just press send.',
    'err.name': 'Please enter your name.',
    'err.phone': 'Please enter a valid 10-digit mobile number.',
    'err.service': 'Please choose a service.',
    'err.date': 'Please choose a day.',
    'err.pastDate': 'Please choose today or a later day.',
    'err.noWhatsapp': 'WhatsApp booking is not available right now — please call us instead.',

    'msg.greeting': 'Hello {name}! I would like to book an appointment.',
    'msg.name': 'Name',
    'msg.phone': 'Phone',
    'msg.service': 'Service',
    'msg.date': 'Preferred date',
    'msg.message': 'Message',
    'msg.closing': 'Please confirm the time. Thank you!',

    'load.error1': 'Sorry — we could not load our services right now.',
    'load.error2': 'Please refresh the page in a moment.',
  },

  te: {
    'skip': 'కంటెంట్‌కు వెళ్ళండి',
    'nav.home': 'హోమ్',
    'nav.services': 'సేవలు & ధరలు',
    'nav.contact': 'సంప్రదించండి',
    'nav.main': 'ముఖ్య మెనూ',
    'menu.open': 'మెనూ తెరవండి',
    'menu.close': 'మెనూ మూసివేయండి',
    'lang.switchTo': 'English',
    'lang.switchAria': 'View in English — ఇంగ్లీష్‌లో చూడండి',

    'cta.book': 'అపాయింట్‌మెంట్ బుక్ చేయండి',
    'hero.seeServices': 'సేవలు & ధరలు చూడండి',
    'hero.callNow': 'ఇప్పుడే కాల్ చేయండి',
    'hero.popular': 'పాపులర్ సేవ',
    'stats.services': 'సేవలు',
    'stats.from': 'ధరలు మొదలు',

    'services.eyebrow': 'మా సేవలు',
    'services.title1': 'సేవలు &',
    'services.title2': 'ధరలు',
    'services.filterAria': 'రకం ప్రకారం సేవలు చూడండి',
    'services.all': 'అన్నీ',
    'services.count.one': '1 సేవ',
    'services.count.other': '{n} సేవలు',
    'services.popular': 'పాపులర్',
    'services.price': 'ధర',
    'services.book': 'బుక్',
    'services.bookAria': '{name} బుక్ చేయండి',
    'services.empty': 'మా సేవల జాబితా అప్‌డేట్ అవుతోంది. వివరాల కోసం కాల్ చేయండి.',

    'contact.eyebrow': 'సంప్రదించండి',
    'contact.title1': 'మా దగ్గరకు',
    'contact.title2': 'రండి',
    'contact.callUs': 'కాల్ చేయండి',
    'contact.callAria': '{number} కి కాల్ చేయండి',
    'contact.whatsappUs': 'వాట్సాప్ చేయండి',
    'contact.whatsapp': 'వాట్సాప్',
    'contact.whatsappNote': 'అడగడానికి లేదా బుక్ చేయడానికి మెసేజ్ చేయండి',
    'contact.address': 'చిరునామా',
    'contact.noAddress': 'చిరునామా కోసం మాకు కాల్ చేయండి.',
    'contact.directions': 'గూగుల్ మ్యాప్స్‌లో చూడండి',
    'contact.hours': 'పని వేళలు',
    'social.aria': '{network} లో {name}',

    'footer.explore': 'పేజీలు',
    'footer.services': 'సేవలు',
    'footer.touch': 'సంప్రదించండి',
    'footer.whatsappUs': 'వాట్సాప్ చేయండి',
    'footer.rights': 'అన్ని హక్కులు రిజర్వ్ చేయబడ్డాయి.',
    'footer.photos': 'ఫోటోలు',
    'footer.homeAria': '{name} — హోమ్',

    'action.aria': 'త్వరగా సంప్రదించండి',
    'action.call': 'కాల్',
    'action.whatsapp': 'వాట్సాప్',
    'action.book': 'బుక్',
    'wa.float': 'వాట్సాప్‌లో మాట్లాడండి',

    'modal.eyebrow': 'అపాయింట్‌మెంట్',
    'modal.title1': 'మీ సమయం',
    'modal.title2': 'బుక్ చేసుకోండి',
    'modal.close': 'మూసివేయండి',
    'form.name': 'మీ పేరు',
    'form.namePh': 'ఉదా: లక్ష్మి',
    'form.phone': 'ఫోన్ నంబర్',
    'form.phonePh': '10 అంకెల మొబైల్ నంబర్',
    'form.service': 'మీకు కావలసిన సేవ',
    'form.selectService': 'సేవను ఎంచుకోండి',
    'form.unsure': 'ఇంకా తెలియదు — సలహా ఇవ్వండి',
    'form.date': 'ఏ రోజు?',
    'form.message': 'ఇంకా ఏమైనా? (ఐచ్ఛికం)',
    'form.messagePh': 'కావలసిన సమయం, ఎంత మంది, మీకు నచ్చిన స్టైల్…',
    'form.submit': 'వాట్సాప్‌లో పంపండి',
    'form.footnote': 'మీ వివరాలతో వాట్సాప్ తెరుచుకుంటుంది. Send నొక్కితే చాలు.',
    'err.name': 'దయచేసి మీ పేరు రాయండి.',
    'err.phone': 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.',
    'err.service': 'దయచేసి ఒక సేవను ఎంచుకోండి.',
    'err.date': 'దయచేసి ఒక రోజు ఎంచుకోండి.',
    'err.pastDate': 'ఈ రోజు లేదా తర్వాతి రోజు ఎంచుకోండి.',
    'err.noWhatsapp': 'ప్రస్తుతం వాట్సాప్ బుకింగ్ అందుబాటులో లేదు — దయచేసి కాల్ చేయండి.',

    'msg.greeting': 'నమస్కారం {name}! నేను అపాయింట్‌మెంట్ బుక్ చేసుకోవాలనుకుంటున్నాను.',
    'msg.name': 'పేరు',
    'msg.phone': 'ఫోన్',
    'msg.service': 'సేవ',
    'msg.date': 'తేదీ',
    'msg.message': 'సందేశం',
    'msg.closing': 'దయచేసి సమయం కన్ఫర్మ్ చేయండి. ధన్యవాదాలు!',

    'load.error1': 'క్షమించండి — ఇప్పుడు మా సేవలు లోడ్ కాలేదు.',
    'load.error2': 'కొద్దిసేపటి తర్వాత పేజీని రిఫ్రెష్ చేయండి.',
  },
};

let current = 'en';

export const getLanguage = () => current;

/** Translate a UI key, filling {placeholders}. Falls back to English, then to the key itself. */
export function t(key, vars = {}) {
  const template = STRINGS[current][key] ?? STRINGS.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`));
}

/** Visitor's saved choice → workbook default → English. */
export function initialLanguage(defaultLanguage) {
  let saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage unavailable (private mode etc.) — fall through */
  }
  if (LANGUAGES.includes(saved)) return saved;
  return LANGUAGES.includes(defaultLanguage) ? defaultLanguage : 'en';
}

export function setLanguage(lang, { remember = true } = {}) {
  current = LANGUAGES.includes(lang) ? lang : 'en';
  document.documentElement.lang = current === 'te' ? 'te-IN' : 'en-IN';
  if (remember) {
    try {
      localStorage.setItem(STORAGE_KEY, current);
    } catch {
      /* ignore */
    }
  }
  applyStaticTranslations();
}

/** Translates every element in the static HTML that carries a data-i18n* attribute. */
export function applyStaticTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
}

/**
 * Builds the view model for one language from the generated JSON.
 * Telugu values override English only when they exist, so a missing translation
 * never leaves a blank on the page.
 */
export function localizeData({ services: svc, settings }, lang) {
  const te = lang === 'te';
  const pick = (en, tel) => (te && tel ? tel : en);
  const labels = svc.categoryLabels || {};
  const categoryLabel = (cat) => pick(labels[cat]?.en || cat, labels[cat]?.te);

  const teSettings = Object.fromEntries(
    Object.entries(settings.te || {}).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
  );

  return {
    lang,
    categories: svc.categories,
    categoryLabel,
    services: svc.services.map((s) => ({
      ...s,
      nameEn: s.name,
      name: pick(s.name, s.nameTe),
      description: pick(s.description, s.descriptionTe),
      categoryLabel: categoryLabel(s.category),
    })),
    settings: te ? { ...settings, ...teSettings } : settings,
  };
}
