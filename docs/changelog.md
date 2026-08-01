---
title: Vue Easy DnD v3 Migration Guide
description: Migrate Vue Easy DnD applications from version 2 to version 3, including Composition API, TypeScript, packaging, events, and drag-image changes.
---

# Version 3 changelog and migration guide

Version 3 modernizes Vue-Easy-DnD's public API, packaging, and internals while preserving the component API used by most applications. This guide covers migration from the latest version 2 release to version 3.

::: tip Is my application affected?
If you import components from `vue-easy-dnd`, use documented props and slots, and handle the existing component events, the upgrade should usually require only updating the package and testing your drag-and-drop flows.

Applications that import the version 2 mixins, source files inside `vue-easy-dnd/src`, or generated JavaScript files inside `vue-easy-dnd/dist` need the changes described below. The legacy `vue-easy-dnd/dist/dnd.css` stylesheet path remains supported.
:::

## 3.0.0

### Added

- Composition API utilities: `useDragAware`, `useDrag`, and `useDrop`.
- TypeScript declarations and exported public types.
- Lazy selector handles and function-based handles outside a `Drag` root.
- `refreshDragImage()` for reactive drag-image content.
- Configurable autoscroll speed and scroll propagation.
- Per-item position locking through `DropList.reorderable`.
- Default-slot content inside `DropList`.
- Drag-and-drop support inside open Shadow DOM roots.

### Changed

- Components and internal state have moved from Options API mixins to typed Composition API controllers.
- Package output now uses explicit ESM, CommonJS, browser-global, stylesheet, and type exports.
- Distributed JavaScript now targets ES2022.
- Vue is now a peer dependency rather than a bundled/runtime dependency.
- Drag lifecycle cleanup, drag-image ownership, edge scrolling, and DropList layout refreshes are more tightly scoped.
- Documentation examples are live Vue 3 demos instead of external sandboxes and large animated images.

### Fixed

- Drag targets, movement events, drop routing, and scroll-parent lookup now work across open shadow roots.
- Handles rendered after component mount are resolved when input begins.
- External handles can initiate their associated drag without being nested inside it.
- Active drag images can be refreshed without accumulating stale clones.
- DropList updates its insertion/reordering layout when items or direction change during a drag.
- Drag timers, document listeners, root listeners, and pending image operations are cleaned up when a drag ends or a component unmounts.

### Removed

- `DragAwareMixin`, `DragMixin`, and `DropMixin`.
- Published source files and supported imports through `vue-easy-dnd/src/*`.
- Reliance on generated v2 bundle filenames such as `vue-easy-dnd.esm.js` and `vue-easy-dnd.ssr.js`.
- The `mitt` runtime dependency.

## Migration checklist

1. Upgrade Vue-Easy-DnD and confirm your application uses Vue `^3.2.25`.
2. Confirm your browser target supports ES2022 or transpile the dependency in your application build.
3. Prefer the new `vue-easy-dnd/style.css` stylesheet export.
4. Replace `DragAwareMixin`, `DragMixin`, and `DropMixin` imports.
5. Replace imports from package internals with exports from `vue-easy-dnd`.
6. If a `tag` prop refers to a Vue component, confirm that component renders one HTML root element. On `DropList`, also enable `no-animations`.
7. Test custom drag images, nested lists, and application-specific reorder handlers.

## Installation

```bash
npm install vue-easy-dnd@^3
```

Vue `^3.2.25` is required. Vue is a peer dependency and is not bundled with the library.

Version 3 output targets ES2022. Transpile the dependency in your application if you support an older browser baseline.

Use the stable stylesheet export:

```ts
import 'vue-easy-dnd/style.css'
```

The version 2 path remains available for compatibility:

```ts
import 'vue-easy-dnd/dist/dnd.css'
```

## Breaking changes

### Mixins have been replaced by composables

