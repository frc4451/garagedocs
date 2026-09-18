import { describe, expect, it } from 'vitest';
import { isExternalWebsite } from './external-links';

describe('external website links', () => {
  const current = 'http://localhost:5173/badges/badge-1';
  const published = 'https://frc4451.github.io';
  it.each(['https://docs.google.com/document/d/example', '//docs.wpilib.org/en/stable/', 'https://github.com/frc4451/garagedocs'])('opens %s externally', href => {
    expect(isExternalWebsite(href, current, published)).toBe(true);
  });
  it.each(['/java', '#badge-check', '?view=all', '../badge-1-java', 'http://localhost:5173/java', 'https://frc4451.github.io/java', 'mailto:mentor@example.com', 'tel:123456789', 'blob:http://localhost:5173/example'])('keeps %s in its existing context', href => {
    expect(isExternalWebsite(href, current, published)).toBe(false);
  });
  it('does not mistake a lookalike host for GarageDocs', () => {
    expect(isExternalWebsite('https://frc4451.github.io.example.com', current, published)).toBe(true);
  });
});
