# Grid Patterns

## Copilot Discover grid
Responsive layout mixing `mai-gem-card`, `mai-content-card`, and `mai-video-card`. Cards lock aspect ratios at larger sizes; gem cards switch to vertical layout for small breakpoints.

```css
.grid {
  display: grid;
  gap: 16px;
  width: 100%;
  justify-self: center;
  grid-auto-rows: auto;
  grid-template-columns: 1fr 1fr;
  max-width: 816px;
  min-width: 576px;
}

mai-content-card,
mai-video-card {
  aspect-ratio: 1 / 1;
}

mai-gem-card {
  grid-column: span 2;
  aspect-ratio: 2 / 1;
  min-height: 344px;
}

@media (max-width: 648px) {
  .grid {
    grid-auto-rows: 416px;
    grid-template-columns: 1fr;
    max-width: unset;
    min-width: unset;
  }

  mai-content-card,
  mai-video-card,
  mai-gem-card {
    aspect-ratio: unset;
  }

  .story-title,
  mai-gem-card {
    grid-column: span 1;
  }
}

@media (max-width: 599px) {
  mai-gem-card {
    --preview-max-height: 176px;
    --preview-min-height: unset;
  }

  .gem-card-description {
    display: none;
  }
}
```

## News grid
Keeps row height fixed while columns scale for `mai-content-card` and `mai-video-card`.

```css
.grid {
  display: grid;
  gap: 16px;
  grid-auto-rows: 344px;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr;
  justify-self: center;
  max-width: 1040px;
  min-width: 932px;
}

@media (max-width: 932px) {
  .grid {
    grid-template-columns: 1fr 1fr;
    max-width: 736px;
    min-width: 616px;
  }
}

@media (max-width: 648px) {
  .grid {
    max-width: 360px;
    min-width: 300px;
    grid-template-columns: 1fr;
  }
}
```

## Shopping grid
`mai-product-card` layout with locked aspect ratios that shift to horizontal at smaller breakpoints.

```css
.grid {
  display: grid;
  gap: 24px;
  grid-auto-rows: auto;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  justify-self: center;
  max-width: 1248px;
  min-width: 680px;
}

mai-product-card {
  aspect-ratio: 1 / 1.8;
}

@media (max-width: 680px) {
  .grid {
    grid-template-columns: 1fr 1fr 1fr;
    max-width: 680px;
    min-width: 504px;
  }
}

@media (max-width: 504px) {
  .grid {
    max-width: unset;
    min-width: 300px;
    grid-template-columns: 1fr;
    grid-auto-rows: 160px;
  }

  mai-product-card {
    aspect-ratio: unset;
  }
}
```
