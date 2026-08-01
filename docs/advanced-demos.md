---
title: Vue 3 Drag and Drop Examples
description: Explore live Vue 3 drag-and-drop examples for sortable lists, nested drop zones, custom previews, dashboards, touch input, and Shadow DOM.
---

# Advanced Demos

Every interactive example from the documentation is collected here. Start with the focused component examples, then explore the more complete interfaces built from the same API pieces.

## Drag

### Return unsuccessful drags

See how the [`go-back` prop works on the Drag component](/components/drag#return-unsuccessful-drags).

<DragGoBackDemo />

::: details View example code
**Template**

<<< ./demos/DragGoBackDemo.vue#go-back-example

**TypeScript**

<<< ./demos/DragGoBackDemo.vue#go-back-script{ts}
:::

### Accept drag types

Use typed drag data to control which targets participate in an operation.

<TypeAcceptanceDemo />

::: details View example code
**Template**

<<< ./demos/TypeAcceptanceDemo.vue#demo-template

**TypeScript**

<<< ./demos/TypeAcceptanceDemo.vue#demo-script{ts}
:::

### Custom drag images

Change the drag image at the source and as the pointer moves through nested targets.

<CustomDragImageDemo />

::: details View example code
**Template**

<<< ./demos/CustomDragImageDemo.vue#demo-template

**TypeScript**

<<< ./demos/CustomDragImageDemo.vue#demo-script{ts}
:::

### Dynamic drag images

Update reactive drag-image content during an active drag and explicitly refresh its visible clone.

<DynamicDragImageDemo />

::: details View example code
**Template**

<<< ./demos/DynamicDragImageDemo.vue#demo-template

**TypeScript**

<<< ./demos/DynamicDragImageDemo.vue#demo-script{ts}
:::

### Lazy external handles

Select a card and drag it from a shared toolbar rendered outside every Drag component.

<ExternalHandleDemo />

::: details View example code
**Template**

<<< ./demos/ExternalHandleDemo.vue#demo-template

**TypeScript**

<<< ./demos/ExternalHandleDemo.vue#demo-script{ts}
:::

### Automatic scrolling controls

Adjust the edge activation distance and per-step scroll delta, then toggle propagation between nested scroll containers.

<AutoScrollControlsDemo />

::: details View example code
**Template**

<<< ./demos/AutoScrollControlsDemo.vue#demo-template

**TypeScript**

<<< ./demos/AutoScrollControlsDemo.vue#demo-script{ts}
:::

## Drop

### Copy and cut modes

Compare copy and cut behavior and see how the source reacts to a successful drop.

<DropModesDemo />

::: details View example code
**Template**

<<< ./demos/DropModesDemo.vue#demo-template

**TypeScript**

<<< ./demos/DropModesDemo.vue#demo-script{ts}
:::

### Filter drag data

Use `accepts-data` to accept or reject individual values of the same type.

<DataAcceptanceDemo />

::: details View example code
**Template**

<<< ./demos/DataAcceptanceDemo.vue#demo-template

**TypeScript**

<<< ./demos/DataAcceptanceDemo.vue#demo-script{ts}
:::

## DropList

### Reorder and transfer list items

Reorder items in place or transfer them between lists.

<DropListTransferDemo />

::: details View example code
**Template**

<<< ./demos/DropListTransferDemo.vue#demo-template

**TypeScript**

<<< ./demos/DropListTransferDemo.vue#demo-script{ts}
:::

### Keep an item at a fixed position

Pin one item while allowing every unlocked item to move around and across it.

<PositionLockDemo />

::: details View example code
**Template**

<<< ./demos/PositionLockDemo.vue#demo-template

**TypeScript**

<<< ./demos/PositionLockDemo.vue#demo-script{ts}
:::

### Drop files into folders

Use the edges of a folder item to reorder it, or its inset centre to move a file into that folder.

<FolderDropDemo />

::: details View example code
**Template**

<<< ./demos/FolderDropDemo.vue#demo-template

**TypeScript**

<<< ./demos/FolderDropDemo.vue#demo-script{ts}
:::

### Nested drop lists

Compose row and column lists into a nested layout.

<NestedDropListDemo />

::: details View example code
**Example template**

<<< ./demos/NestedDropListDemo.vue#demo-template

**Example TypeScript**

<<< ./demos/NestedDropListDemo.vue#demo-script{ts}

**Nested list template**

<<< ./demos/shared/NestedListNode.vue#demo-template

**Nested list TypeScript**

<<< ./demos/shared/NestedListNode.vue#demo-script{ts}

**Tree types and update helper**

<<< ./demos/types.ts#demo-tree-types{ts}
:::

## DropMask

### Mask part of a drop target

Keep part of a Drop component insensitive to drag-and-drop interactions.

<DropMaskDemo />

::: details View example code
**Template**

<<< ./demos/DropMaskDemo.vue#demo-template

**TypeScript**

<<< ./demos/DropMaskDemo.vue#demo-script{ts}
:::

## Composables

### Observe drag state

Watch the reactive state exposed by `useDragAware` throughout a drag operation.

<DragStateDemo />

::: details View example code
**Template**

<<< ./demos/DragStateDemo.vue#demo-template

**TypeScript**

<<< ./demos/DragStateDemo.vue#demo-script{ts}
:::

## Compatibility

### Shadow DOM

Run the complete interaction inside an isolated open shadow root.

<ShadowDomDemo />

::: details View example code
**Template**

<<< ./demos/ShadowDomDemo.vue#demo-template

**TypeScript**

<<< ./demos/ShadowDomDemo.vue#demo-script{ts}
:::

## Complete interface examples

### Transfer rich cards

This example combines list reordering, transfers between lists, custom drag images, and custom insertion feedback.

<CardTransferDemo />

::: details View example code
**Template**

<<< ./demos/CardTransferDemo.vue#demo-template

**TypeScript**

<<< ./demos/CardTransferDemo.vue#demo-script{ts}
:::

### Copy table rows into a list

This example combines a table source, a list target, copy mode, custom drag images, and insertion feedback.

<TableToListDemo />

::: details View example code
**Template**

<<< ./demos/TableToListDemo.vue#demo-template

**TypeScript**

<<< ./demos/TableToListDemo.vue#demo-script{ts}
:::

### Build a dashboard

This example uses nested drop lists to build a dashboard visually. Drag new widgets from the palette or move existing widgets between regions.

<DashboardBuilderDemo />

::: details View example code
**Dashboard template**

<<< ./demos/DashboardBuilderDemo.vue#demo-template

**Dashboard TypeScript**

<<< ./demos/DashboardBuilderDemo.vue#demo-script{ts}

**Nested list template**

<<< ./demos/shared/NestedListNode.vue#demo-template

**Nested list TypeScript**

<<< ./demos/shared/NestedListNode.vue#demo-script{ts}

**Widget preview template**

<<< ./demos/shared/DashboardWidgetPreview.vue#demo-template

**Widget preview TypeScript**

<<< ./demos/shared/DashboardWidgetPreview.vue#demo-script{ts}

**Tree types and update helper**

<<< ./demos/types.ts#demo-tree-types{ts}
:::
