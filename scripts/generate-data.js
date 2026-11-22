#!/usr/bin/env node
/**
 * Excel → JSON generator.
 *
 * Reads data/website-content.xlsx (the single source of truth), validates every sheet and writes
 * (English text plus the optional Telugu translations):
 *   src/data/generated/services.json
 *   src/data/generated/settings.json
 *
 * Flags / env:
 *   --skip-image-check  or  SKIP_IMAGE_CHECK=1   skip the network check of image URLs
 *   --strict-images     or  STRICT_IMAGES=1      fail the build when an image URL is broken
 *
 * Exit code 1 on validation errors (duplicate IDs, invalid prices, missing required fields …).
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT = path.join(__dirname, '..');
const WORKBOOK = path.join(ROOT, 'data', 'website-content.xlsx');
const OUT_DIR = path.join(ROOT, 'src', 'data', 'generated');

const args = new Set(process.argv.slice(2));
const SKIP_IMAGE_CHECK = args.has('--skip-image-check') || process.env.SKIP_IMAGE_CHECK === '1';
const STRICT_IMAGES = args.has('--strict-images') || process.env.STRICT_IMAGES === '1';

const SHEETS = { services: 'Services', categories: 'Categories', settings: 'Website Settings' };
const LANGUAGES = ['en', 'te'];

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// ---------------------------------------------------------------------------------------------
// Value parsing helpers
// ---------------------------------------------------------------------------------------------
const str = (v) => (v === undefined || v === null ? '' : String(v).trim());

function parseBool(value, where, field, fallback) {
  if (value === undefined || value === null || str(value) === '') return fallback;
  if (typeof value === 'boolean') return value;
  const s = str(value).toLowerCase();
  if (['true', 'yes', 'y', '1'].includes(s)) return true;
  if (['false', 'no', 'n', '0'].includes(s)) return false;
  err(where, `"${field}" must be true or false (found "${value}")`);
  return fallback;
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  // Accept friendly input such as "₹5,000" or "Rs. 500"
  const cleaned = str(value).replace(/₹|rs\.?|inr|,|\s/gi, '');
  if (cleaned === '' || !/^-?\d+(\.\d+)?$/.test(cleaned)) return NaN;
  return Number(cleaned);
}

function parseSortOrder(value, where, rowIndex) {
  if (str(value) === '') return 100000 + rowIndex; // keep sheet order for rows without sort_order
  const n = parseNumber(value);
  if (Number.isNaN(n)) {
    err(where, `"sort_order" must be a number (found "${value}")`);
    return 100000 + rowIndex;
  }
  return n;
}

function validateUrlFormat(url, where, field) {
  if (!url) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') {
      err(where, `"${field}" must start with https:// (found "${url}")`);
      return false;
    }
    return true;
  } catch {
    err(where, `"${field}" is not a valid URL ("${url}")`);
    return false;
  }
}

/** Reads a sheet into row objects with lower-cased, trimmed header keys. */
function readSheet(wb, name, { required = true } = {}) {
  const ws = wb.Sheets[name];
  if (!ws) {
    if (required) err('Workbook', `missing worksheet "${name}" (found: ${wb.SheetNames.join(', ')})`);
    return [];
  }
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true });
  return rows
    .map((row, i) => {
      const clean = {};
      for (const [k, v] of Object.entries(row)) clean[str(k).toLowerCase().replace(/\s+/g, '_')] = typeof v === 'string' ? v.trim() : v;
      clean.__row = i + 2; // +1 for header, +1 for 1-based rows
      return clean;
    })
    .filter((row) => Object.entries(row).some(([k, v]) => k !== '__row' && str(v) !== '')); // skip blank rows
}

function checkColumns(rows, sheet, columns) {
  if (!rows.length) return;
  const present = new Set(Object.keys(rows[0]));
  // sheet_to_json only includes keys that exist in the header row
  for (const col of columns) {
    if (!rows.some((r) => col in r) && !present.has(col)) err(`Sheet "${sheet}"`, `missing column "${col}"`);
  }
}

