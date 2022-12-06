<template>
    <component :is="tag" v-bind="$attrs" :class="cssClasses" :style="cssStyle">
        <slot></slot>
        <template v-for="(args, slot) of $slots" v-slot:[slot]>
            <slot :name="slot" v-bind="args" />
        </template>
        <div class="__drag-image" v-if="showDragImage" ref="drag-image">
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
    showDragImage() {
      return this.dragInProgress && this.typeAllowed && this.$slots['drag-image'];
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
