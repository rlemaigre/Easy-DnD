<template>
  <component
    :is="tag"
    :class="cssClasses"
  >
    <slot v-bind="$slots['default'] || {}" />

    <template v-for="[slot, args] of dynamicSlots" #[slot]>
      <slot :name="slot" v-bind="args" />
    </template>

    <div
      v-if="showDragImage"
      ref="drag-image"
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

<script>
import { computed, defineComponent } from 'vue';
import { dropEmits, dropProps, useDrop } from '../composables/useDrop';

export default defineComponent({
  name: 'Drop',
  props: {
    ...dropProps,
    tag: {
      type: [String, Object, Function],
      default: 'div'
    }
  },
  emits: dropEmits,
  setup (props, { emit, slots }) {
    const drop = useDrop(props, emit);
    const dynamicSlots = computed(() => Object.entries(slots)
      .filter(([key]) => key !== 'drag-image' && key !== 'default'));
    const showDragImage = computed(() => drop.dragInProgress.value &&
      drop.typeAllowed.value && !!slots['drag-image']);

    return {
      ...drop,
      dynamicSlots,
      showDragImage
    };
  }
});
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
