# Help Links

A static row of help/contact items — icon + heading + description + optional
action link — e.g. "Locate us / Call us / Write to us". Container + repeatable
Help Link items.

## Authoring fields (Universal Editor)

**Help Links (container)**

| Field | Type | Notes |
|-------|------|-------|
| Heading | text | Optional section heading |

**Help Link (item)**

| Field | Type | Notes |
|-------|------|-------|
| Icon | reference | Item icon (DAM) |
| Icon Alt Text | text | Accessible alt |
| Heading | text | e.g. "Locate us" |
| Description | richtext | Supporting copy |
| Action Link | aem-content | Optional link target |
| Action Link Text | text | e.g. "Locate now" |

## Responsive behaviour

- **Mobile (base):** items stacked, icon beside the text.
- **Desktop (≥900px):** 3-across row.

## Notes

The red action link renders with a trailing chevron icon. Items with no action
link simply omit it.
