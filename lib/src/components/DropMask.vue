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

<script setup>
import { getCurrentInstance, markRaw, onBeforeUnmount, onMounted, ref } from 'vue';
import { dnd } from '../js/DnD';

defineOptions({
  name: 'DropMask',
});

defineProps({
  tag: {
    type: [String, Object, Function],
    default: 'div'
  }
});

const instance = getCurrentInstance();
const rootElement = ref(null);
const controller = markRaw({
  get component () {
    return instance.exposeProxy ?? instance.proxy;
  },
  isDropMask: true,
  getElement: () => rootElement.value
});
const onDndMove = (event) => dnd.mouseMove(event, controller);

onMounted(() => rootElement.value.addEventListener('easy-dnd-move', onDndMove));
onBeforeUnmount(() => rootElement.value.removeEventListener('easy-dnd-move', onDndMove));
</script>
