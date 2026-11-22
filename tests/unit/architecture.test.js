import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const root = new URL('../../site/', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const files = readdirSync(root, { recursive: true });
const scripts = files.filter(file => file.endsWith('.js'));

const ALLOWED = {
  content: ['content'],
  domain: ['domain', 'content', 'config.js'],
  state: ['state', 'domain', 'content'],
  ui: ['ui', 'content'],
  views: ['views', 'ui', 'domain', 'content', 'config.js'],
  pages: ['pages', 'views', 'ui', 'state', 'domain', 'content'],
};

for (const file of scripts) {
  test(`${file}: layer boundaries`, () => {
    const layer = file.split('/')[1];
    const source = read(file);
    for (const [, specifier] of source.matchAll(/from '([^']+)'/g)) {
      const target = new URL(specifier, new URL(file, root)).href.slice(new URL('js/', root).href.length).split('/')[0];
      assert.ok(ALLOWED[layer]?.includes(target), `${layer} must not import ${target}`);
    }
    if (layer !== 'pages') assert.doesNotMatch(source, /\b(document|window|location|navigator)\.[a-zA-Z]/);
    assert.doesNotMatch(source, /style="/);
  });
}

for (const file of files.filter(name => name.endsWith('.html'))) {
  test(`${file}: not indexed`, () => assert.match(read(file), /name="robots" content="noindex/));
}

for (const file of ['index.html', 'scenarios.html', 'copy.html']) {
  test(`${file}: strict CSP`, () => {
    const html = read(file);
    assert.match(html, /script-src 'self';/);
    assert.doesNotMatch(html, /unsafe-inline/);
  });
}
