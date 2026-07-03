# Credit Card Content Fragments — Setup Guide

Both `cards-featured` ("Popular Kotak Credit Cards") and `cards-lifestyle`
("A Credit Card for every need") can render a card in two ways:

1. **Inline** — author every field directly on the card item (existing behavior).
2. **Reference** — point a card item at a **Credit Card content fragment**, so
   the same card data is authored once and reused across both sections.

The reference path needs one-time AEM author/config setup, described below. The
front-end code (this repo) is already in place.

## How the code consumes a fragment

- The reference item exposes a single field, **Credit Card Fragment**
  (`cardRef`, an `aem-content` reference).
- At runtime the block fetches `${fragmentPath}.plain.html` and reads fields by
  **CSS class** (see `scripts/credit-card.js`).
- For that fetch to return usable HTML, the Content Fragment must be published to
  a servable EDS path via a **json2html overlay** (Configuration Service).

## Delivery HTML contract (the Mustache template must emit these classes)

`${fragmentPath}.plain.html` must contain elements with these classes anywhere
in the tree (nesting is not important — parsing is by class):

| Class | Content | Used by |
|-------|---------|---------|
| `.card-image` (wraps an `<img>`) | Card image | both |
| `.card-highlight` | Highlight main line (e.g. "5% cashback") | featured |
| `.card-highlight-sub` | Highlight sub line | featured |
| `.card-name` | Card name | both |
| `.card-badge` | Badge (e.g. "Best for Cashback") | lifestyle |
| `.card-fees` | Fees line (e.g. "Joining: ₹500 Annual: ₹500") | both |
| `.card-features` (a `<ul>`/`<ol>`) | Benefit bullets | both |
| `.card-tags` | Comma-separated filter tags | lifestyle |
| `.card-apply` (an `<a>`) | Apply link | both |
| `.card-compare` (an `<a>`) | Compare link | featured |

Example of the expected delivered markup:

```html
<div class="card-image"><picture><img src="/.../league.png" alt="League"></picture></div>
<div class="card-highlight">4X reward points</div>
<div class="card-highlight-sub">on dining, shopping & travel spends</div>
<div class="card-name">Kotak League Card</div>
<div class="card-badge">Best for Shopping</div>
<div class="card-fees">Joining fee: ₹999  Annual fee: ₹999</div>
<ul class="card-features">
  <li>4X reward points on dining & shopping</li>
  <li>Complimentary airport lounge access</li>
</ul>
<div class="card-tags">Shopping, Travel</div>
<a class="card-compare" href="/.../compare/league">Compare this card</a>
<a class="card-apply" href="/.../apply/league">Apply Now</a>
```

## Author-side steps (AEM — done in the browser, not in this repo)

1. **Create the Credit Card CF model** (Tools → General → Content Fragment
   Models). Suggested fields: `cardName`, `cardImage`, `highlight`,
   `highlightSub`, `badge`, `joiningFee`, `annualFee`, `features` (multi-line /
   list), `filterTags`, `applyLink`, `applyText`, `compareLink`, `compareText`.
2. **Create one fragment per card** (Cashback+, League, Air, IndianOil,
   Classic…) and fill each once.
3. **Configure the json2html overlay** in the Configuration Service: a path
   mapping + Mustache template that emits the delivery contract above so each
   fragment is served as self-contained HTML at its own path.
   See https://www.aem.live/developer/content-fragment-overlay
4. **In each section block**, add a **Featured Card (Reference)** /
   **Lifestyle Card (Reference)** item and set its **Credit Card Fragment** field
   to the fragment.

Update a fragment once and both sections reflect it. Inline cards continue to
work unchanged, so migration can be incremental.
