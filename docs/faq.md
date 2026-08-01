---
title: Vue 3 Drag and Drop FAQ
description: Answers about Vue Easy DnD support for touch devices, SSR, Nuxt, keyboard controls, Shadow DOM, styles, and Vue 3 integration.
---

# FAQ

## Does it support touch devices?

Yes. Drag gestures support mouse and touch input. The optional `vibration` prop on `Drag` can provide feedback on devices that implement `navigator.vibrate()`.

## Does it support SSR?

Yes. Components can be rendered on the server; browser event listeners and DOM access are initialized after mounting on the client. Import the library stylesheet through your application or framework CSS configuration.

## Does it support keyboard dragging?

No. Version 3 supports pressing <kbd>Escape</kbd> to cancel an active mouse or touch drag, but it does not provide keyboard-driven pickup, movement, or dropping. Applications that require keyboard reordering should provide equivalent controls and appropriate accessibility semantics.

## Can this be used with Nuxt?

Yes. The components are SSR-compatible. Add `vue-easy-dnd/style.css` to your Nuxt CSS configuration or import it once from client application code.

## Does it work inside Shadow DOM?

Yes. Open shadow roots are supported for mouse and touch target detection, composed drag movement, Drop event routing, and scroll-parent discovery across the shadow host. Closed shadow roots are not supported.

<ShadowDomDemo />

::: details View example code
**Template**

<<< ./demos/ShadowDomDemo.vue#demo-template

**TypeScript**

<<< ./demos/ShadowDomDemo.vue#demo-script{ts}
:::