The public `DragAwareMixin`, `DragMixin`, and `DropMixin` exports have been removed. Version 3 uses the Vue Composition API and exports `useDragAware`, `useDrag`, and `useDrop` instead.

For drag-aware state, replace `DragAwareMixin`:

```js
// Version 2
import { DragAwareMixin } from 'vue-easy-dnd'

export default {
  mixins: [DragAwareMixin]
}
```

with `useDragAware`:

```vue
<script setup>
import { useDragAware } from 'vue-easy-dnd'

const {
  dragInProgress,
  dragType,
  dragData,
  dragPosition,
  dragSource,
  dragTop
} = useDragAware()
</script>
```

The returned values are computed refs. Vue unwraps them automatically in templates.

Options API components can return the same composable from `setup`:

```js
import { useDragAware } from 'vue-easy-dnd'

export default {
  setup () {
    return useDragAware()
  }
}
```

For components that previously incorporated `DragMixin` or `DropMixin` directly:

| Version 2 API | Version 3 replacement |
| --- | --- |
| `DragMixin` | Prefer the `Drag` component, or use the lower-level `useDrag` composable in a custom wrapper. |
| `DropMixin` | Prefer the `Drop` component, or use the lower-level `useDrop` composable in a custom wrapper. |

`useDrag` and `useDrop` require element refs and component-specific options, so they are intended for custom component authors rather than as drop-in mixin replacements. Standard consumers should continue using `Drag`, `Drop`, `DropList`, and `DropMask`.

### Package-internal imports are no longer supported

Version 3 publishes compiled output and TypeScript declarations through an explicit package export map. Source files are no longer included in the npm package.

Replace deep imports:

```ts
// Version 2: no longer supported
import Drag from 'vue-easy-dnd/src/components/Drag.vue'
import { ReorderEvent } from 'vue-easy-dnd/src/js/events'
```

with package-root imports:

```ts
import { Drag, ReorderEvent } from 'vue-easy-dnd'
```

Do not reference generated JavaScript filenames such as `vue-easy-dnd.esm.js` or `vue-easy-dnd.ssr.js`. Bundlers should resolve the ESM or CommonJS entry automatically.

### Custom `tag` components need an HTML root

When `Drag`, `Drop`, or `DropMask` receives a Vue component through its `tag` prop, that component must resolve to a single HTML root element. Version 3 reports a descriptive error when it cannot obtain that element.

`DropList` uses Vue's `TransitionGroup` by default, so its `tag` should be an HTML tag while animations are enabled. To use a Vue component, set `no-animations`; the component must then resolve to one HTML root element.

Native tag names such as `div`, `li`, and `section` require no changes.

## New public APIs

### TypeScript declarations

Version 3 is written in TypeScript and publishes declarations for its public components, composables, events, and drag-and-drop state.

Types can be imported directly from the package:

```ts
import type { DnDEventPayload, DragData, DragType } from 'vue-easy-dnd'

function onDrop (event: DnDEventPayload) {
  console.log(event.type, event.data)
}
```

### Lazy and external drag handles

`Drag.handle` still accepts a selector string, but the selector is now resolved when pointer input begins. This allows handles that render after the `Drag` component mounts.

The prop also accepts a function returning an `Element` or `null`. Function handles may be located outside the `Drag` root and are also resolved on pointer-down.

```vue
<Drag :handle="() => toolbarButton">
  Drag content
</Drag>
```

