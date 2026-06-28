const BASE = 'https://images.unsplash.com';

const url = (id: string, w: number) => `${BASE}/${id}?w=${w}&q=80&fit=crop`;

const GALLERIES: Record<string, string[]> = {
  iphone: [
    'photo-1592750475338-74b7b21085ab',
    'photo-1510557880182-3d4d3cba35a5',
    'photo-1512941937669-90a1b58e7e9c',
  ],
  samsung: [
    'photo-1610945265064-0e34e5519bbf',
    'photo-1565630916779-e303be97b6f5',
    'photo-1598327105666-5b89351aff97',
  ],
  xiaomi: [
    'photo-1598327106026-d9521da673d1',
    'photo-1580910051074-3eb694886505',
    'photo-1546054454-aa26e2b734c7',
  ],
  generic: [
    'photo-1511707171634-5f897ff02aa9',
    'photo-1598327105666-5b89351aff97',
    'photo-1546054454-aa26e2b734c7',
  ],
};

function pickCategory(brand: string): string {
  const b = brand.toLowerCase();
  if (b.includes('apple') || b.includes('iphone')) return 'iphone';
  if (b.includes('samsung')) return 'samsung';
  if (b.includes('xiaomi') || b.includes('redmi')) return 'xiaomi';
  return 'generic';
}

export function getPhoneGallery(brand: string, _modelName: string, w = 800): string[] {
  const ids = GALLERIES[pickCategory(brand)];
  return ids.map(id => url(id, w));
}

export function getPhoneImage(brand: string, _modelName: string): string {
  return getPhoneGallery(brand, _modelName, 800)[0];
}

export function getPhoneImageThumb(brand: string, _modelName: string): string {
  return getPhoneGallery(brand, _modelName, 400)[0];
}
