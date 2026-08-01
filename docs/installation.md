---
title: Install Vue Easy DnD
description: Install and configure the Vue Easy DnD drag-and-drop component library in Vue 3, TypeScript, SSR, and Nuxt applications.
---

# Installation

## About
Vue-Easy-DnD provides mouse and touch drag-and-drop for Vue 3 without using the native HTML5 drag-and-drop API. It supports data transfer, copy/cut workflows, reorderable lists, custom drag images, nested targets, and autoscrolling.

## Installation

Install via [npm](https://npmjs.com) or [yarn](https://yarnpkg.com).

### Vue 3

```bash
# Use npm
npm install vue-easy-dnd@^3

# Use yarn
yarn add vue-easy-dnd@^3
```

#### Requirements

Vue `^3.2.25` is required. The library uses the Composition API internally and works in both Composition API and Options API applications.

The distributed JavaScript targets ES2022. Applications supporting older browsers must transpile Vue-Easy-DnD through their own build pipeline.

Import the library CSS once in your application entry:

```js
import 'vue-easy-dnd/style.css'
```

The version 2 stylesheet path, `vue-easy-dnd/dist/dnd.css`, remains available for compatibility.

Import the components you need from the package root:

```vue
<script setup>
import { Drag, Drop } from 'vue-easy-dnd'

function onDrop (event) {
  console.log(event.data)
}
</script>

<template>
  <Drag type="task" :data="{ id: 1 }">
    Drag this task
  </Drag>

  <Drop accepts-type="task" @drop="onDrop">
    Drop here
  </Drop>
</template>
```

Upgrading from version 2? Read the [version 3 changelog and migration guide](./changelog.md).

### Vue 2

The legacy Vue 2 variant is version 1 and is no longer maintained. Use it with caution.

```bash
# Use npm
npm install vue-easy-dnd@^1

# Use yarn
yarn add vue-easy-dnd@^1
```
