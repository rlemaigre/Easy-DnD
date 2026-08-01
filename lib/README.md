# Vue-Easy-DnD

Vue-Easy-DnD helps you make Vue components draggable.

If you have cards, tasks, rows, or widgets that users need to move around, this library gives you a simple way to drag-and-drop.

## What this package helps with

- Make a source item draggable with `Drag`
- Make a target accept dropped items with `Drop`
- Build reorderable lists with `DropList` (drag to reorder, or move between lists)
- Ignore drops in specific zones using `DropMask`
- Use `useDrag`, `useDrop`, and `useDragAware` when you need custom logic instead of a full component
- Restrict what can be dropped using type/data rules (`accepts-type` and `accepts-data`)
- Support copy/cut-style interactions and list events like `reorder` and `insert`
- Customize the drag preview with `drag-image`

## Install

```bash
npm install vue-easy-dnd@^3
```

Vue `^3.2.25` is required.
The distributed JavaScript targets ES2022.

## Quick example

```vue
<script setup>
import { Drag, Drop, useDragAware } from 'vue-easy-dnd'
import 'vue-easy-dnd/style.css'

const { dragInProgress } = useDragAware()

function handleDrop(event) {
  console.log('Dropped item:', event.data)
}
</script>

<template>
  <Drag type="task" :data="{ id: 1 }">
    <div>Drag this item</div>
  </Drag>

  <Drop accepts-type="task" @drop="handleDrop">
    Drop zone
  </Drop>

  <p v-if="dragInProgress">Drag in progress</p>
</template>
```

For examples like dashboards, nested zones, and full list workflows, use the linked docs and demos.

## Docs and examples

### [View Documentation](https://rlemaigre.github.io/Easy-DnD)

- [All demos](https://rlemaigre.github.io/Easy-DnD/advanced-demos.html)
- [Version 3 migration guide](https://rlemaigre.github.io/Easy-DnD/changelog.html)
- [Dashboard demo on homepage](https://rlemaigre.github.io/Easy-DnD/#try-the-dashboard-demo)
