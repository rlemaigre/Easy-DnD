<template>
  <component
    :is="tag"
    v-bind="$attrs"
    :class="cssClasses"
  >
    <slot v-bind="$slots['default'] || {}" />

    <template v-for="[slot, args] of dynamicSlots" #[slot]>
      <slot :name="slot" v-bind="args" />
    </template>

    <div
      v-if="dragInitialised"
      ref="drag-image"
      class="__drag-image"
    >
      <slot name="drag-image" />
    </div>
  </component>
</template>

<script>
import DragMixin from "../mixins/DragMixin";

export default {
  name: 'Drag',
  mixins: [DragMixin],
  props: {
    /**
     * Tag to be used as root of this component. Defaults to div.
     */
    tag: {
      type: [String, Object, Function],
      default: 'div'
    }
  },
  computed: {
    dynamicSlots () {
      return Object.entries(this.$slots).filter(([key]) => key !== 'drag-image' && key !== 'default');
    }
  }
};
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
