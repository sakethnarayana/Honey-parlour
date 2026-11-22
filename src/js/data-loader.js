/**
 * Loads the JSON generated from data/website-content.xlsx by scripts/generate-data.js.
 * No business content lives in the frontend — everything comes from these files.
 */
const DATA_PATH = 'src/data/generated';

async function fetchJson(name) {
  const res = await fetch(`${DATA_PATH}/${name}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load ${name}.json (HTTP ${res.status})`);
  return res.json();
}

export async function loadSiteData() {
  const [services, settings] = await Promise.all([fetchJson('services'), fetchJson('settings')]);
  return { services, settings };
}
