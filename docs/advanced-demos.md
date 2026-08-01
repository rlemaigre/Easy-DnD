# Advanced Demos

Every interactive example from the documentation is collected here. Start with the focused component examples, then explore the more complete interfaces built from the same API pieces.

## Drag

### Return unsuccessful drags

See how the [`go-back` prop works on the Drag component](/components/drag#demo).

<DragGoBackDemo />

### Accept drag types

Use typed drag data to control which targets participate in an operation.

<TypeAcceptanceDemo />

### Custom drag images

Change the drag image at the source and as the pointer moves through nested targets.

<CustomDragImageDemo />

## Drop

### Copy and cut modes

Compare copy and cut behavior and see how the source reacts to a successful drop.

<DropModesDemo />

### Filter drag data

Use `accepts-data` to accept or reject individual values of the same type.

<DataAcceptanceDemo />

## DropList

### Reorder and transfer list items

Reorder items in place or transfer them between lists.

<DropListTransferDemo />

### Nested drop lists

Compose row and column lists into a nested layout.

<NestedDropListDemo />

## DropMask

### Mask part of a drop target

Keep part of a Drop component insensitive to drag-and-drop interactions.

<DropMaskDemo />

## Composables

### Observe drag state

Watch the reactive state exposed by `useDragAware` throughout a drag operation.

<DragStateDemo />

## Complete interface examples

### Transfer rich cards

This example combines list reordering, transfers between lists, custom drag images, and custom insertion feedback.

<CardTransferDemo />

### Copy table rows into a list

This example combines a table source, a list target, copy mode, custom drag images, and insertion feedback.

<TableToListDemo />

### Build a dashboard

This example uses nested drop lists to build a dashboard visually. Drag new widgets from the palette or move existing widgets between regions.

<DashboardBuilderDemo />
