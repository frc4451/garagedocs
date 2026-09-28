import { describe, expect, it } from 'vitest';
import { renderMath, renderTableMath } from './math';

describe('build-time math', () => {
  it('renders calculus and matrix notation as semantic MathML with TeX annotations', () => {
    for (const tex of [
      String.raw`\frac{\mathrm{d}e}{\mathrm{d}t}`,
      String.raw`\int_0^t e(\tau)\,\mathrm{d}\tau`,
      String.raw`\begin{bmatrix}1 & 2 \\ 3 & 4\end{bmatrix}`,
    ]) {
      const html = renderMath(tex, true);
      expect(html).toContain('<math');
      expect(html).toContain('display="block"');
      expect(html).toContain('<annotation encoding="application/x-tex">');
      expect(html).not.toContain('tml-error');
    }
  });

  it('fails the build for malformed notation', () => {
    expect(() => renderMath(String.raw`\frac{1}{`)).toThrow();
  });

  it('renders only explicit table delimiters and preserves code and HTML', () => {
    const html = renderTableMath(String.raw`<code>Math.sqrt(x)</code> is \(\sqrt{x}\).`);
    expect(html).toContain('<code>Math.sqrt(x)</code>');
    expect(html).toContain('<msqrt>');
    expect(renderTableMath('<code>int x = 2;</code>')).toBe('<code>int x = 2;</code>');
  });
});