// ---------------------------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------------------------
function buildServices(rows) {
  const sheet = SHEETS.services;
  checkColumns(rows, sheet, ['id', 'service_name', 'category', 'description', 'price', 'image_url', 'image_source', 'featured', 'active', 'sort_order']);
  const seen = new Map();
  const out = [];

  rows.forEach((r, idx) => {
    const where = `${sheet} row ${r.__row}${r.id ? ` (${r.id})` : ''}`;
    const id = str(r.id);
    const name = str(r.service_name);
    const category = str(r.category);

    if (!id) err(where, 'missing required field "id"');
    else if (seen.has(id.toLowerCase())) err(where, `duplicate id "${id}" (already used on row ${seen.get(id.toLowerCase())})`);
    else seen.set(id.toLowerCase(), r.__row);

    if (!name) err(where, 'missing required field "service_name"');
    if (!category) err(where, 'missing required field "category"');

    const active = parseBool(r.active, where, 'active', true);
    const featured = parseBool(r.featured, where, 'featured', false);

    const price = parseNumber(r.price);
    if (str(r.price) === '') err(where, 'missing required field "price"');
    else if (Number.isNaN(price)) err(where, `invalid price "${r.price}" — use a number such as 1500`);
    else if (price <= 0) err(where, `price must be greater than 0 (found ${price})`);
    else if (!Number.isInteger(price)) warn(where, `price ${price} has decimals; it will be shown rounded`);

    const imageUrl = str(r.image_url);
    if (!imageUrl) warn(where, 'no image_url — the fallback image will be shown');
    else validateUrlFormat(imageUrl, where, 'image_url');
    if (imageUrl && !str(r.image_source)) warn(where, 'image_source (attribution) is empty');

    if (!active) return; // inactive rows are validated but not published

    out.push({
      id,
      name,
      nameTe: str(r.service_name_te),
      category,
      description: str(r.description),
      descriptionTe: str(r.description_te),
      price: Math.round(price),
      image: imageUrl,
      imageSource: str(r.image_source),
      imagePosition: str(r.image_position) || 'center',
      featured,
      sortOrder: parseSortOrder(r.sort_order, where, idx),
    });
  });

  out.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return out;
}

// ---------------------------------------------------------------------------------------------
// Categories (optional sheet: English name → Telugu name)
// ---------------------------------------------------------------------------------------------
function buildCategoryLabels(rows, usedCategories) {
  const sheet = SHEETS.categories;
  const labels = {};
  for (const r of rows) {
    const en = str(r.category);
    if (!en) continue;
    if (en in labels) warn(`${sheet} row ${r.__row}`, `category "${en}" is listed twice; the first row is used`);
    else labels[en] = { en, te: str(r.category_te) };
  }
  for (const cat of usedCategories) {
    if (!labels[cat]) labels[cat] = { en: cat, te: '' };
    if (!labels[cat].te) warn(sheet, `no Telugu name for category "${cat}" — English is shown in Telugu mode`);
  }
  return labels;
}

/** One summary warning instead of one per row, so missing translations don't flood the log. */
function reportMissingTelugu(services) {
  const missing = services.filter((s) => !s.nameTe).map((s) => s.id);
  if (missing.length) warn(SHEETS.services, `${missing.length} service(s) have no Telugu name (service_name_te) — English is shown in Telugu mode: ${missing.join(', ')}`);
}

// ---------------------------------------------------------------------------------------------
// Settings (key / value rows)
// ---------------------------------------------------------------------------------------------
const REQUIRED_SETTINGS = ['parlour_name', 'tagline', 'phone_number_1', 'whatsapp_number'];
const KNOWN_SETTINGS = [
  ...REQUIRED_SETTINGS, 'phone_number_2', 'address', 'opening_hours', 'instagram_url', 'facebook_url',
  'hero_eyebrow', 'hero_intro', 'hero_image_url', 'hero_image_source', 'whatsapp_message', 'map_url',
  'services_intro', 'pricelist_note', 'booking_intro', 'default_language',
];
/** Settings that can have a Telugu version in the "value_te" column. */
const TRANSLATABLE = {
  tagline: 'tagline',
  hero_eyebrow: 'heroEyebrow',
  hero_intro: 'heroIntro',
  whatsapp_message: 'whatsappMessage',
  address: 'address',
  opening_hours: 'openingHours',
  services_intro: 'servicesIntro',
  pricelist_note: 'pricelistNote',
  booking_intro: 'bookingIntro',
};

