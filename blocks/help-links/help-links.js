import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Help Links — a static row of help/contact items (icon + heading +
 * description + optional action link), e.g. "Locate us / Call us / Write to us".
 *
 * Rows are classified by CELL COUNT: an optional container heading is a
 * single-cell row; each Help Link is a multi-cell row (icon, heading,
 * description, action link). Each item keeps its data-aue-* via
 * moveInstrumentation so items stay visible/editable in Universal Editor even
 * before all fields are filled.
 * @param {Element} block the block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const itemRows = rows.filter((r) => r.children.length > 1);
  const chromeRows = rows.filter((r) => r.children.length <= 1);

  let heading = '';
  chromeRows.forEach((r) => {
    const t = (r.querySelector(':scope > div') || r).textContent.trim();
    if (t && !heading) heading = t;
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'help-links-inner';

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'help-links-title';
    h.textContent = heading;
    wrapper.append(h);
  }

  const list = document.createElement('ul');
  list.className = 'help-links-list';

  itemRows.forEach((row) => {
    const cells = [...row.children].map((c) => c.querySelector(':scope > div') || c);
    const iconCell = cells.find((c) => c.querySelector('picture'));
    const linkCell = cells.find((c) => c.querySelector('a'));
    // heading = first non-icon, non-link cell without block content
    const textCells = cells.filter((c) => c !== iconCell && c !== linkCell);
    const titleCell = textCells.find((c) => c.textContent.trim() && !c.querySelector('p, ul, ol'))
      || textCells[0];
    const descCell = textCells.find((c) => c !== titleCell && c.textContent.trim());

    const li = document.createElement('li');
    li.className = 'help-links-item';
    moveInstrumentation(row, li);

    // icon
    const iconWrap = document.createElement('div');
    iconWrap.className = 'help-links-icon';
    const pic = iconCell ? iconCell.querySelector('picture') : null;
    if (pic) {
      const img = pic.querySelector('img');
      const opt = createOptimizedPicture(img.src, img.getAttribute('alt') || '', false, [{ width: '80' }]);
      moveInstrumentation(img, opt.querySelector('img'));
      iconWrap.append(opt);
    }
    li.append(iconWrap);

    const body = document.createElement('div');
    body.className = 'help-links-body';
    let titleEl = null;
    if (titleCell && titleCell.textContent.trim()) {
      titleEl = document.createElement('h3');
      titleEl.className = 'help-links-item-title';
      titleEl.textContent = titleCell.textContent.trim();
      body.append(titleEl);
    }
    // collapsible detail = description + action link (hidden on mobile until
    // the heading is tapped)
    const detail = document.createElement('div');
    detail.className = 'help-links-detail';
    if (descCell) {
      const desc = document.createElement('div');
      desc.className = 'help-links-desc';
      [...descCell.childNodes].forEach((n) => desc.append(n.cloneNode(true)));
      detail.append(desc);
    }
    const link = linkCell ? linkCell.querySelector('a') : null;
    if (link && link.textContent.trim()) {
      link.className = 'help-links-action';
      detail.append(link);
    }
    if (detail.children.length) body.append(detail);
    li.append(body);

    // mobile accordion: tap the heading to reveal the detail
    if (titleEl && detail.children.length) {
      li.setAttribute('aria-expanded', 'false');
      titleEl.setAttribute('role', 'button');
      titleEl.setAttribute('tabindex', '0');
      const toggle = () => {
        const open = li.getAttribute('aria-expanded') === 'true';
        li.setAttribute('aria-expanded', open ? 'false' : 'true');
      };
      titleEl.addEventListener('click', toggle);
      titleEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    }

    list.append(li);
  });

  wrapper.append(list);
  block.textContent = '';
  block.append(wrapper);
}
