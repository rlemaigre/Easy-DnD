<template>
    <component :is="tag" v-bind="$attrs">
        <slot></slot>
        <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
        </template>
    </component>
</template>

<script>
import DragAwareMixin from "../mixins/DragAwareMixin";
import {dnd} from "../js/DnD";

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
    }
  },
  methods: {
    createDragImage () {
      return 'source'
    }
  },
  mounted() {
    let el = this.$el;
    let comp = this;
    el.addEventListener('easy-dnd-move', onMouseMove);

    function onMouseMove(e) {
      dnd.mouseMove(e, comp);
    }
  }
}
</script>