See the [Drag handle documentation](./components/drag.md#lazy-and-external-handles) for a complete example.

### Dynamic drag images

The new `refreshDragImage()` helper replaces the active drag image after Vue renders reactive slot changes.

```ts
import { refreshDragImage } from 'vue-easy-dnd'

previewMode.value = 'expanded'
void refreshDragImage()
```

Existing static `drag-image` slots continue to work without calling this helper. See [Dynamic drag images](./components/drag.md#dynamic-drag-images).

### Autoscroll controls

`Drag` adds two optional controls:

| Prop | Default | Purpose |
| --- | --- | --- |
| `scrolling-speed` | `50` | Sets the maximum pixels applied by each automatic scrolling step. |
| `scrolling-propagation` | `true` | Allows automatic scrolling to continue through outer scroll containers. |

`DropList.scrolling-propagation` may override the source `Drag` while that list is the active target. Existing `scrolling-edge-size` behavior is unchanged.

### Position locking in DropList

The new `DropList.reorderable` prop accepts a boolean or `(item, index) => boolean` predicate. Returning `false` pins that position while unlocked items can still move across it.

```vue
<DropList
  :items="items"
  :reorderable="item => !item.locked"
  @reorder="$event.apply(items)"
>
  <template #item="{ item }">
    <Drag :key="item.id" :disabled="item.locked">
      {{ item.label }}
    </Drag>
  </template>

  <template #feedback>
    <div key="feedback" />
  </template>
</DropList>
```

`ReorderEvent` now includes a `locked: number[]` property. Its `apply(array)` method honors these locked indices. Existing handlers using `event.from`, `event.to`, or `event.apply(array)` remain compatible when no positions are locked.

See [DropList position locking](./components/droplist.md#position-locking).

### DropList default slot

`DropList` now renders its default slot after its managed item or empty-slot content. This is useful for controls, footers, and other content that should remain inside the list root. Key its direct children when animations are enabled.

Existing `item`, `feedback`, `empty`, `drag-image`, `reordering-feedback`, and `reordering-drag-image` slots are unchanged.

### Shadow DOM support

Mouse and touch target detection, drag movement events, drop routing, and scroll-parent discovery now cross open Shadow DOM boundaries. No opt-in prop is required.

Closed shadow roots cannot expose their internal targets and are not supported.

## Compatibility summary

| Version 2 usage | Version 3 status |
| --- | --- |
| Root imports for `Drag`, `Drop`, `DropList`, and `DropMask` | Compatible |
| Existing documented component props, slots, and events | Compatible |
| `InsertEvent` and ordinary `ReorderEvent` handlers | Compatible |
| Existing drag-and-drop CSS classes | Compatible |
| `vue-easy-dnd/dist/dnd.css` | Compatible; `vue-easy-dnd/style.css` is preferred |
| `DragAwareMixin`, `DragMixin`, and `DropMixin` | Removed; use composables or components |
| Imports from `vue-easy-dnd/src/*` | Removed |
| Imports of generated bundle filenames | Removed; use the package root |
| Browser output | Targets ES2022 |
| Vue 2 | Not supported; the separately published version 1 line remains the unmaintained Vue 2 option |

## Internal improvements

These changes should not require application code changes:

- The library has moved from mixin-based JavaScript to typed Composition API controllers.
- Global drag state is shallow-reactive and internal controllers are kept raw, reducing unnecessary Vue proxy work.
- Document, root-element, timer, autoscroll, and drag-image cleanup has been tightened to avoid retaining completed or unmounted drag operations.
- DropList recalculates its layout when its items or direction change during an active drag.
- Stale asynchronous drag-image work is ignored when a newer drag operation has started.
- Runtime dependencies have been removed; Vue remains the only peer dependency.
- ESM, CommonJS, browser-global, CSS, and declaration outputs are produced by the modern Vite build.

## Suggested regression tests

After upgrading, verify the flows your application uses:

- Copy and cut drops still update the intended state.
- Reordering handlers still call `event.apply(items)` or apply `from` and `to` correctly.
- Nested DropLists specify `row` or `column` where required.
- Custom `tag` components render one HTML element, and custom `DropList` tags use `no-animations`.
- Custom drag images render and return correctly when `go-back` is enabled.
- External handles, scroll containers, and Shadow DOM roots behave correctly if your application uses them.

The [component documentation](./components/drag.md) and [advanced demos](./advanced-demos.md) contain live version 3 examples.
