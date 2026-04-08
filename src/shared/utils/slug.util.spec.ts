import { resolveUniqueSlug, toBaseSlug } from './slug.util';

describe('toBaseSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(toBaseSlug('Gabinete Silva')).toBe('gabinete-silva');
  });

  it('strips diacritics', () => {
    expect(toBaseSlug('Infraestrutura')).toBe('infraestrutura');
    expect(toBaseSlug('Câmara Municipal')).toBe('camara-municipal');
    expect(toBaseSlug('Saúde Pública')).toBe('saude-publica');
  });

  it('removes special characters', () => {
    expect(toBaseSlug('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(toBaseSlug('a   b')).toBe('a-b');
    expect(toBaseSlug('a--b')).toBe('a-b');
  });
});

describe('resolveUniqueSlug', () => {
  it('returns baseSlug when no conflicts', () => {
    expect(resolveUniqueSlug('gabinete-silva', [])).toBe('gabinete-silva');
  });

  it('returns baseSlug-1 on first conflict', () => {
    expect(resolveUniqueSlug('gabinete-silva', ['gabinete-silva'])).toBe(
      'gabinete-silva-1',
    );
  });

  it('returns baseSlug-2 when base and -1 are taken', () => {
    expect(
      resolveUniqueSlug('gabinete-silva', [
        'gabinete-silva',
        'gabinete-silva-1',
      ]),
    ).toBe('gabinete-silva-2');
  });
});