function normalisePhone(raw, where, field) {
  const digits = str(raw).replace(/\D/g, '');
  if (!digits) return null;
  let national = digits;
  if (digits.length === 12 && digits.startsWith('91')) national = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) national = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(national)) {
    err(where, `"${field}" should be a 10-digit Indian mobile number (found "${raw}")`);
    return null;
  }
  return {
    raw: national,
    display: `+91 ${national.slice(0, 5)} ${national.slice(5)}`,
    tel: `+91${national}`,
    international: `91${national}`,
  };
}

function buildSettings(rows) {
  const sheet = SHEETS.settings;
  const map = {};
  const te = {};
  for (const r of rows) {
    const key = str(r.key).toLowerCase().replace(/\s+/g, '_');
    const where = `${sheet} row ${r.__row}`;
    if (!key) { err(where, 'missing "key"'); continue; }
    if (key in map) err(where, `duplicate setting "${key}"`);
    if (!KNOWN_SETTINGS.includes(key)) warn(where, `unknown setting "${key}" (it will be included but is not used by the website)`);
    map[key] = str(r.value);
    if (str(r.value_te)) {
      if (key in TRANSLATABLE) te[key] = str(r.value_te);
      else warn(where, `"${key}" does not use a Telugu value — value_te is ignored`);
    }
  }
  const defaultLanguage = (map.default_language || 'en').toLowerCase();
  if (!LANGUAGES.includes(defaultLanguage)) err(sheet, `"default_language" must be "en" or "te" (found "${map.default_language}")`);
  for (const key of REQUIRED_SETTINGS) if (!map[key]) err(sheet, `required setting "${key}" is missing or empty`);

  const split = (v) => str(v).split('|').map((s) => s.trim()).filter(Boolean);
  for (const k of ['instagram_url', 'facebook_url', 'map_url']) if (map[k]) validateUrlFormat(map[k], sheet, k);
  if (map.hero_image_url) validateUrlFormat(map.hero_image_url, sheet, 'hero_image_url');

  const phones = [
    normalisePhone(map.phone_number_1, sheet, 'phone_number_1'),
    normalisePhone(map.phone_number_2, sheet, 'phone_number_2'),
  ].filter(Boolean);

  return {
    parlourName: map.parlour_name || '',
    tagline: map.tagline || '',
    heroEyebrow: map.hero_eyebrow || '',
    heroIntro: map.hero_intro || '',
    heroImage: map.hero_image_url || '',
    heroImageSource: map.hero_image_source || '',
    phones,
    whatsapp: normalisePhone(map.whatsapp_number, sheet, 'whatsapp_number'),
    whatsappMessage: map.whatsapp_message || `Hello ${map.parlour_name || ''}!`,
    address: map.address || '',
    mapUrl: map.map_url || '',
    openingHours: split(map.opening_hours),
    servicesIntro: map.services_intro || '',
    pricelistNote: map.pricelist_note || '',
    bookingIntro: map.booking_intro || '',
    social: {
      instagram: map.instagram_url || '',
      facebook: map.facebook_url || '',
    },
    defaultLanguage: LANGUAGES.includes(defaultLanguage) ? defaultLanguage : 'en',
    // Telugu overrides; any setting missing here falls back to English on the website
    te: Object.fromEntries(
      Object.entries(te).map(([key, value]) => [TRANSLATABLE[key], key === 'opening_hours' ? split(value) : value])
    ),
  };
}

// ---------------------------------------------------------------------------------------------
// Image URL verification (network)
// ---------------------------------------------------------------------------------------------
async function checkImage(url) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: method === 'GET' ? { Range: 'bytes=0-1023' } : {},
      });
      if (method === 'GET' && res.body) res.body.cancel().catch(() => {});
      return { status: res.status, type: res.headers.get('content-type') || '' };
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let r = await attempt('HEAD');
    if (r.status === 405 || r.status === 403) r = await attempt('GET'); // some CDNs reject HEAD
    if (r.status >= 400) return { ok: false, reason: `HTTP ${r.status}` };
    if (r.type && !r.type.startsWith('image/')) return { ok: false, reason: `not an image (content-type ${r.type})` };
    return { ok: true };
  } catch (e) {
    return { ok: false, network: true, reason: e.name === 'AbortError' ? 'timed out' : e.cause?.code || e.message };
  }
}

