<template>
  <component
    :is="tag"
    @vue:mounted="setRootElement"
    @vue:updated="setRootElement"
  >
    <template v-for="(args, slot) of $slots" #[slot]>
      <slot :name="slot" v-bind="args" />
    </template>
  </component>
</template>

<script lang="ts" setup>
import { getCurrentInstance, markRaw, onBeforeUnmount, onMounted, ref, type VNode } from 'vue';
import { dnd } from '../js/DnD';
import type { DropMaskController } from '../types';

defineOptions({
  name: 'DropMask',
});

defineProps({
  tag: {
    type: [String, Object, Function],
    default: 'div'
  }
});

const instance = getCurrentInstance()!;
const rootElement = ref<HTMLElement | null>(null);
const setRootElement = (vnode: VNode) => {
  rootElement.value = vnode.el instanceof HTMLElement ? vnode.el : null;
};
const getRootElement = (): HTMLElement => {
  if (!rootElement.value) {
    throw new TypeError('Easy-DnD DropMask requires its tag component to render a single HTML root element.');
  }
  return rootElement.value;
};
const controller: DropMaskController = markRaw({
  get component () {
    return instance.exposeProxy ?? instance.proxy;
  },
  isDropMask: true as const,
  getElement: getRootElement
});
const onDndMove = (event: Event) => dnd.mouseMove(event as CustomEvent, controller);

onMounted(() => getRootElement().addEventListener('easy-dnd-move', onDndMove));
onBeforeUnmount(() => rootElement.value?.removeEventListener('easy-dnd-move', onDndMove));
</script>
