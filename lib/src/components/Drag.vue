<template>
  <component
    :is="tag"
    ref="rootElement"
    :class="cssClasses"
  >
    <slot v-bind="$slots['default'] || {}" />

    <template v-for="[slot, args] of dynamicSlots" #[slot]>
      <slot :name="slot" v-bind="args" />
    </template>

    <div
      v-if="dragInitialised"
      ref="dragImageElement"
      class="__drag-image"
    >
      <slot name="drag-image" />
    </div>
  </component>
</template>

<script>
import { computed, defineComponent, ref } from 'vue';
import { dragEmits, dragProps, useDrag } from '../composables/useDrag';

export default defineComponent({
  name: 'Drag',
  props: {
    ...dragProps,
    /**
     * Tag to be used as root of this component. Defaults to div.
     */
    tag: {
      type: [String, Object, Function],
      default: 'div'
    }
  },
  emits: dragEmits,
  setup (props, { emit, slots }) {
    const rootElement = ref(null);
    const dragImageElement = ref(null);
    const dynamicSlots = computed(() => Object.entries(slots)
      .filter(([key]) => key !== 'drag-image' && key !== 'default'));

    return {
      ...useDrag(props, emit, {
        rootElement,
        dragImageElement,
        hasDragImage: () => !!slots['drag-image']
      }),
      rootElement,
      dragImageElement,
      dynamicSlots
    };
  }
});
</script>

<style lang="scss">
html.drag-in-progress * {
  cursor: move !important;
  cursor: grabbing !important;
}

.drop-allowed.drop-in * {
  cursor: inherit !important;
}

.drop-forbidden.drop-in {
  &, * {
    cursor: no-drop !important;
  }
}

.drag-no-handle {
  &:hover {
    cursor: move;
    cursor: grab;
  }
}
</style>

<style lang="scss" scoped>
/* Places a drag image out of sight while keeping its computed styles accessibles. */
.__drag-image {
  position: fixed;
  top: -10000px;
  left: -10000px;
  will-change: left, top;
}
</style>
