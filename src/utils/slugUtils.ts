
export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD') // Normalize Vietnamese characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const extractIdFromSlug = (slug: string): string | null => {
  // If slug contains UUID pattern, extract it
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = slug.match(uuidRegex);
  return match ? match[0] : null;
};
