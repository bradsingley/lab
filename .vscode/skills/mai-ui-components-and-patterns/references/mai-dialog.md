# Dialog Style Guidelines

The `mai-dialog` component surfaces transient overlays for modal, non-modal, and alert flows. This guide summarizes the configurable surface, documents the layout and animation rules implemented in `packages/core/dialog/src/dialog.styles.ts`, and captures the Storybook examples that demonstrate each supported styling scenario.

## Configuration Surface

- **Tag name**: `mai-dialog`
- **Package**: `@mai-ui/dialog`
- **Attributes**:
  - `type="modal|non-modal|alert"` (defaults to `modal`)
  - Native `<dialog>` booleans such as `open`
  - Accessibility hooks: `aria-label`, `aria-labelledby`, `aria-describedby`
- **Public API**: `show()` and `hide()` programmatically toggle visibility; `dialog` exposes the underlying `HTMLDialogElement`
- **Recommended composition**: wrap dialog content in `mai-dialog-body` to gain the expected slot structure (`title`, `title-action`, `close`, `action`, default slot)
- **CSS custom properties**: `--dialog-backdrop` controls the overlay tint; `--dialog-starting-scale` adjusts the entry scale for the open animation

The base Storybook template wires these surfaces together and is a good reference when composing your own dialogs:

```ts
const storyTemplate = html<StoryArgs<Dialog & DialogBody>>`
    <mai-button @click="${x => x.storyDialog?.show()}">Open Dialog</mai-button>
    <mai-dialog
        id="dialog-default"
        type="${x => x.type}"
        ${ref("storyDialog")}
        aria-label="${story => story.ariaLabel}"
    >
        <mai-dialog-body ?no-title-action="${x => x.noTitleAction}">
            ${x => x.actionSlottedContent?.()}
            <div
                style="background: var(--smtc-status-informative-tint-background, var(--colorNeutralBackground5));display: flex;flex-direction: column;padding-inline: 10px;"
            >
                ${x => x.slottedContent?.()}
            </div>
            ${x => x.closeSlottedContent?.()} ${x => x.titleActionSlottedContent?.()}
            ${x => x.titleSlottedContent?.()}
        </mai-dialog-body>
    </mai-dialog>
`;
```

## Style Rules from `dialog.styles.ts`

### Base overlay (modal & alert)

- Host tokens define easing curves and a default squircle corner modifier; backdrop color is pulled from `--dialog-backdrop`
- `dialog` gains a blended background, shadow, brand stroke, `max-width` bound to the `ctrlDialogMaxWidth` token, and `max-height: calc(-48px + 100vh)` so content never exceeds the viewport minus 48px
- Slotted content inherits the same max height to enforce vertical scrolling inside the dialog rather than expanding the overlay
- The backdrop (`::backdrop`) is tinted and blurred via `backdrop-filter: blur(ctrlDialogBaseBackgroundBlur)`
- Progressive enhancement: browsers that support `corner-shape: squircle` automatically increase `--_squircle-modifier`

**Example** (`Default` story):

```ts
export const Default: Story = {
    args: {
        titleSlottedContent: () => html`
            <h2 slot="title">Default Dialog</h2>
        `,
        ariaLabel: "Default Dialog",
        slottedContent: () => html`
            <p>
                The dialog component is a window overlaid on either the primary window or
                another dialog window. Windows under a modal dialog are inert.
            </p>
            <p>
                That is, users cannot interact with content outside an active dialog
                window.
            </p>
        `,
        actionSlottedContent: () => closeButtonTemplate,
    },
};
```

### Non-modal layout override

- `:host([type='non-modal']) dialog` switches to `position: fixed`, stretches to the viewport inset, and enables `overflow: auto`
- Without the modal backdrop, focus can leave the dialog; plan keyboard affordances accordingly

**Example** (`Non-modal Type` story):

```ts
export const NonModalType: Story = {
    name: "Non-modal Type",
    render: renderComponent(html<StoryArgs<Dialog>>`
        <div style="min-height: 300px">${storyTemplate}</div>
    `),
    args: {
        type: DialogType.nonModal,
        titleSlottedContent: () => html`
            <h2 slot="title">Non-modal</h2>
        `,
        ariaLabel: "Non-Modal",
        slottedContent: () => html`
            <p>
                A non-modal dialog by default presents no backdrop, allowing elements
                outside of the dialog to be interacted with.
            </p>
            <p>
                <strong>Note:</strong>
                if an element outside of the dialog is focused then it will not be
                possible to close the dialog with the Escape key.
            </p>
            <code>type="non-modal"</code>
        `,
        actionSlottedContent: () => closeButtonTemplate,
    },
};
```

