---
title: Vue 3 Sortable and Reorderable Lists
description: Create sortable Vue 3 lists with reordering, cross-list transfers, nested layouts, insertion feedback, autoscrolling, and position locking.
---

# DropList

`DropList` is a specialized `Drop` that renders an array, calculates insertion positions, and supports in-list reordering.

## Events

`DropList` emits the `Drop` lifecycle events plus these list events:

Event | Payload | Description
----- | ------- | -----------
`insert` | `InsertEvent` | External data was dropped at a calculated `index`. The payload also contains `type` and `data`.
`reorder` | `ReorderEvent` | An item from this list moved from `from` to `to`. `apply(array)` performs the move and respects the `locked` indices.

Event handlers own all application-state changes:

```vue
<DropList
  :items="items"
  @insert="items.splice($event.index, 0, $event.data)"
  @reorder="$event.apply(items)"
>
  <!-- slots -->
</DropList>
```

An external permitted drop still completes if there is no `insert` listener, but no item is added automatically. Likewise, a reorder is not persisted unless the handler updates the array.

For an external insertion, `drop` is emitted before `insert`. An internal reorder emits `reorder`, not `drop` or `insert`.

## Props

`DropList` accepts all [`Drop` props](./drop.md#props), plus:

Prop | Type / Default | Description
---- | -------------- | -----------
`tag` | String or component (`'div'`) | Root tag. With animations enabled, use an HTML tag supported by Vue's `TransitionGroup`. With `no-animations`, a Vue component is allowed if it renders one HTML root.
`items` | Array (required) | Items rendered by the `item` slot.
`row` | Boolean (`false`) | Declares a horizontal layout. Required when this list contains nested drop targets arranged in a row.
`column` | Boolean (`false`) | Declares a vertical layout. Required when this list contains nested drop targets arranged in a column.
`no-animations` | Boolean (`false`) | Renders `tag` directly instead of using `TransitionGroup` and disables built-in move transitions.
`reorderable` | Boolean or Function (`true`) | Enables reordering globally or through `(item, index) => boolean`. `false` positions remain pinned.
`scrolling-edge-size` | Number or `undefined` (`undefined`) | Overrides the source edge threshold while this list is active. `undefined` inherits it; `0` disables autoscroll for this list.
`scrolling-propagation` | Boolean or `undefined` (`undefined`) | Overrides the source propagation setting while this list is active.

If both `row` and `column` are true, `row` takes precedence. They can both remain false for a non-nested layout, where item centers are used automatically.

## Slots

`item` and `feedback` are required. Slot render functions should return one keyed root node; additional root nodes are ignored by the list renderer.

Slot | Props | Description
---- | ----- | -----------
`item` | `item`, `index`, `reorder` | Renders an item. `reorder` is true for the item shown at the prospective location during live reordering.
`feedback` | `type`, `data` | Required insertion placeholder used to calculate and display the external drop position.
`default` | None | Content appended after managed item or empty content, such as a footer or add button. Key direct children when animations are enabled.
`empty` | None | Content rendered when `items` is empty and no external drag is being inserted.
`drag-image` | `type`, `data` | Image used while external data is dragged over this list.
`reordering-drag-image` | `item` | Image used while an item is reordered inside this list.
`reordering-feedback` | `item` | Optional explicit reordering placeholder. Without it, items move live to preview the resulting order.

The `feedback`, `empty`, and explicit `reordering-feedback` roots should have stable keys when animations are enabled.

## CSS classes

Class | Applied when
----- | ------------
`drop-list` | Always on the root.
`dnd-drop` | Always on the root, matching the base `Drop` contract.
`inserting` | A drag from outside this list is active.
`reordering` | The active source is a direct child of this list.
`type-allowed` / `type-forbidden` | An external drag type is accepted or rejected.
`drop-in` / `drop-out` | This list is or is not the active target.
`drop-allowed` / `drop-forbidden` | The current external insertion or internal reorder is permitted or forbidden.

## Reorder and transfer items

<DropListTransferDemo />

::: details View example code
**Template**

<<< ../demos/DropListTransferDemo.vue#demo-template

**TypeScript**

<<< ../demos/DropListTransferDemo.vue#demo-script{ts}
:::

## Position locking

Use the `reorderable` predicate to pin an item to its current array position. Unlocked items can still move from one side of that position to the other.

Also disable the pinned item's `Drag`: `reorderable` prevents an allowed reorder, while `Drag.disabled` prevents the item from initiating a gesture at all.

```vue
<DropList
  :items="items"
  :reorderable="item => !item.locked"
  @reorder="$event.apply(items)"
>
  <template #item="{ item }">
    <Drag
      :key="item.id"
      :data="item"
      :disabled="item.locked"
    >
      {{ item.label }}
    </Drag>
  </template>

  <template #feedback>
    <div key="feedback" />
  </template>
</DropList>
```

<PositionLockDemo />

::: details View example code
**Template**

<<< ../demos/PositionLockDemo.vue#demo-template

**TypeScript**

<<< ../demos/PositionLockDemo.vue#demo-script{ts}
:::

## Nested DropLists

DropLists can be nested with these requirements:

- Set `row` or `column` on every list whose rendered items contain nested drop targets. This tells the position grid which edge of a nested item represents before/after.
- An explicit `reordering-feedback` slot is recommended for predictable nested-list previews.
- Keep `feedback` and `reordering-feedback` out of the normal layout until activated, for example with `flex: 0 0 0; align-self: stretch;` and a visible outline.

<NestedDropListDemo />

::: details View example code
**Example template**

<<< ../demos/NestedDropListDemo.vue#demo-template

**Example TypeScript**

<<< ../demos/NestedDropListDemo.vue#demo-script{ts}

**Nested list template**

<<< ../demos/shared/NestedListNode.vue#demo-template

**Nested list TypeScript**

<<< ../demos/shared/NestedListNode.vue#demo-script{ts}

**Tree types and update helper**

<<< ../demos/types.ts#demo-tree-types{ts}
:::
