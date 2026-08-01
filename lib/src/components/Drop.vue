<template>
  <component
    :is="tag"
    :class="cssClasses"
    @vue:mounted="setRootElement"
    @vue:updated="setRootElement"
  >
    <template #default="args">
      <slot v-bind="args || {}" />

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
    </template>

    <template v-for="slot of dynamicSlots()" #[slot]="args">
      <slot :name="slot" v-bind="args || {}" />
    </template>
  </component>
</template>

<script lang="ts" setup>
import { computed, ref, useSlots, type VNode } from 'vue';
import { dropEmits, dropProps, useDrop } from '../composables/useDrop';
import type { DropProps } from '../composables/useDrop';

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
const rootElement = ref<HTMLElement | null>(null);
const dragImageElement = ref<HTMLElement | null>(null);
const setRootElement = (vnode: VNode) => {
  rootElement.value = vnode.el instanceof HTMLElement ? vnode.el : null;
};
const drop = useDrop(props as unknown as DropProps, emit, {
  rootElement,
  dragImageElement
});
const { cssClasses, dragData, dragInProgress, dragType, typeAllowed } = drop;
const dynamicSlots = () => Object.keys(slots)
  .filter(key => key !== 'drag-image' && key !== 'default');
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
}
</style>