### Content height & scrolling

- `::slotted(*)` mirrors the host max-height so overly tall content scrolls inside the dialog body instead of expanding the overlay
- Additional styles can clamp child height (see story decorator adding `height: 500px`)

**Example** (`ScrollingLongContent` story):

```ts
export const ScrollingLongContent: Story = {
    args: {
        titleSlottedContent: () => html`
            <h2 slot="title">Scrolling Long Content</h2>
        `,
        ariaLabel: "Scrolling Long Content",
        actionSlottedContent: () => closeButtonTemplate,
        slottedContent: () => html`
            <p>
                By default content provided in the default slot should grow until it fits
                viewport size. Overflow content will be scrollable. This story's content
                is vertically clamped to demonstrate the scrolling behavior.
            </p>
            <hr />
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce nec lectus
                non lorem iaculis luctus. Proin ac dolor eget enim commodo pretium. Duis
                ut nibh ac metus interdum finibus. Integer maximus ante a tincidunt
                pretium. Aliquam erat volutpat. Sed nec ante vel lectus dignissim commodo
                id ut elit. Curabitur ullamcorper sapien id mauris interdum, ac placerat
                mi malesuada. Duis aliquam, dolor eget facilisis mollis, ante leo
                tincidunt quam, vel convallis ipsum turpis et turpis. Mauris fermentum
                neque nec tortor semper tempus. Integer malesuada, nunc ac cursus
                facilisis, lectus mauris interdum erat, in vulputate risus velit in neque.
                Etiam volutpat ante nec fringilla tempus. Quisque et lobortis dolor. Fusce
                sit amet odio sed ipsum fringilla auctor. Suspendisse faucibus tellus in
                luctus hendrerit. Vestibulum euismod velit non laoreet feugiat. Nam sit
                amet velit urna. Cras consectetur tempor sem, in suscipit sem ultrices id.
                Vivamus id felis fringilla, scelerisque nulla non, aliquam leo. In
                pharetra mauris ut enim ullamcorper, id suscipit quam ullamcorper. Quisque
                tincidunt, felis nec congue elementum, mauris est finibus ex, ut volutpat
                ante est nec est. Aliquam tempor, turpis ac scelerisque dignissim, metus
                velit rutrum sem, eget efficitur mauris erat in metus. Vestibulum in urna
                massa. Donec eleifend leo at dui convallis aliquet. Integer eleifend,
                velit ut consequat tempus, enim elit ultricies diam, at congue enim enim
                id nunc. Nullam fringilla bibendum nulla, at lacinia sem bibendum eget.
                Nunc posuere ipsum sed enim facilisis efficitur. Pellentesque id semper
                mi, a feugiat sem. Nunc interdum, leo ut tincidunt consectetur, nunc
                mauris accumsan nulla, vel ultricies velit erat nec sapien. Praesent
                eleifend ex at odio scelerisque cursus. Morbi eget tellus sed sapien
                scelerisque cursus at a ante. Sed venenatis vehicula erat eu feugiat. Ut
                eu elit vitae urna tincidunt pulvinar nec at nunc. Vestibulum eget
                tristique sapien. Sed egestas sapien vel ante viverra pharetra. Cras sit
                amet felis at nulla tincidunt euismod vitae et justo. Duis nec rutrum
                lectus, nec lobortis quam. Pellentesque habitant morbi tristique senectus
                et netus et malesuada fames ac turpis egestas. Sed ac ex condimentum,
                consectetur felis non, maximus odio. Sed mattis arcu id justo fringilla, a
                tristique purus vestibulum. Nulla nec fringilla quam. Sed ac elit ac sem
                posuere cursus nec vitae mauris. Suspendisse nec pulvinar risus. Sed a
                tincidunt elit, in gravida tortor. Quisque sollicitudin lectus vel
                interdum tempor. Fusce dictum fermentum sem sed suscipit. Vivamus
                sollicitudin ex turpis, sit amet consequat leo auctor at. Donec fermentum
                aliquet lectus, sit amet efficitur nibh pellentesque et. Curabitur dapibus
                quam vitae lectus pellentesque, vitae varius massa facilisis. Quisque
                consectetur eros a arcu cursus fringilla. Fusce efficitur auctor nibh, nec
                sollicitudin eros semper eget. Cras a elit ut tortor semper volutpat eu
                vel nunc. Duis dapibus quam risus, ac tristique nisl aliquam eu. Curabitur
                vel ipsum non nunc euismod fringilla vel a lorem. Curabitur viverra magna
                ac justo fringilla, eu vestibulum purus finibus. Donec elementum volutpat
                libero, in tempus massa convallis vitae. Curabitur vitae mauris id urna
                dictum pharetra. Nullam vehicula arcu arcu, vitae elementum enim tincidunt
                at. Duis eleifend, lorem a efficitur facilisis, nulla dolor finibus orci,
                et ullamcorper orci ex ac purus. Aenean sem lectus, malesuada id magna id,
                facilisis condimentum nibh. Cras tempor neque mi, sit amet suscipit libero
                consectetur non. Nullam id eleifend mauris. Mauris iaculis lectus eu
                scelerisque efficitur. In id suscipit libero. Donec condimentum, purus ac
                laoreet facilisis, risus lorem facilisis neque, id volutpat felis mi eget
                metus. Nulla facilisi. Donec consequat tincidunt nunc sed elementum.
                Integer consectetur tristique orci, ut congue justo pellentesque eu. Fusce
                faucibus iaculis mauris, eu lobortis orci egestas eget. Nullam nec arcu
                bibendum, cursus diam ac, facilisis enim. Nulla facilisi. Curabitur
                lacinia odio mauris, a gravida nisi volutpat in. Aliquam at maximus felis.
                Vestibulum convallis dignissim urna id gravida.
            </p>
        `,
    },
    decorators: [
        Story => {
            const story = Story() as HTMLElement;
            const dialog = story.querySelector<Dialog>("mai-dialog");

            dialog?.$fastController.addStyles(css`
                ::slotted(*) {
                    height: 500px;
                }
            `);

            return story;
        },
    ],
};
```

