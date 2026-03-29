export function toBaseSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function resolveUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  let counter = 1;
  while (existingSlugs.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}
