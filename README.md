# Honey Beauty Parlour — Website

A premium, fully static website for **Honey Beauty Parlour** (*Beauty is our Passion*).

All business content (services, prices, photos, contact details and text) lives in **one Excel file**:

```
data/website-content.xlsx
```

Edit the workbook → rebuild (or push to GitHub) → the website updates. You never need to touch HTML, CSS or JavaScript.

## Designed for phones

Most visitors will be on a phone, so the mobile layout is kept short and simple:

- **One page:** Home → Services & Prices → Contact.
- **Rate card on phones:** each service is one compact row (photo, name, price, **Book**). Desktop shows larger photo cards with descriptions and category filters.
- **Call / WhatsApp / Book bar** fixed at the bottom of the screen on phones.
- Large, high-contrast text and plain wording.
- **English / తెలుగు:** one tap on the button at the top switches the whole site, including the WhatsApp booking message. The visitor's choice is remembered.

---

## 1. Quick start (local)

Requirements: **Node.js 18+** (Node 20 recommended).

```bash
npm install          # installs the Excel reader (SheetJS)
npm run dev          # converts Excel → JSON and serves the site at http://localhost:8080
```

Production build:

```bash
npm run build        # Excel → JSON (with image checks) → copies the site into dist/
npm run preview      # serves dist/ at http://localhost:8080 — exactly what Netlify publishes
```

> Open the site through `npm run dev` / `npm run preview`, not by double-clicking `index.html`.
> Browsers block loading the data files from `file://` pages.

| Command | What it does |
|---|---|
| `npm run dev` | Generate data (skips image checks for speed) and serve the project folder |
| `npm run data` | Generate JSON from Excel, including image URL checks |
| `npm run data:fast` | Generate JSON without network image checks |
| `npm run build` | Full production build into `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run seed-workbook` | Re-create the original workbook (only if it is missing; `-- --force` overwrites your edits) |

---

## 2. Updating the website (for the owner)

Open `data/website-content.xlsx` in Excel, Google Sheets (download as .xlsx) or LibreOffice. It has four sheets: **Services**, **Categories**, **Website Settings** and **How To Update**.

### Services sheet

| Column | Meaning | Example |
|---|---|---|
| `id` | Unique code — never reuse one | `SRV-018` |
| `service_name` | Name shown on the site | `Party Makeup` |
| `service_name_te` | *Optional.* Telugu name | `పార్టీ మేకప్` |
| `category` | Group on the site (new categories appear automatically) | `Makeup` |
| `description` | One or two sentences | `Soft glam for evening events.` |
| `description_te` | *Optional.* Telugu description | |
| `price` | Price in rupees, numbers only (`₹1,500` is also accepted) | `1500` |
| `image_url` | Direct https link to a photo | see §3 |
| `image_source` | Where the photo came from (attribution) | `Unsplash (Unsplash License)` |
| `featured` | `true` marks the service as **Popular**; the first featured service is also shown in the hero | `false` |
| `active` | `false` hides the service without deleting it | `true` |
| `sort_order` | Smaller numbers appear first; categories follow the order of their first service | `175` |
| `image_position` | *Optional.* Which part of the photo to keep when cropping | `center 30%`, `center top` |

- **Change a price:** edit the `price` cell.
- **Add a service:** add a new row with a new unique `id`, fill in the columns, set `active` to `true`.
- **Hide a service:** set `active` to `false`.
- **Reorder:** change `sort_order`.

### Categories sheet

One row per category: `category` (exactly as written in the Services sheet) and `category_te` (its Telugu name). When you add a new category, add a row here too.

### Website Settings sheet

Edit **only the `value` (English) and `value_te` (Telugu) columns**. The `notes` column explains each setting. Includes the parlour name, tagline, phone numbers, WhatsApp number, address, opening hours, the hero photo and text, the note under the prices, and social links.

- Use a `|` character to split the address or opening hours over several lines.
- When you change the address or hours, update the Telugu copy in `value_te` too.
- Leave `phone_number_2`, `map_url`, `instagram_url` or `facebook_url` empty to hide them.
- Phone numbers are 10-digit Indian mobiles; `+91` is added automatically.
- `default_language`: `en` (English first) or `te` (Telugu first). Visitors can always switch.

### Telugu text

Every Telugu cell is optional. If one is empty, the website shows the English text in its place, and the build prints a reminder such as:

```
⚠️  Services: 1 service(s) have no Telugu name (service_name_te) — English is shown in Telugu mode: SRV-018
```

Buttons, form labels and messages (e.g. "Book", "Call", error messages) are part of the website code, in `src/js/i18n.js`.

### Publishing your changes

