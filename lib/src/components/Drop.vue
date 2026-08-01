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
      v-if="showDragImage"
      ref="dragImageElement"
      class="__drag-image"
    >
      <slot
        name="drag-image"
        :type="dragType"
        :data="dragData"
      />
    </div>
  </component>
</template>

<script setup>
import { computed, ref, useSlots } from 'vue';
import { dropEmits, dropProps, useDrop } from '../composables/useDrop';

defineOptions({
  name: 'Drop',
});

const props = defineProps({
  ...dropProps,
  tag: {
    type: [String, Object, Function],
    default: 'div'
  }
});
const emit = defineEmits(dropEmits);
const slots = useSlots();
const rootElement = ref(null);
const dragImageElement = ref(null);
const drop = useDrop(props, emit, {
  rootElement,
  dragImageElement
});
const { cssClasses, dragData, dragInProgress, dragType, typeAllowed } = drop;
const dynamicSlots = computed(() => Object.entries(slots)
  .filter(([key]) => key !== 'drag-image' && key !== 'default'));
const showDragImage = computed(() => dragInProgress.value &&
  typeAllowed.value && !!slots['drag-image']);
</script>

<style lang="scss">
.drop-allowed.drop-in {
  &, * {
    cursor: pointer !important;
  }
}

.drop-forbidden.drop-in {
  &, * {
    cursor: no-drop !important;
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
