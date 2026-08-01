---
title: Vue Drag and Drop Events and Composables
description: Reference Vue Easy DnD event payloads, lifecycle timing, reactive drag state, and the useDrag, useDrop, and useDragAware composables.
---

# Events and composables

## Drag-and-drop event payload

The `Drag`, `Drop`, and `DropList` lifecycle events use a `DnDEventPayload`. Import its TypeScript type from the package root:

```ts
import type { DnDEventPayload } from 'vue-easy-dnd'

function onDrop (event: DnDEventPayload) {
  console.log(event.type, event.data)
}
```

Property | Type | Description
-------- | ---- | -----------
`type` | `string \| number \| null` | Type assigned by the source `Drag`.
`data` | `unknown` | Data assigned by the source `Drag`.
`position` | `{ x: number, y: number } \| null` | Pointer position in viewport/client coordinates.
`top` | Vue component instance or `null` | Foremost participating `Drop` or `DropList` under the pointer.
`previousTop` | Vue component instance or `null` | Previous top target. Present when the active target changes, including `dragenter` and `dragleave` payloads.
`source` | Vue component instance or `null` | `Drag` component where the operation began.
`success` | `boolean \| null` | `true` or `false` when an operation ends; otherwise normally `null`.
`native` | `Event \| null` | Mouse, touch, keyboard, cancellation, or other native event associated with the lifecycle update.

The payload also exposes `sourceController`, `topController`, and sometimes `previousTopController`. These are lower-level controller objects intended for custom wrappers built with `useDrag` and `useDrop`; normal application event handlers should use the component and data fields above.

`DropList` emits specialized event objects for list changes rather than `DnDEventPayload`:

- `InsertEvent` contains `type`, `data`, and `index`.
- `ReorderEvent` contains `from`, `to`, `locked`, and `apply(array)`.

See the [DropList event reference](./components/droplist.md#events) for examples.

## Component event timing

Event | Emitted by | Timing
----- | ---------- | ------
`dragstart` | `Drag` | The pointer has moved farther than `delta` after the gesture is initialized.
`dragover` | `Drop`, `DropList` | The pointer moves while that component is the foremost participating target.
`dragenter` | `Drop`, `DropList` | That component becomes the foremost participating target.
`dragleave` | `Drop`, `DropList` | That component stops being the foremost participating target.
`drop` | `Drop`, `DropList` | A permitted operation is released over that target. For an external `DropList` insertion, this is emitted before `insert`.
`dragend` | `Drag`, active `Drop` or `DropList` | The operation succeeds, is released elsewhere, is cancelled, or the source unmounts.
`copy` / `cut` | `Drag` | A successful target uses the corresponding `mode`.
`insert` | `DropList` | External data is dropped at a calculated list index.
`reorder` | `DropList` | An item from that same list is released at a different allowed index.

## `useDragAware`

`useDragAware()` exposes the current global drag state as computed refs:

```ts
import { useDragAware } from 'vue-easy-dnd'

const {
  dragInProgress,
  dragType,
  dragData,
  dragPosition,
  dragSource,
  dragTop
} = useDragAware()
```

Returned ref | Description
------------ | -----------
`dragInProgress` | Whether an operation is active.
`dragType` | Current `string`, `number`, or `null` type.
`dragData` | Current source data.
`dragPosition` | Current `{ x, y }` viewport/client position or `null`.
`dragSource` | Current source `Drag` component instance or `null`.
`dragTop` | Foremost participating target component instance or `null`.

Vue unwraps these refs automatically in templates.

<DragStateDemo />

::: details View example code
**Template**

<<< ./demos/DragStateDemo.vue#demo-template

**TypeScript**

<<< ./demos/DragStateDemo.vue#demo-script{ts}
:::

## `useDrag` and `useDrop`

`useDrag()` and `useDrop()` power the built-in components and are exported for authors of custom drag/drop wrappers. They are lower-level than `useDragAware`: callers supply reactive props, an emit function, HTML element refs, and component-specific option callbacks.

```ts
const drag = useDrag(props, emit, {
  rootElement,
  dragImageElement,
  hasDragImage: () => Boolean(slots['drag-image'])
})

const drop = useDrop(props, emit, {
  rootElement,
  dragImageElement
})
```

Both composables must be called during component `setup()`. Their root ref must resolve to an `HTMLElement` by the time the component mounts, and the caller is responsible for rendering the returned CSS state and any drag-image model. Prefer the built-in components unless you need a custom rendering contract.

## Global `dnd` state

The exported `dnd` singleton contains the same reactive operation state and provides `on`/`off` lifecycle subscriptions:

```ts
import { onBeforeUnmount } from 'vue'
import { dnd } from 'vue-easy-dnd'

const onStart = (event) => console.log(event.data)

dnd.on('dragstart', onStart)
onBeforeUnmount(() => dnd.off('dragstart', onStart))
```

Always remove subscriptions when their owner unmounts. For reactive UI state, prefer `useDragAware()`.

## Other advanced exports

- `DnDEvent` provides an initialized event-shaped class, while component handlers receive objects matching `DnDEventPayload` and should not rely on `instanceof DnDEvent`.
- `InsertEvent` and `ReorderEvent` are the concrete payload classes emitted by `DropList`.
- `refreshDragImage()` rebuilds the image for the current operation after reactive slot content changes.
- `createDragImage(element)` creates the positioned DOM clone used by the image system.
- `DragImagesManager` is the underlying image lifecycle class. The package already creates the manager required for normal operation. If an advanced integration creates another instance, call its `dispose()` method when finished so its global subscriptions and image nodes are removed.
- `DragFeedback` is the lightweight wrapper used internally to measure a `DropList` feedback slot. It remains exported for compatibility, but application components normally do not need it.
