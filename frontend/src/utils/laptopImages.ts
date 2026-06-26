const BASE = 'https://images.unsplash.com';

/* Curated Unsplash photo IDs for laptop categories */
const PHOTOS = {
  macbook:   `${BASE}/photo-1517336714731-489689fd1ca8?w=800&q=80&fit=crop`,
  macbookPro:`${BASE}/photo-1611186871525-07e2c26c3d4c?w=800&q=80&fit=crop`,
  gaming:    `${BASE}/photo-1593640408182-31c70c8268f5?w=800&q=80&fit=crop`,
  gaming2:   `${BASE}/photo-1542751371-adc38448a05e?w=800&q=80&fit=crop`,
  asus:      `${BASE}/photo-1525547719571-a2d4ac8945e2?w=800&q=80&fit=crop`,
  hp:        `${BASE}/photo-1588872657578-7efd1f1555ed?w=800&q=80&fit=crop`,
  dell:      `${BASE}/photo-1496181133206-80ce9b88a853?w=800&q=80&fit=crop`,
  lenovo:    `${BASE}/photo-1593642632559-0c6d3fc62b89?w=800&q=80&fit=crop`,
  slim:      `${BASE}/photo-1541807084-5c52b6b3adef?w=800&q=80&fit=crop`,
  generic:   `${BASE}/photo-1581091226825-a6a2a5aee158?w=800&q=80&fit=crop`,
};

const GAMING_RE = /rog|strix|tuf|nitro|omen|pulse|gaming|gf\d|gl\d|msi|loa|loq/i;
const SLIM_RE   = /zenbook|yoga|slim|swift|envoy|envy|xps|macbook air/i;

export function getLaptopImage(brand: string, modelName: string): string {
  const full = `${brand} ${modelName}`;

  if (/apple/i.test(brand)) {
    return /pro/i.test(modelName) ? PHOTOS.macbookPro : PHOTOS.macbook;
  }
  if (GAMING_RE.test(full)) {
    return /msi/i.test(brand) ? PHOTOS.gaming2 : PHOTOS.gaming;
  }
  if (/asus/i.test(brand))   return SLIM_RE.test(full) ? PHOTOS.asus : PHOTOS.gaming;
  if (/hp/i.test(brand))     return PHOTOS.hp;
  if (/dell/i.test(brand))   return PHOTOS.dell;
  if (/lenovo/i.test(brand)) return SLIM_RE.test(full) ? PHOTOS.slim : PHOTOS.lenovo;
  if (/acer/i.test(brand))   return SLIM_RE.test(full) ? PHOTOS.slim : PHOTOS.generic;

  return PHOTOS.generic;
}

export function getLaptopImageThumb(brand: string, modelName: string): string {
  return getLaptopImage(brand, modelName).replace('w=800', 'w=400');
}
