<template>
    <component :is="tag" v-bind="$attrs" :class="cssClasses" :style="cssStyle">
      <slot v-bind="$slots['default'] || {}"></slot>

      <template v-for="[slot, args] of dynamicSlots" v-slot:[slot]>
        <slot :name="slot" v-bind="args" />
      </template>

      <div v-if="showDragImage" class="__drag-image" ref="drag-image">
        <slot name="drag-image" :type="dragType" :data="dragData"></slot>
      </div>
    </component>
</template>

<script>
import DropMixin from "../mixins/DropMixin";

export default {
  name: 'Drop',
  mixins: [DropMixin],
  props: {
    tag: {
      type: [String, Object, Function],
      default: 'div'
    }
  },
  computed: {
    dynamicSlots () {
      return Object.entries(this.$slots).filter(([key]) => key !== 'drag-image' && key !== 'default')
    },
    showDragImage() {
      return this.dragInProgress && this.typeAllowed && !!this.$slots['drag-image'];
    }
  }
}
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