1. Save the workbook (keep the `.xlsx` format and the sheet names).
2. Commit and push to GitHub — Netlify rebuilds and publishes automatically within a minute or two.
   *(Or run `npm run build` locally and upload `dist/`.)*

If something in the workbook is wrong, the build **stops** and tells you exactly where, e.g.:

```
❌ 2 error(s) found in data/website-content.xlsx — fix them and run the build again:
   • Services row 10 (SRV-009): missing required field "service_name"
   • Services row 19 (SRV-018): invalid price "free" — use a number such as 1500
```

Checks include duplicate IDs, missing required fields, invalid prices, invalid true/false values, malformed URLs and unreachable images. The live site is never replaced by a broken build.

---

## 3. Changing images

1. Find a photo on [Unsplash](https://unsplash.com), [Pexels](https://www.pexels.com) or [Pixabay](https://pixabay.com) (all free for commercial use).
2. Open the photo, right-click it → **Copy image address**. The link must point to the image itself, e.g.
   - `https://images.unsplash.com/photo-…?auto=format&fit=crop&w=1600&q=80`
   - `https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg?auto=compress&cs=tinysrgb&w=1600`
3. Paste it into `image_url` and note the site in `image_source`.

Tips:
- Use `w=1600` for service images and `w=2400` for the hero. The site automatically serves smaller versions to phones.
- Landscape photos suit service cards; a portrait photo suits the hero.
- If a photo crops badly, set `image_position` (e.g. `center 20%` to keep faces near the top).
- During `npm run build`, every image URL is checked. A broken link produces a warning and the site shows an elegant fallback image instead.

---

## 4. Deploying on Netlify (GitHub)

1. Push this folder to a GitHub repository.
2. In Netlify: **Add new site → Import an existing project → GitHub** and pick the repository.
3. Settings are read from `netlify.toml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20
4. Deploy. Every push (including workbook edits) triggers a new build.

Optional environment variables (Netlify → Site settings → Environment):

| Variable | Effect |
|---|---|
| `SKIP_IMAGE_CHECK=1` | Skip the network check of image URLs |
| `STRICT_IMAGES=1` | Fail the build if any image URL is unreachable (instead of warning) |

---

## 5. Project structure

```
honey-beauty-parlour/
├── index.html                  Page shell (no business content)
├── package.json
├── netlify.toml                Build + headers for Netlify
├── data/
│   └── website-content.xlsx    ← single source of truth
├── scripts/
│   ├── generate-data.js        Excel → validated JSON
│   ├── build.js                Production build into dist/
│   ├── serve.js                Zero-dependency local server
│   ├── create-workbook.js      One-time seed of the initial workbook
│   └── telugu-content.js       Telugu text used by the seed
├── src/
│   ├── css/
│   │   ├── variables.css       Design tokens (colours, type, spacing)
│   │   ├── base.css            Reset, typography, motion
│   │   ├── layout.css          Container, sections, header, footer
│   │   ├── components.css      Buttons, chips, cards, modal, mobile action bar
│   │   ├── sections.css        Hero, Services & Prices, Contact
│   │   └── responsive.css      Tablet / phone layout (compact rate card)
│   ├── js/
│   │   ├── main.js             Entry point
│   │   ├── data-loader.js      Fetches generated JSON
│   │   ├── content.js          Settings-driven content (hero, contact, action bar, footer)
│   │   ├── services.js         Services & prices (cards on desktop, rate card on phones)
│   │   ├── navigation.js       Sticky header, mobile menu, active links
│   │   ├── booking.js          Appointment modal → WhatsApp
│   │   ├── i18n.js             English / Telugu labels and language switching
│   │   └── utils.js            Shared helpers
│   └── data/generated/         Generated by the build — do not edit by hand
├── assets/
│   ├── images/fallback.svg     Shown when a photo is missing or broken
│   └── icons/favicon.svg
└── dist/                       Build output (published by Netlify; not committed)
```

---

## 6. Content placeholders to replace

These were not provided and are marked as placeholders in the workbook:

- **Instagram / Facebook links** (`instagram_url`, `facebook_url`) — currently point to the platforms' home pages
- **WhatsApp number** (`whatsapp_number`) — set to phone number 1 (7993901988); change it if WhatsApp runs on the other number
- **Service descriptions** — starter copy (shown on desktop only); adjust to describe exactly what each service includes
- **Telugu wording** — written carefully, but should be checked by a native Telugu speaker from the parlour
- Stock photography — replace with the parlour's own work whenever available

---

## 7. Image licensing

All initial photos come from Unsplash and Pexels, whose licences allow free commercial use without required attribution. The `image_source` column records where each photo came from. Photos are loaded from the providers' CDNs.
