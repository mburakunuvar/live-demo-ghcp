const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const pages = ['index.html', 'ape.html', 'primitives.html'];

function loadPage(filename) {
  const html = fs.readFileSync(path.join(__dirname, '..', filename), 'utf-8');
  return new JSDOM(html);
}

describe('HTML Structure', () => {
  pages.forEach(page => {
    describe(page, () => {
      let dom, doc;
      beforeAll(() => {
        dom = loadPage(page);
        doc = dom.window.document;
      });

      test('should have a valid DOCTYPE', () => {
        const html = fs.readFileSync(path.join(__dirname, '..', page), 'utf-8');
        expect(html.trim().toLowerCase()).toMatch(/^<!doctype html>/);
      });

      test('should have lang attribute on html element', () => {
        expect(doc.documentElement.getAttribute('lang')).toBeTruthy();
      });

      test('should have charset meta tag', () => {
        const charset = doc.querySelector('meta[charset]');
        expect(charset).not.toBeNull();
      });

      test('should have viewport meta tag', () => {
        const viewport = doc.querySelector('meta[name="viewport"]');
        expect(viewport).not.toBeNull();
      });

      test('should have a title', () => {
        expect(doc.title).toBeTruthy();
      });

      test('should have a heading (h1)', () => {
        const h1 = doc.querySelector('h1');
        expect(h1).not.toBeNull();
        expect(h1.textContent.trim()).toBeTruthy();
      });

      test('should have properly nested headings', () => {
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        expect(headings.length).toBeGreaterThan(0);
      });

      test('all target="_blank" links should have rel="noopener"', () => {
        const blankLinks = doc.querySelectorAll('a[target="_blank"]');
        blankLinks.forEach(link => {
          const rel = link.getAttribute('rel') || '';
          expect(rel).toContain('noopener');
        });
      });
    });
  });
});

describe('Internal Links', () => {
  test('index.html should link to primitives.html', () => {
    const doc = loadPage('index.html').window.document;
    const link = doc.querySelector('a[href="primitives.html"]');
    expect(link).not.toBeNull();
  });

  test('index.html should link to ape.html', () => {
    const doc = loadPage('index.html').window.document;
    const link = doc.querySelector('a[href="ape.html"]');
    expect(link).not.toBeNull();
  });

  test('primitives.html should link back to index.html', () => {
    const doc = loadPage('primitives.html').window.document;
    const link = doc.querySelector('a[href="index.html"]');
    expect(link).not.toBeNull();
  });

  test('all internal links should point to existing files', () => {
    pages.forEach(page => {
      const doc = loadPage(page).window.document;
      const links = doc.querySelectorAll('a[href]');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
          const target = path.join(__dirname, '..', href);
          expect(fs.existsSync(target)).toBe(true);
        }
      });
    });
  });
});

describe('Content Verification', () => {
  test('index.html should mention GitHub Copilot', () => {
    const doc = loadPage('index.html').window.document;
    expect(doc.body.textContent).toContain('GitHub Copilot');
  });

  test('ape.html should mention Agentic Platform Engineering', () => {
    const doc = loadPage('ape.html').window.document;
    expect(doc.body.textContent).toContain('Agentic Platform Engineering');
  });

  test('primitives.html should mention Primitives', () => {
    const doc = loadPage('primitives.html').window.document;
    expect(doc.body.textContent).toContain('Primitives');
  });

  test('index.html should have exactly 4 surface cards', () => {
    const doc = loadPage('index.html').window.document;
    const cards = doc.querySelectorAll('.surface-card');
    expect(cards).toHaveLength(4);
  });

  test('primitives.html should have 8 primitives', () => {
    const doc = loadPage('primitives.html').window.document;
    const primitives = doc.querySelectorAll('.primitive');
    expect(primitives).toHaveLength(8);
  });
});

describe('Meta Tags', () => {
  pages.forEach(page => {
    test(`${page} should have a meta description`, () => {
      const doc = loadPage(page).window.document;
      const desc = doc.querySelector('meta[name="description"]');
      expect(desc).not.toBeNull();
      expect(desc.getAttribute('content')).toBeTruthy();
    });
  });
});
