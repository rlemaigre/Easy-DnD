<template>
  <component :is="tag" v-bind="$attrs">
    <template v-for="(args, slot) of $slots" #[slot]>
      <slot :name="slot" v-bind="args" />
    </template>
  </component>
</template>

<script>
import DragAwareMixin from '../mixins/DragAwareMixin';
import { dnd } from '../js/DnD';

export default {
  name: 'DropMask',
  mixins: [DragAwareMixin],
  props: {
    tag: {
      type: [String, Object, Function],
      default: 'div'
    }
  },
  data () {
    return {
      isDropMask: true
    };
  },
  mounted () {
    this.$el.addEventListener('easy-dnd-move', this.onDndMove);
  },
  beforeUnmount () {
    this.$el.removeEventListener('easy-dnd-move', this.onDndMove);
  },
  methods: {
    createDragImage () {
      return 'source';
    },
    onDndMove (e) {
      dnd.mouseMove(e, this);
    }
  }
};
</script>
