---
title: Vue 3 Draggable Component
description: Make Vue 3 components draggable with handles, typed data, touch input, automatic scrolling, custom drag images, and reactive previews.
---

# Drag

`Drag` defines an area from which typed data can be dragged.

## Events

Event | Description
----- | -----------
`dragstart` | Emitted when pointer movement exceeds `delta` after the gesture is initialized.
`dragend` | Emitted when the operation succeeds, fails, is cancelled, or the source unmounts. Inspect `event.success` for the outcome.
`copy` | Emitted after a successful drop onto a target whose `mode` is `copy`.
`cut` | Emitted after a successful drop onto a target whose `mode` is `cut`. Use this event to remove or update source data; the library does not mutate it automatically.

These events receive a [`DnDEventPayload`](../events.md#drag-and-drop-event-payload).

## Props

Prop | Type / Default | Description
---- | -------------- | -----------
`tag` | String or component (`'div'`) | Root element or Vue component. A component must render one HTML root element; its props, attributes, listeners, and slots are forwarded.
`type` | String, Number, or `null` (`null`) | Optional category used by targets to decide whether they participate.
`data` | Unknown (`null`) | Data included in drag-and-drop event payloads.
`drag-image-opacity` | Number (`0.7`) | Opacity applied to the source drag image.
`disabled` | Boolean (`false`) | Prevents this component from beginning a drag.
`go-back` | Boolean (`false`) | Animates an unsuccessful drag image back to its source.
`handle` | String, Function, or `null` (`null`) | CSS selector matched inside the root, or a function returning an `Element` anywhere in the document.
`delta` | Number (`0`px) | Pointer distance that must be exceeded before dragging begins. At `0`, dragging begins on the first movement.
`delay` | Number (`0`ms) | Time the pointer must remain down before the gesture initializes. Moving beyond `delta` before the delay finishes cancels that attempt.
`drag-class` | String or `null` (`null`) | Additional class applied to drag images created by this source.
`vibration` | Number (`0`ms) | Vibration duration when a gesture initializes on supported devices. `0` disables vibration.
`scrolling-edge-size` | Number (`100`px) | Distance from a scroll-container edge that activates autoscroll. `0` disables source autoscroll.
`scrolling-speed` | Number (`50`px) | Maximum pixels applied by each autoscroll step.
`scrolling-propagation` | Boolean (`true`) | Whether autoscroll may continue through outer scroll containers.

## Slots

Slot | Props | Description
---- | ----- | -----------
`default` | Props forwarded by a component passed to `tag` | Content rendered inside the draggable root.
`drag-image` | None | Optional source drag-image model. See [Drag images](#drag-images).

Other named slots are forwarded when `tag` is a Vue component.

## Return unsuccessful drags

Set `go-back` to animate the active image back to the source when a drag is released without a permitted target or is cancelled.

<DragGoBackDemo />

::: details View example code
**Template**

<<< ../demos/DragGoBackDemo.vue#go-back-example

**TypeScript**

<<< ../demos/DragGoBackDemo.vue#go-back-script{ts}
:::

## Lazy and external handles

A string `handle` selector is matched when pointer input begins, so matching content can be rendered after `Drag` mounts. Only the handle or one of its descendants can initiate the drag.

For a handle outside the `Drag` root, pass a function returning the current handle element. The function is resolved on every pointer-down, so it can safely return a template ref that changes over time.

<ExternalHandleDemo />

::: details View example code
**Template**

<<< ../demos/ExternalHandleDemo.vue#demo-template

**TypeScript**

<<< ../demos/ExternalHandleDemo.vue#demo-script{ts}
:::

## Automatic scrolling

Use `scrolling-edge-size` to control how close the pointer must be to an edge, `scrolling-speed` to control the maximum step, and `scrolling-propagation` to decide whether scrolling may continue through outer containers.

An active `DropList` can override edge size and propagation with its own `scrolling-edge-size` and `scrolling-propagation` props. Scroll speed always comes from the source `Drag`.

<AutoScrollControlsDemo />

::: details View example code
**Template**

<<< ../demos/AutoScrollControlsDemo.vue#demo-template

**TypeScript**

<<< ../demos/AutoScrollControlsDemo.vue#demo-script{ts}
:::

## CSS classes

Class | Applied when
----- | ------------
`dnd-drag` | Always on the `Drag` root.
`drag-source` | This component is the source of the active operation.
`drag-mode-copy` | Its active permitted target uses `copy` mode.
`drag-mode-cut` | Its active permitted target uses `cut` mode.
`drag-mode-reordering` | It is being reordered within its current `DropList`.
`drag-no-handle` | No `handle` prop is configured.
`dnd-ghost` | On drag-image clones created by `Drag`, `Drop`, or `DropList`.
`drag-in-progress` | On the document `<html>` element while an operation is active.

`drag-class` is applied to images produced by the source `Drag`. A custom image produced by a target `Drop` or `DropList` receives `dnd-ghost`, but not the source's `drag-class`.

Add `dnd-no-drag` to a child element to prevent gestures starting from that child or its descendants.

## Types

A drag type is a `string`, `number`, or `null` category assigned through `Drag.type`. Targets use `accepts-type` to decide whether they participate. A target can accept one type, an array of types, or a predicate.

This filtering is separate from `accepts-data`: type acceptance decides whether the target participates, while data acceptance decides whether the active value may be dropped.

<TypeAcceptanceDemo />

::: details View example code
**Template**

<<< ../demos/TypeAcceptanceDemo.vue#demo-template

**TypeScript**

<<< ../demos/TypeAcceptanceDemo.vue#demo-script{ts}
:::

## Drag images

During a drag, Vue-Easy-DnD positions an image in viewport coordinates above the page content.

The source `Drag` controls the initial image with its `drag-image` slot:

- Without the slot, the `Drag` root is cloned.
- With an empty slot, no visible image is rendered.
- With slot content, that content is cloned.

`Drop` and `DropList` also provide a `drag-image` slot with `data` and `type` props. When an accepting target becomes active:

- Without a target slot, the source image remains active.
- With an empty target slot, no visible image is rendered over that target.
- With target slot content, that content replaces the source image.

`DropList` additionally provides `reordering-drag-image`, with the item being reordered as its `item` prop.

Use CSS `transform` on custom drag-image content to adjust its position relative to the pointer.

### Dynamic drag images

Drag images are DOM clones and do not update automatically when their Vue slot model changes. After updating reactive content used by the active image, call `refreshDragImage()`. It waits for Vue's next render and replaces the current clone.

```ts
import { refreshDragImage } from 'vue-easy-dnd'

previewMode.value = 'expanded'
void refreshDragImage()
```

The returned promise resolves to the new image element or `null` if no operation remains active.

<DynamicDragImageDemo />

::: details View example code
**Template**

<<< ../demos/DynamicDragImageDemo.vue#demo-template

**TypeScript**

<<< ../demos/DynamicDragImageDemo.vue#demo-script{ts}
:::

### Source and target drag images

This example combines a custom source image, images supplied by nested targets, and a `DropMask`:

<CustomDragImageDemo />

::: details View example code
**Template**

<<< ../demos/CustomDragImageDemo.vue#demo-template

**TypeScript**

<<< ../demos/CustomDragImageDemo.vue#demo-script{ts}
:::
