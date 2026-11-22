#!/usr/bin/env node
/**
 * One-time seed script: creates data/website-content.xlsx with the initial content.
 *
 * After the workbook exists, EDIT THE WORKBOOK DIRECTLY — it is the single source of truth.
 * This script refuses to overwrite an existing workbook unless you pass --force.
 *
 *   npm run seed-workbook            # create if missing
 *   npm run seed-workbook -- --force # recreate from scratch (overwrites your edits!)
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const TELUGU = require('./telugu-content');

const OUT = path.join(__dirname, '..', 'data', 'website-content.xlsx');

if (fs.existsSync(OUT) && !process.argv.includes('--force')) {
  console.log(`✋ ${path.relative(process.cwd(), OUT)} already exists. Edit it directly, or pass --force to recreate it.`);
  process.exit(0);
}

// --- Image URL helpers (images are served by the photo sites' own CDNs) -------------------
const unsplash = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const pexels = (id, w = 1600) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const unsplashSrc = 'Unsplash (Unsplash License – free for commercial use)';
const pexelsSrc = (id) => `Pexels (Pexels License – free for commercial use) – https://www.pexels.com/photo/${id}/`;

// --- Services ------------------------------------------------------------------------------
const services = [
  // Bridal Makeup
  { id: 'SRV-001', service_name: 'Bridal Makeup', category: 'Bridal Makeup',
    description: 'Our signature bridal look — flawless, long-wearing makeup designed to keep you radiant from the first ritual to the last photograph.',
    price: 8000, image_url: pexels(2531734), image_source: pexelsSrc(2531734), image_position: 'center 20%', featured: true, active: true, sort_order: 10 },

  // Makeup
  { id: 'SRV-002', service_name: 'Engagement Makeup', category: 'Makeup',
    description: 'A radiant, camera-ready look for your engagement ceremony — soft glam that glows in photographs and lasts through the celebrations.',
    price: 6000, image_url: unsplash('1610173826608-bd1f53a52db1'), image_source: unsplashSrc, image_position: 'center 30%', featured: true, active: true, sort_order: 20 },
  { id: 'SRV-003', service_name: 'Normal Makeup', category: 'Makeup',
    description: 'Elegant party and occasion makeup tailored to your features, outfit and event — from subtle glow to evening glamour.',
    price: 3000, image_url: unsplash('1487412947147-5cebf100ffc2'), image_source: unsplashSrc, image_position: 'center 35%', featured: true, active: true, sort_order: 30 },

  // Saree Draping
  { id: 'SRV-004', service_name: 'Saree Function', category: 'Saree Draping',
    description: 'A complete, graceful look for your saree function, styled with care for this special family celebration.',
    price: 5000, image_url: unsplash('1617627143750-d86bc21e42bb'), image_source: unsplashSrc, image_position: 'center 25%', featured: true, active: true, sort_order: 40 },
  { id: 'SRV-005', service_name: 'Saree Draping', category: 'Saree Draping',
    description: 'Neat, secure and elegant saree draping in your preferred style, perfectly pinned to stay in place all day.',
    price: 500, image_url: unsplash('1610030469983-98e550d6193c'), image_source: unsplashSrc, image_position: 'center 40%', featured: false, active: true, sort_order: 50 },
  { id: 'SRV-006', service_name: 'Saree Pre-Pleating', category: 'Saree Draping',
    description: 'Crisp, evenly set pleats prepared in advance so your saree drapes in minutes — ideal for weddings and functions.',
    price: 350, image_url: pexels(1162983), image_source: pexelsSrc(1162983), image_position: 'center 30%', featured: false, active: true, sort_order: 60 },

  // Hair Styling
  { id: 'SRV-007', service_name: 'Messy Hairstyle', category: 'Hair Styling',
    description: 'Effortlessly romantic textured buns, braids and loose waves — a modern, soft finish for receptions and parties.',
    price: 1000, image_url: unsplash('1626954079979-ec4f7b05e032'), image_source: unsplashSrc, image_position: 'center 40%', featured: false, active: true, sort_order: 70 },
  { id: 'SRV-008', service_name: 'Basic Hairstyle', category: 'Hair Styling',
    description: 'Polished everyday or occasion styling — smooth blow-outs, soft curls or a classic bun.',
    price: 500, image_url: pexels(3065209), image_source: pexelsSrc(3065209), image_position: 'center 30%', featured: false, active: true, sort_order: 80 },
  { id: 'SRV-009', service_name: 'Basic Hair Cut', category: 'Hair Styling',
    description: 'A precise, flattering cut shaped to suit your face, hair texture and lifestyle.',
    price: 200, image_url: unsplash('1562322140-8baeececf3df'), image_source: unsplashSrc, image_position: 'center 30%', featured: false, active: true, sort_order: 90 },

  // Facial & Skincare
  { id: 'SRV-010', service_name: 'Bridal Facial', category: 'Facial & Skincare',
    description: 'A deeply nourishing pre-bridal facial that cleanses, brightens and preps your skin for a luminous makeup base.',
    price: 1500, image_url: pexels(3985329), image_source: pexelsSrc(3985329), image_position: 'center 40%', featured: true, active: true, sort_order: 100 },
  { id: 'SRV-011', service_name: 'D-Tan + Fruit Facial', category: 'Facial & Skincare',
    description: 'De-tan treatment followed by a refreshing fruit facial to remove dullness and restore a fresh, even glow.',
    price: 500, image_url: unsplash('1505944270255-72b8c68c6a70'), image_source: unsplashSrc, image_position: 'center 40%', featured: false, active: true, sort_order: 110 },

  // Hands & Feet
  { id: 'SRV-012', service_name: 'Pedicure', category: 'Hands & Feet',
    description: 'A relaxing foot-care ritual for soft, beautifully groomed feet.',
    price: 500, image_url: unsplash('1519415510236-718bdfcd89c8'), image_source: unsplashSrc, image_position: 'center', featured: false, active: true, sort_order: 120 },
  { id: 'SRV-013', service_name: 'Manicure', category: 'Hands & Feet',
    description: 'Nail and cuticle care for elegant, well-groomed hands.',
    price: 350, image_url: pexels(3997391), image_source: pexelsSrc(3997391), image_position: 'center', featured: false, active: true, sort_order: 130 },
  { id: 'SRV-014', service_name: 'Wax Hands', category: 'Hands & Feet',
    description: 'Gentle hand waxing for smooth, soft skin.',
    price: 250, image_url: pexels(3762875), image_source: pexelsSrc(3762875), image_position: 'center', featured: false, active: true, sort_order: 140 },

  // Other Services
  { id: 'SRV-015', service_name: 'Henna Colour', category: 'Other Services',
    description: 'Natural henna colour application for a rich, traditional finish.',
    price: 250, image_url: pexels(1456613), image_source: pexelsSrc(1456613), image_position: 'center', featured: false, active: true, sort_order: 150 },
  { id: 'SRV-016', service_name: 'Hair Massage', category: 'Other Services',
    description: 'A soothing scalp and hair massage that relieves stress and nourishes the roots.',
    price: 200, image_url: pexels(3993449), image_source: pexelsSrc(3993449), image_position: 'center', featured: false, active: true, sort_order: 160 },
  { id: 'SRV-017', service_name: 'Eyebrows', category: 'Other Services',
    description: 'Precise eyebrow shaping that frames your eyes and defines your features.',
    price: 50, image_url: unsplash('1512290923902-8a9f81dc236c'), image_source: unsplashSrc, image_position: 'center 40%', featured: false, active: true, sort_order: 170 },
];

// --- Settings (key / value / notes) ---------------------------------------------------------
const settings = [
  ['parlour_name', 'Honey Beauty Parlour', 'Business name shown in the logo, hero and footer.'],
  ['tagline', 'Beauty is our Passion', 'Short tagline shown in the hero and footer.'],
  ['hero_eyebrow', 'Bridal · Makeup · Facial · Hair · Saree', 'Small line above the main hero title.'],
  ['hero_intro', 'Bridal makeup, facials, hair styling, saree draping and more — all in one place. Call or WhatsApp us to book your visit.', 'Short introduction in the hero.'],
  ['hero_image_url', pexels(2531734, 2400), 'Large hero photograph (portrait orientation works best).'],
  ['hero_image_source', pexelsSrc(2531734), 'Attribution for the hero photograph.'],
  ['phone_number_1', '7993901988', 'Primary phone number (10 digits).'],
  ['phone_number_2', '9553022180', 'Secondary phone number (10 digits). Leave empty to hide.'],
  ['whatsapp_number', '7993901988', 'WhatsApp number that receives appointment enquiries (10 digits; India +91 is added automatically).'],
  ['whatsapp_message', 'Hello Honey Beauty Parlour! I would like to know more about your services.', 'Pre-filled message for the WhatsApp contact buttons.'],
  ['address', 'Flat No. 302, 3rd Floor | Sai Teja Home | Kuntloor, Hayathnagar', 'Parlour address. Use | to start a new line.'],
  ['map_url', 'https://maps.app.goo.gl/fvehZ9iwDo1w3cBXA', 'Google Maps link — shows the "Open in Google Maps" button. Leave empty to hide it.'],
  ['opening_hours', '9:00 AM – 9:00 PM', 'Opening hours. Use | for more lines, e.g. 9:00 AM – 9:00 PM | Sunday: Closed.'],
  ['services_intro', 'All our services and prices in one place. Tap “Book” on any service and we will confirm your time on WhatsApp.', 'Introduction under the Services heading.'],
  ['pricelist_note', 'All prices are in Indian Rupees (₹). For bridal and function packages, please call or WhatsApp us.', 'Note shown under the services and prices.'],
  ['booking_intro', 'Fill in your details. We will reply on WhatsApp to confirm your time.', 'Text shown at the top of the appointment form.'],
  ['instagram_url', 'https://www.instagram.com/', 'Instagram profile link (placeholder). Leave empty to hide.'],
  ['facebook_url', 'https://www.facebook.com/', 'Facebook page link (placeholder). Leave empty to hide.'],
  ['default_language', 'en', 'Language shown first: en = English, te = Telugu. Visitors can switch with the తెలుగు / English button.'],
];

// --- Write workbook ------------------------------------------------------------------------
const serviceCols = ['id', 'service_name', 'service_name_te', 'category', 'description', 'description_te', 'price', 'image_url', 'image_source', 'featured', 'active', 'sort_order', 'image_position'];
for (const s of services) [s.service_name_te, s.description_te] = TELUGU.services[s.id] || ['', ''];

const wb = XLSX.utils.book_new();

const wsServices = XLSX.utils.json_to_sheet(services, { header: serviceCols });
wsServices['!cols'] = [10, 24, 28, 18, 60, 60, 10, 60, 50, 10, 8, 11, 16].map((wch) => ({ wch }));
XLSX.utils.book_append_sheet(wb, wsServices, 'Services');

const usedCategories = [...new Set(services.map((s) => s.category))];
const wsCategories = XLSX.utils.aoa_to_sheet([['category', 'category_te'], ...usedCategories.map((c) => [c, TELUGU.categories[c] || ''])]);
wsCategories['!cols'] = [{ wch: 24 }, { wch: 32 }];
XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories');


const wsSettings = XLSX.utils.aoa_to_sheet([
  ['key', 'value', 'value_te', 'notes'],
  ...settings.map(([key, value, notes]) => [key, value, TELUGU.settings[key] || '', notes]),
]);
wsSettings['!cols'] = [{ wch: 28 }, { wch: 80 }, { wch: 80 }, { wch: 70 }];
XLSX.utils.book_append_sheet(wb, wsSettings, 'Website Settings');

const help = [
  ['How to update this website'],
  [''],
  ['1. Services sheet: one row per service. Change "price" to update a price (numbers only, e.g. 1500).'],
  ['2. To add a service: add a new row with a UNIQUE id (e.g. SRV-018), name, category, price, image_url, active = true.'],
  ['3. To hide a service without deleting it: set active = false.'],
  ['4. featured = true marks the service as "Popular" and shows the first one in the hero.'],
  ['5. sort_order controls display order (smaller numbers first). Categories appear in the order of their first service.'],
  ['6. image_url must be a direct https image link (Unsplash, Pexels, Pixabay…). image_position is optional, e.g. "center top" or "center 30%".'],
  ['7. Website Settings sheet: edit only the "value" (English) and "value_te" (Telugu) columns.'],
  ['8. Telugu: fill service_name_te / description_te (Services), category_te (Categories) and value_te (Website Settings). Empty Telugu cells show the English text.'],
  ['9. New category? Add a row to the Categories sheet with its Telugu name.'],
  ['10. Save the file, then run "npm run build" (or push to GitHub — Netlify rebuilds automatically).'],
];
const wsHelp = XLSX.utils.aoa_to_sheet(help);
wsHelp['!cols'] = [{ wch: 120 }];
XLSX.utils.book_append_sheet(wb, wsHelp, 'How To Update');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
XLSX.writeFile(wb, OUT);
console.log(`✅ Created ${path.relative(process.cwd(), OUT)} (${services.length} services, ${settings.length} settings)`);
