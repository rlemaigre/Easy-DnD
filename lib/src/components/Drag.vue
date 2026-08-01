<template>
  <component
    :is="tag"
    :class="cssClasses"
    @vue:mounted="setRootElement"
    @vue:updated="setRootElement"
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

<script lang="ts" setup>
import { computed, ref, useSlots, type VNode } from 'vue';
import { dragEmits, dragProps, useDrag } from '../composables/useDrag';

defineOptions({
  name: 'Drag',
});

const props = defineProps({
  ...dragProps,
  /**
   * Tag to be used as root of this component. Defaults to div.
   */
  tag: {
    type: [String, Object, Function],
    default: 'div'
  }
});
const emit = defineEmits(dragEmits);
const slots = useSlots();
const rootElement = ref<HTMLElement | null>(null);
const dragImageElement = ref<HTMLElement | null>(null);
const setRootElement = (vnode: VNode) => {
  rootElement.value = vnode.el instanceof HTMLElement ? vnode.el : null;
};
const dynamicSlots = computed(() => Object.entries(slots)
  .filter(([key]) => key !== 'drag-image' && key !== 'default'));
const { cssClasses, dragInitialised } = useDrag(props, emit, {
  rootElement,
  dragImageElement,
  hasDragImage: () => !!slots['drag-image']
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
