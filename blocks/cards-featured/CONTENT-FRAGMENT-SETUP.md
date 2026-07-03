# Credit Card cards — data source (JSON) setup

Both `cards-featured` ("Popular Kotak Credit Cards") and `cards-lifestyle`
("A Credit Card for every need") can render a card two ways:

1. **Inline** — author every field directly on the card item (unchanged).
2. **Reference** — point a card item at a Credit Card content fragment; the
   card data is resolved from a single JSON data source, so it is authored once
   and reused across both sections.

The reference path uses a committed JSON export instead of the json2html Config
Service overlay — no admin.hlx.page configuration required.

## Data source

- File: `/data/credit-cards.json` (committed in this repo).
- Shape: the GraphQL persisted-query export, `data.cardsFeaturedRefList.items[]`.
- Each item is keyed by its `_path` (the fragment DAM path).

The reference card item exposes one field, **Credit Card Fragment** (`cardRef`,
an `aem-content` reference). Its value (the fragment `_path`) is matched against
`_path` in the JSON, and the resolved card is rendered.

### Fields consumed (per item)

| JSON field | Rendered as |
|------------|-------------|
| `cardname` | card name (+ image alt) |
| `cardimage._path` | card image (**see note**) |
| `highlight` / `highlightsub` | pink highlight box (featured) |
| `badge` | badge chip (lifestyle) |
| `joiningfee` + `annualfee` | fees line |
| `features.html` | feature bullets (`<ul>`) |
| `filtertags.html` | filter tags (lifestyle) |
| `applytext` / `applylink` | Apply button |
| `comparetext` / `comparelink` | Compare link (featured) |
| `knowmoretext` / `knowmorelink` | Know More link (lifestyle) |

## IMPORTANT: image URLs missing from the current export

In the provided JSON, `cardimage` is `{ "__typename": "ImageRef" }` with **no
URL**. Cards will render without images until the GraphQL query is updated to
select the image URL, e.g.:

```graphql
cardimage { ... on ImageRef { _path _dynamicUrl } }
```

The code reads `cardimage._path`; add that (or the delivery URL) to the query
and regenerate `/data/credit-cards.json`.

## Updating the data

Re-run the GraphQL persisted query, save the result over
`/data/credit-cards.json`, commit, and push. (Later this can be swapped for a
live endpoint by changing `DATA_URL` in `scripts/credit-card.js`; the block
logic is unchanged.)

## Authoring a reference card

In each section block, add a **Featured Card (Reference)** /
**Lifestyle Card (Reference)** item and set its **Credit Card Fragment** field
to the fragment (its `_path` must exist in the JSON). Inline cards keep working,
so adoption is incremental.
