/**
 * Appointment enquiry modal → opens WhatsApp with a pre-filled message
 * in the visitor's language.
 *
 * initBooking() wires events once; refresh() re-fills the service list after a
 * language switch (the current selection is kept, because options use service ids).
 */
import { $, $$, h, formatPrice, groupBy, whatsappLink } from './utils.js';
import { t, getLanguage } from './i18n.js';

const UNSURE = '__unsure__';

const todayISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(getLanguage() === 'te' ? 'te-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Accepts 10-digit Indian mobiles, optionally prefixed with +91 / 91 / 0, spaces or dashes. */
function normalisePhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

/** @param {() => {services, categories, categoryLabel, settings}} getView current localised data */
export function initBooking(getView) {
  const dialog = $('[data-booking-modal]');
  const form = $('[data-booking-form]');
  if (!dialog || !form) return { refresh() {} };
  const select = $('[data-booking-services]');
  const dateInput = form.elements.date;

  /* Service options grouped by category, in the current language */
  function refresh() {
    const { services, categories, categoryLabel } = getView();
    const previous = select.value;
    const grouped = groupBy(services, 'category');
    select.replaceChildren(
      h('option', { value: '' }, t('form.selectService')),
      ...categories.map((cat) =>
        h(
          'optgroup',
          { label: categoryLabel(cat) },
          (grouped.get(cat) || []).map((s) => h('option', { value: s.id }, `${s.name} — ${formatPrice(s.price)}`))
        )
      ),
      h('option', { value: UNSURE }, t('form.unsure'))
    );
    select.value = previous;
    clearErrors();
  }

  const supportsDialog = typeof dialog.showModal === 'function';
  let opener = null;

  const open = (serviceId, trigger) => {
    opener = trigger || document.activeElement;
    dateInput.min = todayISO();
    if (serviceId) select.value = serviceId;
    clearErrors();
    if (supportsDialog) dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.classList.add('no-scroll');
    // Focus the first field that still needs input
    (!form.elements.name.value ? form.elements.name : serviceId ? dateInput : select).focus();
  };
  const onClosed = () => {
    document.body.classList.remove('no-scroll');
    opener?.focus?.();
  };
  const close = () => {
    if (supportsDialog) dialog.close();
    else {
      dialog.removeAttribute('open');
      onClosed();
    }
  };
  dialog.addEventListener('close', onClosed);

  // Any element with [data-open-booking] opens the modal (optionally preselecting data-service = service id)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-booking]');
    if (!trigger) return;
    e.preventDefault();
    open(trigger.dataset.service, trigger);
  });
  $('[data-booking-close]', dialog).addEventListener('click', close);
  // Click on the backdrop closes
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });

  /* Validation */
  const fieldOf = (input) => input.closest('.field');
  const setError = (input, message) => {
    const field = fieldOf(input);
    field.classList.toggle('has-error', Boolean(message));
    const errorEl = $('.field-error', field);
    if (errorEl) errorEl.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  };
  function clearErrors() {
    $$('input, select, textarea', form).forEach((el) => el.closest('.field') && setError(el, ''));
  }

  const validators = {
    name: (v) => (v.trim().length < 2 ? t('err.name') : ''),
    phone: (v) => (!normalisePhone(v) ? t('err.phone') : ''),
    service: (v) => (!v ? t('err.service') : ''),
    date: (v) => (!v ? t('err.date') : v < todayISO() ? t('err.pastDate') : ''),
  };

  for (const name of Object.keys(validators)) {
    const input = form.elements[name];
    const evt = input.tagName === 'SELECT' || input.type === 'date' ? 'change' : 'blur';
    input.addEventListener(evt, () => setError(input, validators[name](input.value)));
    input.addEventListener('input', () => fieldOf(input).classList.contains('has-error') && setError(input, validators[name](input.value)));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    for (const [name, validate] of Object.entries(validators)) {
      const input = form.elements[name];
      const message = validate(input.value);
      setError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const { services, settings } = getView();
    if (!settings.whatsapp) {
      setError(form.elements.service, t('err.noWhatsapp'));
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    const service = services.find((s) => s.id === data.service);
    // In Telugu, add the English name so the parlour always knows exactly what was booked
    const serviceText = service
      ? `${service.name}${service.name !== service.nameEn ? ` (${service.nameEn})` : ''} – ${formatPrice(service.price)}`
      : t('form.unsure');

    const lines = [
      t('msg.greeting', { name: settings.parlourName }),
      '',
      `*${t('msg.name')}:* ${data.name.trim()}`,
      `*${t('msg.phone')}:* ${normalisePhone(data.phone)}`,
      `*${t('msg.service')}:* ${serviceText}`,
      `*${t('msg.date')}:* ${formatDate(data.date)}`,
    ];
    if (data.message.trim()) lines.push(`*${t('msg.message')}:* ${data.message.trim()}`);
    lines.push('', t('msg.closing'));

    const url = whatsappLink(settings.whatsapp.international, lines.join('\n'));
    // Note: passing 'noopener' as a feature makes window.open() always return null,
    // so we detach the opener manually to keep the pop-up-blocked fallback reliable.
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url; // pop-up blocked → navigate in the same tab
    form.reset();
    close();
  });

  refresh();
  return { open, refresh };
}