### Motion and reduced-motion handling

- Animations are wrapped in an `@layer animations` block; when `prefers-reduced-motion` indicates no preference, both the dialog and backdrop animate opacity, display, overlay, and scale transitions
- Closing sequences accelerate via `--_curveAccelerateMid`; opening uses `--_curveDecelerateMid`
- `@starting-style` seeds the inverse state so the dialog scales from `--dialog-starting-scale`
- The outer border is enforced with the `strokeWidthDefault` token against `ctrlDialogStroke`, and transitions respect `--_durationGentle`

Trigger dialog visibility with `show()` / `hide()` as demonstrated in the shared template above. Those calls automatically drive the open/close transitions.

## Slot Usage Patterns (from `dialog.stories.ts`)

### Title action affordance

```ts
export const WithTitleAction: Story = {
    args: {
        titleSlottedContent: () => html`
            <h2 slot="title">Title Action Slot</h2>
        `,
        ariaLabel: "Title Action Slot",
        titleActionSlottedContent: () => html`
            <mai-button appearance="subtle" icon-only slot="title-action">
                ${info20Regular}
            </mai-button>
        `,
        slottedContent: () => html`
            <p>
                This example shows a button slotted into the
                <code>title-action</code>
                slot.
            </p>
        `,
        actionSlottedContent: () => closeButtonTemplate,
    },
};
```

### Modal, non-modal, and alert choices

```ts
export const ModalType: Story = {
    args: {
        type: DialogType.modal,
        titleSlottedContent: () => html`
            <h2 slot="title">Modal</h2>
        `,
        ariaLabel: "Modal",
        slottedContent: () => html`
            <p>
                A modal is a type of dialog that temporarily halts the main workflow to
                convey a significant message or require user interaction. By default,
                interactions such as clicking outside the dialog or pressing the Escape
                key will close the modal-dialog, resuming the user's interaction with the
                main content.
            </p>
            <code>type="modal"</code>
        `,
        actionSlottedContent: () => closeButtonTemplate,
    },
};

export const AlertType: Story = {
    args: {
        type: DialogType.alert,
        closeSlottedContent: () => html``,
        titleSlottedContent: () => html`
            <h2 slot="title">Alert</h2>
        `,
        ariaLabel: "Alert",
        actionSlottedContent: () => closeButtonTemplate,
        slottedContent: () => html`
            <p>
                An alert is a type of modal-dialog that interrupts the user's workflow to
                communicate an important message and acquire a response. By default
                clicking on backdrop will not dismiss an alert dialog.
            </p>
            <code>type="alert"</code>
        `,
    },
};
```

### Action stack layouts

