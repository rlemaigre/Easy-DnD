<template>
  <component :is="tag">
    <template v-for="(args, slot) of $slots" #[slot]>
      <slot :name="slot" v-bind="args" />
    </template>
  </component>
</template>

<script>
import { defineComponent, getCurrentInstance, onBeforeUnmount, onMounted } from 'vue';
import { useDragAware } from '../composables/useDragAware';
import { dnd } from '../js/DnD';

export default defineComponent({
  name: 'DropMask',
  props: {
    tag: {
      type: [String, Object, Function],
      default: 'div'
    }
  },
  setup () {
    const instance = getCurrentInstance();
    const dragAware = useDragAware();
    dragAware.isDropMask.value = true;

    const createDragImage = () => 'source';
    const onDndMove = (event) => dnd.mouseMove(event, instance.proxy);

    onMounted(() => instance.proxy.$el.addEventListener('easy-dnd-move', onDndMove));
    onBeforeUnmount(() => instance.proxy.$el.removeEventListener('easy-dnd-move', onDndMove));

    return {
      ...dragAware,
      createDragImage,
      onDndMove
    };
  }
});
</script>
