<template>
    <component :is="tag" v-bind="$attrs" :class="cssClasses">
        <template v-for="(args, slot) of $slots" v-slot:[slot]>
            <slot :name="slot" v-bind="args" />
        </template>
        <div v-if="dragInitialised" class="__drag-image" ref="drag-image">
            <slot name="drag-image"></slot>
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
  }
}
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
