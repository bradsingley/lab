# Message Bar Style Guidelines

The `mai-message-bar` component communicates inline system feedback with optional iconography, actions, and dismissal controls. Use this guide to select the correct intent, layout, and slot composition during development.

## Configuration Surface

- **Tag name**: `mai-message-bar`
- **Attributes**:
  - `intent="info|success|warning|error"` controls the color system; defaults to `info`.
  - `layout="singleline|multiline"` switches between compact and stacked grid templates; defaults to `singleline`.
  - `aria-live="polite|assertive|off"` exposes the live region politeness setting (polite by default).
  - `aria-labelledby="<element id>"` associates an external heading or label to the bar.
- **Appearance**: color treatment is entirely driven by `intent`; there is no additional `appearance` attribute.
- **Slots**:
  - Default slot for the message body content.
  - `slot="icon"` for leading indicator glyphs.
  - `slot="actions"` for one or more inline action controls.
  - `slot="dismiss"` for a trailing dismiss affordance.
- **Parts**: the FAST template does not expose named parts; styling relies on the internal `.content` and `.actions` containers.

## Style Sets and Layout Rules

### Informational intent (default)
- Host renders a four-column CSS grid `'icon body actions dismiss'` with `auto / 1fr` sizing, 100% width, `min-height: 36px`, and token-driven padding (`paddingContentAlignDefault`, `paddingContentAlignOutdentIconOnSubtle`).
- Background and border use `statusInformativeTintBackground` and `statusInformativeTintStroke`. Text inherits `foregroundCtrlNeutralPrimaryRest` and spacing between regions comes from `gapInsideCtrlDefault`.
- `.content` caps text width to `520px` and applies `paddingCtrlTextSide` to preserve breathing room; all slotted nodes inherit the component font metrics.
- `::slotted([slot='icon'])` centers vertically, while `.actions` aligns actions to the end with `gapBetweenCtrlDefault`. The dismiss slot remains visible inline with no extra offsets.
- Corner radius respects squircle support: browsers honoring `corner-shape: squircle` increase the radius via `--_squircle-modifier`.
- Example (`Default` story):

```ts
export const Default: Story = {
    args: {
        slottedContent: () =>
            "This is a message bar that provides information to the user.",

        iconSlottedContent: () => html`
            <span slot="icon">${info16Filled}</span>
        `,

        actionsSlottedContent: () => html`
            <mai-button slot="actions" size="small" appearance="outline">Action</mai-button>
        `,

        dismissSlottedContent: () => html`
            <mai-button slot="dismiss" size="small" appearance="subtle" icon-only aria-label="Close">
                ${dismiss20Regular}
            </mai-button>
        `,
    },
};
```

### Success intent
- `[intent="success"]` swaps the base tokens for `statusSuccessTintBackground` and `statusSuccessTintStroke`; layout metrics mirror the default intent.
- Use green-toned iconography but retain the neutral text color for readability.
- Example (`Intent` story):

```ts
{
    intent: MessageBarIntent.success,
    iconSlottedContent: () => html`
        <span slot="icon" style="color: #0E700E">
            ${checkmarkCircle16Filled}
        </span>
    `,

    slottedContent: () => "success",

    actionsSlottedContent: () => html`
        <mai-button size="small" slot="actions" appearance="outline">Action</mai-button>
    `,
}
```

### Warning intent
- `[intent="warning"]` applies `statusWarningTintBackground` and `statusWarningTintStroke`, introducing additional contrast for caution messages.
- Maintain the base grid; icon slot aligns center and may tint to `#DA3B01` as shown in Storybook.
- Example (`Intent` story):

```ts
{
    intent: MessageBarIntent.warning,
    iconSlottedContent: () => html`
        <span slot="icon" style="color: #DA3B01">${warning16Filled}</span>
    `,

    slottedContent: () => "warning",

    actionsSlottedContent: () => html`
        <mai-button size="small" slot="actions" appearance="outline">Action</mai-button>
    `,
}
```