```ts
export const Actions: Story = {
    args: {
        titleSlottedContent: () => html`
            <h2 slot="title">Actions</h2>
        `,
        ariaLabel: "Actions",
        actionSlottedContent: () => html`
            <mai-button size="small" slot="action">Something</mai-button>
            <mai-button size="small" slot="action">Something Else</mai-button>
            <mai-button size="small" slot="action">Something Else Entirely</mai-button>
            ${closeButtonTemplate}
        `,
        slottedContent: () => html`
            <p>
                A dialog should have no more than
                <strong>two</strong>
                actions.
            </p>
            <p>
                However, if required, you can populate the action slot with any number of
                buttons as needed.
            </p>
        `,
    },
};

export const ActionsMobile: Story = {
    args: {
        titleSlottedContent: () => html`
            <h2 slot="title">Actions - mobile</h2>
        `,
        ariaLabel: "Actions mobile",
        actionSlottedContent: () => html`
            <mai-button slot="action">Something</mai-button>
            <mai-button slot="action">Something Else</mai-button>
            <mai-button slot="action">Something Else Entirely</mai-button>
            ${closeButtonTemplate}
        `,
        slottedContent: () => html`
            <p>
                A dialog should have no more than
                <strong>two</strong>
                actions.
            </p>
            <p>
                However, if required, you can populate the action slot with any number of
                buttons as needed.
            </p>
        `,
    },
    decorators: [
        Story => {
            const story = Story() as HTMLElement;
            const dialog = story.querySelector<Dialog>("mai-dialog");

            dialog?.$fastController.addStyles(css`
                dialog {
                    width: 400px;
                }
            `);

            return story;
        },
    ],
};
```

### Close affordances

```ts
export const CustomClose: Story = {
    args: {
        closeSlottedContent: () => html`
            <mai-button
                slot="close"
                appearance="subtle"
                icon-only
                @click="${() => alert("This is a custom action")}" 
            >
                ${dismissCircle20Regular}
            </mai-button>
        `,
        slottedContent: () => html`
            <p>
                The
                <code>close</code>
                slot can be customized to add a different kind of action. Custom close
                slots can be used in any kind of dialog. Here's an example which uses a
                <code>&lt;mai-button&gt;</code>
                and a custom icon. Clicking the button will trigger a JavaScript alert.
            </p>
        `,
        titleSlottedContent: () => html`
            <h2 slot="title">Custom Close Slot</h2>
        `,
        ariaLabel: "Custom Close Slot",
    },
};

export const NoClose: Story = {
    args: {
        titleSlottedContent: () => html`
            <h2 slot="title">No Close Slot</h2>
        `,
        ariaLabel: "No Close Slot",
        closeSlottedContent: () => html``,
        slottedContent: () => html`
            <p>
                By not passing the
                <code>close</code>
                slot no close button will render.
            </p>
        `,
    },
};
```

### Complex layouts within the content slot

```ts
export const TwoColumnLayout: Story = {
    args: {
        titleSlottedContent: () => html`
            <h2 slot="title">Two Column Layout</h2>
        `,
        ariaLabel: "Two Column Layout",
        slottedContent: () => html`
            <div style="margin-bottom: 12px;">
                <fluent-text block>
                    The dialog is designed with flexibility in mind, accommodating
                    multiple column layouts within its structure.
                </fluent-text>
            </div>
            <form
                style="display: grid; grid-template-columns: 1fr 1.5fr; grid-column-gap: 12px; margin-bottom: 4px; overflow-x: hidden;"
                @submit="${story =>
                    story.successMessage.toggleAttribute("hidden", false)}"
            >
                <div style="height: 248px;">
                    <img
                        alt="image layout story"
                        src="${generateImage({ width: 240 })}"
                    />
                </div>
                <div
                    style="display: flex; flex-direction: column; align-items: flex-start; gap: 1em"
                >
                    <fluent-text weight="semibold" block>
                        Here's an Example Form!
                    </fluent-text>

                    <mai-field>
                        <mai-text-input slot="input">
                            <label>Text Input</label>
                        </mai-text-input>
                    </mai-field>

                    <mai-field>
                        <label slot="label">Range Slider</label>
                        <mai-slider
                            slot="input"
                            min="0"
                            max="100"
                            value="50"
                        ></mai-slider>
                    </mai-field>

                    <mai-field label-position="after">
                        <label slot="label">Checkbox</label>
                        <mai-checkbox slot="input"></mai-checkbox>
                    </mai-field>

                    <mai-button type="submit" appearance="primary">Submit</mai-button>
                    <span id="success-message" hidden ${ref("successMessage")}>
                        Form submitted successfully!
                    </span>
                </div>
            </form>
        `,
    },
};
```

## Development Notes

- Always provide an accessible name via `aria-label` or `aria-labelledby`
- For alert dialogs, retain an explicit affirmative/negative choice to satisfy their blocking semantics
- Pair programmatic visibility controls (`show()` / `hide()`) with the built-in transitions rather than toggling the `open` attribute manually
- Customize overlays with design tokens instead of hard-coded colors to stay aligned with the MAI design system
