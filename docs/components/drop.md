# Drop

`Drop` defines an area into which data can be dropped. Targets can be nested to form hierarchies of arbitrary depth; the foremost participating target under the pointer becomes active.

## Events

Event | Description
----- | -----------
`dragenter` | This component becomes the foremost participating target.
`dragleave` | This component stops being the foremost participating target.
`dragover` | The pointer moves while this component is the foremost participating target.
`dragend` | The operation ends while this component is the active target, including cancellation with <kbd>Escape</kbd>.
`drop` | A permitted operation is released on this component.

These events receive a [`DnDEventPayload`](../events.md#drag-and-drop-event-payload).

## Props

Prop | Type / Default | Description
---- | -------------- | -----------
`tag` | String or component (`'div'`) | Root element or Vue component. A component must render one HTML root element; its props, attributes, listeners, and slots are forwarded.
`accepts-type` | String, Number, Array, Function, or `null` (`null`) | Accepted drag type, accepted type array, or `(type) => boolean` predicate. `null` accepts every type.
`accepts-data` | Function (`() => true`) | `(data, type) => boolean` predicate evaluated for participating drag data.
`mode` | String (`'copy'`) | Event name sent back to the source after a successful drop. The documented modes are `copy` and `cut`.
`drag-image-opacity` | Number (`0.7`) | Opacity applied to a custom drag image supplied by this target.

## Slots

Slot | Props | Description
---- | ----- | -----------
`default` | Props forwarded by a component passed to `tag` | Content rendered inside the target root.
`drag-image` | `type`, `data` | Optional image used while this participating target is active.

Other named slots are forwarded when `tag` is a Vue component.

## CSS classes

Class | Applied when
----- | ------------
`dnd-drop` | Always on the `Drop` root.
`type-allowed` / `type-forbidden` | The active drag type is accepted or rejected.
`drop-in` / `drop-out` | This component is or is not the foremost participating target.
`drop-allowed` / `drop-forbidden` | Participating drag data is accepted or rejected.

The state classes are present only while a drag is active where their value can be determined. A type-forbidden target does not become the active target; an accepting ancestor may become active instead.

## Modes

The target's `mode` describes the successful operation from the source's perspective:

- `copy` leaves source state unchanged unless the application chooses otherwise.
- `cut` normally removes or updates the source item.

After `drop` is emitted on the target, the same payload is emitted on the source `Drag` using the mode as the event name. The library does not mutate application state, so implement `@cut` when the source item should be removed.

```vue
<Drag :data="item" @cut="remove(item)">
  {{ item.label }}
</Drag>

<Drop mode="cut" @drop="receive">
  Move here
</Drop>
```

A mode is not made invalid by the absence of a source listener. Use the documented `copy` and `cut` modes so Vue can validate the declared source events.

<DropModesDemo />

::: details View example code
**Template**

<<< ../demos/DropModesDemo.vue#demo-template

**TypeScript**

<<< ../demos/DropModesDemo.vue#demo-script{ts}
:::

## Restricting droppable data

`accepts-type` determines whether a target participates in an operation. Once it participates, `accepts-data` receives `(data, type)` and determines whether dropping is permitted.

```vue
<Drop
  accepts-type="number"
  :accepts-data="data => typeof data === 'number' && data % 2 === 0"
  @drop="receiveEvenNumber"
>
  Even numbers only
</Drop>
```

<DataAcceptanceDemo />

::: details View example code
**Template**

<<< ../demos/DataAcceptanceDemo.vue#demo-template

**TypeScript**

<<< ../demos/DataAcceptanceDemo.vue#demo-script{ts}
:::
