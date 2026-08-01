# DropMask

`DropMask` creates an area inside a `Drop` or `DropList` that does not accept a drop. Moving over the mask clears the active target and prevents the masked element's enclosing target from receiving that movement.

## Props

Prop | Type / Default | Description
---- | -------------- | -----------
`tag` | String or component (`'div'`) | Root element or Vue component. A component must render one HTML root element; its props, attributes, listeners, and slots are forwarded.

## Slots

`default` and other named slots are forwarded to the root component. For a native tag, use the default slot for masked content.

## Demo

<DropMaskDemo />

::: details View example code
**Template**

<<< ../demos/DropMaskDemo.vue#demo-template

**TypeScript**

<<< ../demos/DropMaskDemo.vue#demo-script{ts}
:::
