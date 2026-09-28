# Math Notation and Rendering

GarageDocs uses **LaTeX notation rendered by Temml to native MathML at build time**. Mathematical symbols use locally bundled **Fira Math 0.3.4**. Explanatory prose, including text inside an equation, uses Fira Sans; Java and other literal code use Fira Code.

## Why This Renderer

LaTeX is the authoring notation, not a browser dependency. Temml produces semantic MathML with the original TeX annotation, requires no client-side JavaScript, and permits an OpenType math font such as Fira Math. All font and layout assets are local and available to the site's offline build.

We are not adopting Astro Typst for lessons. Its document compiler and separate notation would add a second authoring workflow when the requirement is equations embedded in MDX. Reconsider Typst if we later need independently typeset printable documents. Do not add another equation renderer just for one lesson.

Sources: [Temml administration](https://temml.org/docs/en/administration), [supported notation](https://temml.org/docs/en/supported), [Astro Typst](https://github.com/OverflowCat/astro-typst), and [Fira Math](https://github.com/firamath/firamath).

## Author Equations

`Equation` is registered globally for MDX. Use an inline equation inside a sentence:

```mdx
The rate is <Equation tex="\frac{\mathrm{d}e}{\mathrm{d}t}" />.
```

Use `display` for a standalone formula, integral, or matrix:

```mdx
<Equation display tex="\int_0^t e(\tau)\,\mathrm{d}\tau" />

<Equation display tex="\begin{bmatrix}1 & 2 \\ 3 & 4\end{bmatrix}" />
```

Backslashes in quoted MDX attributes are literal. In JavaScript strings, such as `ContentTable` cells and headers, escape each backslash and enclose the notation in `\\(` and `\\)`:

```mdx
<ContentTable
  headers={["Quantity", "Formula"]}
  rows={[["Speed", "\\(\\sqrt{v_x^2+v_y^2}\\)"]]}
/>
```

Only explicit table delimiters are rendered. Ordinary strings and `<code>` remain unchanged. Dollar-sign delimiters are not enabled. Do not put equation components inside code fences or Java examples.

## Teaching Conventions

- Define each symbol near its first use, including units and the independent variable. Map mathematical symbols to code names explicitly when they differ: for example, `kP` corresponds to the subscripted proportional gain.
- Use `\frac`, `\sqrt`, `\int`, `\sum`, and matrix environments instead of ASCII approximations. Use `\mathrm{d}` for differential notation, `\text{...}` for words, and upright units with `\mathrm{...}`.
- Distinguish exact equality from a rounded approximation with `\approx`. Explain continuous formulas separately from sampled numerical approximations.
- Preserve literal Java expressions, identifiers, API names, terminal output, and ASCII control-flow diagrams as code. Typography must not change runnable examples.
- Explain what an equation says in prose; do not make a screenshot of the equation the only explanation. MathML provides semantic structure, but screen-reader support varies by browser and assistive technology.
- Keep formulas compact. Standalone equations scroll horizontally and are keyboard focusable; check matrices and fractions at phone widths in light and dark themes.

## Maintenance and Validation

The implementation lives in `src/lib/math.ts`, `src/components/blocks/Equation.astro`, and `ContentTable.astro`. Invalid LaTeX throws and fails the build; it is not silently hidden. `trust: false` disables trusted HTML/URL extensions. This is an authored-content renderer, not an untrusted-input service.

Run `npm test`, `npm run check`, `npm run build`, and `npm run links`. Tests cover derivatives, definite integrals, matrices, table delimiters, and malformed notation. Also inspect rendered equations in a current browser: unit tests do not prove font loading or visual layout. Verify a non-root base path when changing asset links.

`public/vendor/fonts/Temml-Fira.css` is adapted from Temml 0.13.5's MIT-licensed `Temml-Asana.css`, with its font selection changed to Fira Math and site wrappers added. Keep upstream layout fixes when updating it. Font and renderer license texts are bundled beside the assets.

## Calculus Lesson Sequence

The rendering foundation was established before the calculus lessons. The Programming Math sequence now includes Functions and Rates of Change, Derivatives, and Integrals, in that order. It uses [Frank Thorne's USC MATH 141 curriculum](https://thornef.github.io/math141/index.html) as its curricular starting point: rates and slopes, derivatives, accumulation and definite integrals, then their relationship. The lessons connect derivative and integral meaning to PID only after introducing those mathematical ideas. Cite the specific materials actually used when extending them; do not imply USC endorsement or copy course handouts.
