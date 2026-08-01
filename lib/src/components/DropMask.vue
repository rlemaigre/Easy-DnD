<template>
  <component
    :is="tag"
    ref="rootElement"
  >
    <template v-for="(args, slot) of $slots" #[slot]>
      <slot :name="slot" v-bind="args" />
    </template>
  </component>
</template>

<script>
import { defineComponent, getCurrentInstance, markRaw, onBeforeUnmount, onMounted, ref } from 'vue';
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
    const rootElement = ref(null);
    const dragAware = useDragAware();
    dragAware.isDropMask.value = true;
    const controller = markRaw({
      component: instance.proxy,
      isDropMask: true,
      getElement: () => rootElement.value
    });

    const createDragImage = () => 'source';
    const onDndMove = (event) => dnd.mouseMove(event, controller);

    onMounted(() => rootElement.value.addEventListener('easy-dnd-move', onDndMove));
    onBeforeUnmount(() => rootElement.value.removeEventListener('easy-dnd-move', onDndMove));

    return {
      ...dragAware,
      rootElement,
      controller,
      createDragImage,
      onDndMove
    };
  }
});
</script>
