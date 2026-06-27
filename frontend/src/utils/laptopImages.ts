const BASE = 'https://images.unsplash.com';

const url = (id: string, w: number) => `${BASE}/${id}?w=${w}&q=80&fit=crop`;

/* Curated Unsplash photo IDs — real laptop photography, grouped by category.
   Each gallery has 3 distinct shots so the card can cycle through them on hover. */
const GALLERIES: Record<string, string[]> = {
  macbook: [
    'photo-1517336714731-489689fd1ca8',
    'photo-1541807084-5c52b6b3adef',
    'photo-1496181133206-80ce9b88a853',
  ],
  macbookPro: [
    'photo-1611186871525-07e2c26c3d4c',
    'photo-1517336714731-489689fd1ca8',
    'photo-1531297484001-80022131f5a1',
  ],
  gaming: [
    'photo-1593640408182-31c70c8268f5',
    'photo-1542751371-adc38448a05e',
    'photo-1603302576837-37561b2e2302',
  ],
  gamingMsi: [
    'photo-1542751371-adc38448a05e',
    'photo-1593640408182-31c70c8268f5',
    'photo-1629131726692-1accd0c53ce0',
  ],
  asus: [
    'photo-1525547719571-a2d4ac8945e2',
    'photo-1484788984921-03950022c9ef',
    'photo-1531297484001-80022131f5a1',
  ],
  hp: [
    'photo-1588872657578-7efd1f1555ed',
    'photo-1593642632559-0c6d3fc62b89',
    'photo-1498050108023-c5249f4df085',
  ],
  dell: [
    'photo-1496181133206-80ce9b88a853',
    'photo-1484788984921-03950022c9ef',
    'photo-1531297484001-80022131f5a1',
  ],
  lenovo: [
    'photo-1593642632559-0c6d3fc62b89',
    'photo-1588872657578-7efd1f1555ed',
    'photo-1498050108023-c5249f4df085',
  ],
  slim: [
    'photo-1541807084-5c52b6b3adef',
    'photo-1525547719571-a2d4ac8945e2',
    'photo-1484788984921-03950022c9ef',
  ],
  generic: [
    'photo-1498050108023-c5249f4df085',
    'photo-1531297484001-80022131f5a1',
    'photo-1496181133206-80ce9b88a853',
  ],
};

const GAMING_RE = /rog|strix|tuf|nitro|omen|pulse|gaming|gf\d|gl\d|msi|loa|loq/i;
const SLIM_RE   = /zenbook|yoga|slim|swift|envoy|envy|xps|macbook air/i;

function pickCategory(brand: string, modelName: string): string {
  const full = `${brand} ${modelName}`;

  if (/apple/i.test(brand)) {
    return /pro/i.test(modelName) ? 'macbookPro' : 'macbook';
  }
  if (GAMING_RE.test(full)) {
    return /msi/i.test(brand) ? 'gamingMsi' : 'gaming';
  }
  if (/asus/i.test(brand))   return SLIM_RE.test(full) ? 'asus' : 'gaming';
  if (/hp/i.test(brand))     return 'hp';
  if (/dell/i.test(brand))   return 'dell';
  if (/lenovo/i.test(brand)) return SLIM_RE.test(full) ? 'slim' : 'lenovo';
  if (/acer/i.test(brand))   return SLIM_RE.test(full) ? 'slim' : 'generic';

  return 'generic';
}

/** Full gallery (3 photos) for a laptop, at the requested width. */
export function getLaptopGallery(brand: string, modelName: string, w = 800): string[] {
  const ids = GALLERIES[pickCategory(brand, modelName)];
  return ids.map(id => url(id, w));
}

/** Single hero photo (first of the gallery) at full size. */
export function getLaptopImage(brand: string, modelName: string): string {
  return getLaptopGallery(brand, modelName, 800)[0];
}

/** Single thumbnail-sized photo (first of the gallery). */
export function getLaptopImageThumb(brand: string, modelName: string): string {
  return getLaptopGallery(brand, modelName, 400)[0];
}
