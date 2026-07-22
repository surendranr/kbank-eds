import { createOptimizedPicture } from '../../scripts/aem.js';
import { initK811, revealOnScroll } from '../../scripts/k811/k811-common.js';

/**
 * k811-promo-band — full-bleed lifestyle photo with overlaid copy.
 *
 * Used for the "nearest bank" / "811 Current Account" style sections on the
 * kotak811 homepage: a full-width background photo with a heading, paragraph
 * and optional CTA confined to one side (left or right) over the image.
 *
 * Rows (in model order):
 *   1. background image (reference)
 *   2. image alt text
 *   3. copy (richtext): heading + paragraph
 *   4. CTA link (optional)
 *   5. CTA text (optional)
 *   6. alignment token ("left" | "right") (optional plain text)
 *
 * @param {Element} block the block element
 */
export default function decorate(block) {
  initK811(block);

  const rows = [...block.children];
  const cells = rows.map((r) => r.querySelector(':scope > div') || r).filter(Boolean);

  const imageCell = cells.find((c) => c.querySelector('picture, img'));
  const linkCell = cells.find((c) => c !== imageCell && c.querySelector('a'));

  // an alt-text cell is plain text that isn't the alignment token and holds no headings
  const ALIGN = ['left', 'right'];
  const altCell = cells.find((c) => c !== imageCell && c !== linkCell
    && !c.querySelector('h1, h2, h3, h4, h5, h6, p, a')
    && c.textContent.trim()
    && !ALIGN.includes(c.textContent.trim().toLowerCase()));

  let alignFromText = '';
  cells.forEach((c) => {
    if (c === imageCell || c === linkCell || c === altCell) return;
    const token = c.textContent.trim().toLowerCase();
    if (ALIGN.includes(token) && !c.querySelector('h1, h2, h3, h4, h5, h6')) {
      alignFromText = token;
    }
  });

  const copyCell = cells.find((c) => c !== imageCell && c !== linkCell && c !== altCell
    && c.querySelector('h1, h2, h3, h4, h5, h6, p'));

  const altText = altCell ? altCell.textContent.trim() : '';

  // background image layer
  const media = document.createElement('div');
  media.className = 'k811-promo-band-media';
  const srcImg = imageCell ? imageCell.querySelector('img') : null;
  if (srcImg) {
    media.append(createOptimizedPicture(
      srcImg.src,
      altText || srcImg.getAttribute('alt') || '',
      false,
      [{ width: '1600' }],
    ));
  }

  // overlay copy
  const content = document.createElement('div');
  content.className = 'k811-promo-band-content';
  if (copyCell) {
    while (copyCell.firstChild) content.append(copyCell.firstChild);
  }
  const link = linkCell ? linkCell.querySelector('a') : null;
  if (link) {
    link.className = 'k811-promo-band-btn';
    const actions = document.createElement('p');
    actions.className = 'k811-promo-band-actions';
    actions.append(link);
    content.append(actions);
  }

  // alignment: explicit token wins, else class modifier, else default left
  const align = alignFromText || (block.classList.contains('right') ? 'right' : 'left');
  block.classList.add(`k811-promo-band-${align}`);

  block.textContent = '';
  if (media.firstChild) block.append(media);
  block.append(content);

  // AOS-faithful reveal: pure opacity fade-in.
  revealOnScroll(content);
}
