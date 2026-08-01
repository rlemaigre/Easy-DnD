---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Vue-Easy-DnD"
  text: "Drag & Drop for Vue"
  tagline: Flexible mouse and touch drag-and-drop for Vue 3 without the native HTML5 drag-and-drop API
  actions:
    - theme: brand
      text: Get Started
      link: /installation
    - theme: alt
      text: Live Example
      link: /#try-the-dashboard-demo
    - theme: alt
      text: Migrate to v3
      link: /changelog


features:
  - title: Simple API
    details: With a simple API, you can create complex and scalable solutions.
  - title: Easy Installation
    details: Works with Vue 3, SSR, Nuxt, TypeScript, mouse input, and touch input.
  - title: Easy to use
    details: Compose Drag, Drop, DropList, and DropMask or build custom wrappers with composables.
---

## Try the dashboard demo

Build a dashboard visually by dragging widgets from the palette and rearranging them across nested rows and columns.

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

[Explore all demos →](/advanced-demos)
