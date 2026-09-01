# Svelte shapes

Apply these rules to `.svelte` files in runes mode. The file entry represents
the component, including Svelte's implicit default export. Do not add a
`default` signature.

## Component interface

Treat each statically declared prop as a separate surface entry. Use `props` for
inline or untyped props. When `$props()` uses a named type, use that type's
actual name:

```text
props.fieldName: Type
PropsTypeName.fieldName: Type
```

Use the caller-facing prop name when destructuring renames it. Preserve these
interface details in the signature:

- Optional prop: keep the source's `?`, as in `props.fieldName?: Type`.
- Bindable prop: use the shape-only marker `$bindable<Type>`, as in
  `props.fieldName: $bindable<Type>`. This marker is not Svelte or TypeScript
  syntax. Use `$bindable` without a generic when the source expresses no type.
- Callback prop: keep its function type.
- Snippet prop: keep its `Snippet<...>` type.
- Untyped prop: omit `: Type`.

Describe any fallback value. Account for index signatures and rest props when
they accept additional caller input.

Also document these explicit interfaces when present:

- Exports from the instance `<script>`, which consumers access on the instance
  returned by `mount` or through `bind:this`.
- Named exports from `<script module>`, including exported top-level snippets.
- CSS custom properties read by the component as caller-controlled styling
  inputs. Use `custom property --name` as their canonical signature and describe
  any fallback.
- Custom-element behavior declared by `<svelte:options customElement={...}>`,
  including the tag, DOM property and attribute mappings, reflected properties,
  exported instance members, and the static `element` constructor.

Use ordinary source-language signatures for explicit exports. The signature
description must say whether an export belongs to the component instance or
compiled module when that distinction is not clear from its declaration.

## Observable behavior

The file description explains what rendering the component produces and records
observable behavior at the phase where it occurs:

- `<script module>` runs once when the compiled module evaluates.
- The instance `<script>` runs whenever Svelte creates a component instance.
- `$effect`, `$effect.pre`, `onMount`, `onDestroy`, actions, attachments,
  transitions, subscriptions, and cleanup run according to their Svelte
  lifecycle timing.
- Context changes, global event bindings, `<svelte:head>`, global or injected
  styles, network or storage access, navigation, logging, and DOM work can
  affect code outside the component.
- A custom element with a tag registers itself in `customElements` when its
  module evaluates.

User interaction is component behavior, not a load-time side effect. Describe
externally observable callbacks, mutations, navigation, and requests without
cataloguing internal event handlers.