### Error intent
- `[intent="error"]` uses `statusDangerTintBackground` and `statusDangerTintStroke`. The red tint keeps the same spacing and typography as the base style.
- Pair with an error icon and optional action buttons in `slot="actions"`.
- Example (`Intent` story):

```ts
{
    intent: MessageBarIntent.error,
    iconSlottedContent: () => html`
        <span slot="icon" style="color: #B10E1C">
            ${dismissCircle16Filled}
        </span>
    `,

    slottedContent: () => "error",

    actionsSlottedContent: () => html`
        <mai-button size="small" slot="actions" appearance="outline">Action</mai-button>
    `,
}
```

### Multiline layout
- `[layout="multiline"]` restructures the grid to two rows: first row `'icon body dismiss'`, second row `'actions actions actions'`. `padding-block` returns to `paddingContentAlignDefault` and horizontal padding becomes symmetrical.
- `.content` removes inner padding, aligns to the top, and allows text to wrap across multiple lines. Icon slot aligns to the start and stretches to full height for vertical alignment with multiline content.
- `.actions` moves below the message body with zero right margin, while the dismiss slot receives negative margins to keep the dismiss button flush with the outer padding.
- Example (`Layout` story):

```ts
{
    layout: MessageBarLayout.multiline,
    iconSlottedContent: () => html`
        <span slot="icon">${info16Filled}</span>
    `,

    slottedContent: () =>
        "The content of this message bar is multiline. That means it can span multiple lines. This is useful for longer messages. Hopefully this message is long enough to wrap to the next few lines.",
}
```

### Icon slot behavior
- The icon slot remains visible in all layouts, inherits the host font color, and centers vertically in single-line mode. In multiline mode it left-aligns and spans the grid row height.
- Example (shared with `Default` story):

```ts
iconSlottedContent: () => html`
    <span slot="icon">${info16Filled}</span>
`,
```

### Actions slot
- `.actions` wraps the `slot="actions"` content inside a flex container with end alignment and `gapBetweenCtrlDefault`. In single-line mode it sits inline; multiline mode pushes it below the message body with additional top margin.
- Example (`Default` story):

```ts
actionsSlottedContent: () => html`
    <mai-button slot="actions" size="small" appearance="outline">Action</mai-button>
`,
```

### Dismiss slot
- The dismiss slot stays in the final grid column for single-line layout. In multiline mode it gains negative margins equal to `paddingCtrlHorizontalIconOnly + 2px`, keeping the control visually aligned to the outer edge.
- Example (`Default` story):

```ts
dismissSlottedContent: () => html`
    <mai-button slot="dismiss" size="small" appearance="subtle" icon-only aria-label="Close">
        ${dismiss20Regular}
    </mai-button>
`,
```

### Live region (assertive)
- Switching `aria-live="assertive"` elevates urgency without affecting layout; use for critical alerts that must interrupt assistive tech announcements.
- Example (`aria-live="assertive"` story):

```ts
export const AriaLiveAssertive = {
    name: 'aria-live="assertive"',
    args: {
        ...Default.args,
        ariaLive: "assertive",
        slottedContent: () =>
            "This is a message bar that provides information to the user.",
    },
};
```

### External labelling
- Provide `aria-labelledby` when the bar is described by external text. Layout remains unchanged; the ID simply links to the live region.
- Example (`LabelledBy` story):

```ts
export const LabelledBy = {
    name: "aria-labelledby",
    render: renderComponent(html`
        <div id="message-bar-label">This is a label that describes the message bar.</div>
        ${storyTemplate}
    `),
    args: {
        ...Default.args,
        ariaLabelledby: "message-bar-label",
        slottedContent: () =>
            "This is a message bar that provides information to the user.",
    },
};
```

## Development Notes

- All slotted nodes inherit the host `font-size` and `line-height` to keep typography consistent with surrounding text.
- The host opts into `contain: layout style paint` to prevent layout shifts from leaking to ancestors; ensure outer containers manage width constraints.
- When icons are not provided, leave `slot="icon"` empty—the grid collapses the column automatically.
- Multiline content should remain under the `520px` body max width; wrap the component in a wider container if you need longer lines.
