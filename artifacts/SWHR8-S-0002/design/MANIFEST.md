# Design manifest — SWHR8-S-0002

Capability brief **SWHR8-I-0003** (Localization), canvas doc version **12** (frozen). The files are exported byte-exact from the approved mockups. Draft wireframes are not exported.

| File                                               | Mockup                                              | Route / state                                     | Viewport |
| -------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------- | -------- |
| `mockup-language-selection.html`                   | SWHR8-MCK-15 Language selection                     | `/locale`, default (error alert shown on failure) | 1440     |
| `mockup-language-selection-mobile.html`            | SWHR8-MCK-16 Language selection · Mobile            | `/locale`, default                                | 390      |
| `mockup-language-changed-confirmation.html`        | SWHR8-MCK-17 Language changed confirmation          | `/locale` after submitting ja_JP                  | 1440     |
| `mockup-language-changed-confirmation-mobile.html` | SWHR8-MCK-18 Language changed confirmation · Mobile | `/locale` after submitting ja_JP                  | 390      |

The mockups draw a radio list. The locked acceptance test requires a `<select>` labelled "Language" (design.md of change `swhr8-i-0003-localization`, Spec discrepancies S1). The mockups also draw nav entries for areas that do not exist yet. Only areas that exist ship.
