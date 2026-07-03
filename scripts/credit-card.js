/*
 * Credit Card fragment helper.
 * Shared by cards-featured and cards-lifestyle to render a card either from
 * inline-authored cells OR from a referenced Credit Card content fragment.
 *
 * CF delivery contract (produced by the json2html overlay Mustache template
 * configured in the AEM Configuration Service): fetching `${path}.plain.html`
 * returns markup that contains, anywhere in the tree, elements identified by
 * these classes — parsed by className, not by exact nesting:
 *   .card-image (img)      .card-highlight        .card-highlight-sub
 *   .card-name             .card-badge            .card-fees
 *   .card-features (ul/ol) .card-tags             .card-apply (a)
 *   .card-compare (a)
 */

const text = (root, sel) => {
  const el = root.querySelector(sel);
  return el ? el.textContent.trim() : '';
};

const linkOf = (root, sel) => {
  const a = root.querySelector(`${sel} a`) || root.querySelector(sel);
  if (a && a.tagName === 'A') return { href: a.getAttribute('href') || '', text: a.textContent.trim() };
  return { href: '', text: '' };
};

/**
 * Normalize a fetched credit-card fragment root into a plain data object.
 * @param {Element} root the fetched fragment root
 * @returns {object} normalized card fields
 */
export function normalizeCreditCard(root) {
  const img = root.querySelector('.card-image img, img');
  const featuresList = root.querySelector('.card-features');
  const apply = linkOf(root, '.card-apply');
  const compare = linkOf(root, '.card-compare');
  return {
    imageSrc: img ? img.getAttribute('src') : '',
    imageAlt: img ? (img.getAttribute('alt') || '') : '',
    highlight: text(root, '.card-highlight'),
    highlightSub: text(root, '.card-highlight-sub'),
    name: text(root, '.card-name'),
    badge: text(root, '.card-badge'),
    fees: text(root, '.card-fees'),
    featuresList: featuresList ? featuresList.cloneNode(true) : null,
    tags: text(root, '.card-tags'),
    applyHref: apply.href,
    applyText: apply.text,
    compareHref: compare.href,
    compareText: compare.text,
  };
}

/**
 * Fetch and normalize a referenced Credit Card content fragment.
 * @param {string} path the fragment path (from an aem-content reference)
 * @returns {Promise<object|null>} normalized card fields, or null if unavailable
 */
export async function loadCreditCard(path) {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return null;
  const clean = path.replace(/(\.plain)?\.html/, '');
  const resp = await fetch(`${clean}.plain.html`);
  if (!resp.ok) return null;
  const root = document.createElement('div');
  root.innerHTML = await resp.text();
  return normalizeCreditCard(root);
}

/**
 * A CF-reference item row holds a single anchor pointing at a fragment path and
 * carries no image/content cells of its own.
 * @param {Element} row the item row
 * @returns {string|null} the referenced path, or null if this is an inline item
 */
export function cardReferencePath(row) {
  if (row.querySelector('picture')) return null;
  const anchors = row.querySelectorAll('a');
  if (anchors.length !== 1) return null;
  const href = anchors[0].getAttribute('href') || '';
  return href.startsWith('/') && !href.startsWith('//') ? href : null;
}