async function verifyImages(entries) {
  const unique = [...new Set(entries.map((e) => e.url))];
  const results = new Map();
  let i = 0;
  const worker = async () => {
    while (i < unique.length) {
      const url = unique[i++];
      results.set(url, await checkImage(url));
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));

  const allNetworkFailures = unique.length > 0 && [...results.values()].every((r) => !r.ok && r.network);
  if (allNetworkFailures) {
    warn('Images', 'could not reach any image host (offline?). Image URLs were not verified.');
    return { broken: new Set(), checked: 0 };
  }
  const broken = new Set();
  for (const e of entries) {
    const r = results.get(e.url);
    if (!r.ok) {
      broken.add(e.url);
      (STRICT_IMAGES ? err : warn)(e.where, `image not reachable (${r.reason}) — the fallback image will be used: ${e.url}`);
    }
  }
  return { broken, checked: unique.length };
}

// ---------------------------------------------------------------------------------------------
function categoriesOf(items) {
  return [...new Set(items.map((i) => i.category))];
}

function writeJson(file, data) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, file), JSON.stringify(data, null, 2) + '\n');
}

async function main() {
  console.log('\n🍯 Honey Beauty Parlour — generating website data from Excel\n');

  if (!fs.existsSync(WORKBOOK)) {
    console.error(`❌ Workbook not found: ${path.relative(ROOT, WORKBOOK)}\n   Run "npm run seed-workbook" to create the initial workbook.`);
    process.exit(1);
  }

  let wb;
  try {
    wb = XLSX.readFile(WORKBOOK);
  } catch (e) {
    console.error(`❌ Could not read ${path.relative(ROOT, WORKBOOK)}: ${e.message}\n   Is the file open/locked in Excel, or saved in a format other than .xlsx?`);
    process.exit(1);
  }

  const services = buildServices(readSheet(wb, SHEETS.services));
  const settings = buildSettings(readSheet(wb, SHEETS.settings));
  const categoryLabels = buildCategoryLabels(readSheet(wb, SHEETS.categories, { required: false }), categoriesOf(services));
  reportMissingTelugu(services);

  if (!services.length) err(SHEETS.services, 'no active services found');

  let imageReport = 'skipped';
  if (!errors.length && !SKIP_IMAGE_CHECK) {
    const entries = [
      ...services.filter((s) => s.image).map((s) => ({ url: s.image, where: `${SHEETS.services} (${s.id})` })),
      ...(settings.heroImage ? [{ url: settings.heroImage, where: `${SHEETS.settings} (hero_image_url)` }] : []),
    ];
    process.stdout.write(`🔎 Verifying ${new Set(entries.map((e) => e.url)).size} image URLs… `);
    const { broken, checked } = await verifyImages(entries);
    console.log('done');
    imageReport = checked ? `${checked - broken.size}/${checked} reachable` : 'not verified (offline)';
    // Blank out broken URLs so the frontend shows the fallback image straight away.
    for (const s of services) if (broken.has(s.image)) s.image = '';
    if (broken.has(settings.heroImage)) settings.heroImage = '';
  }

  if (warnings.length) {
    console.log(`\n⚠️  ${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`   • ${w}`);
  }
  if (errors.length) {
    console.error(`\n❌ ${errors.length} error(s) found in ${path.relative(ROOT, WORKBOOK)} — fix them and run the build again:`);
    for (const e of errors) console.error(`   • ${e}`);
    console.error('');
    process.exit(1);
  }

  const generatedAt = new Date().toISOString();
  writeJson('services.json', { generatedAt, categories: categoriesOf(services), categoryLabels, services: services.map(({ sortOrder, ...s }) => s) });
  writeJson('settings.json', { generatedAt, ...settings });

  console.log(`\n✅ Generated ${path.relative(ROOT, OUT_DIR)}/`);
  console.log(`   services.json  ${services.length} active services in ${categoriesOf(services).length} categories`);
  const teCount = services.filter((s) => s.nameTe).length;
  console.log(`   settings.json  ${settings.parlourName} (default language: ${settings.defaultLanguage})`);
  console.log(`   telugu         ${teCount}/${services.length} services, ${Object.keys(settings.te).length}/${Object.keys(TRANSLATABLE).length} settings translated`);
  console.log(`   images         ${imageReport}\n`);
}

main().catch((e) => {
  console.error('❌ Unexpected error:', e);
  process.exit(1);
});
