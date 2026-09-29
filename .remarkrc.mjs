import remarkMdx from 'remark-mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import proseLineLength from './scripts/remark-prose-line-length.mjs';

export default {
  plugins: [remarkMdx, [remarkFrontmatter, ['yaml', 'toml']], remarkGfm, [proseLineLength, 100]],
};
