<template>
  <DemoFrame
    title="Drag and drop inside an open Shadow DOM"
    description="The source, target, event routing, and scroll-parent lookup all operate inside this isolated shadow root."
    :resettable="false"
  >
    <div
      ref="host"
      class="shadow-dom-demo__host"
      aria-label="Shadow DOM drag-and-drop example"
    />
  </DemoFrame>
</template>

<script setup lang="ts">
import { createApp, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import { Drag, Drop } from '../../lib/src';
import type { DnDEventPayload } from '../../lib/src';
import DemoFrame from './shared/DemoFrame.vue';

const shadowStyles = `
  :host { display: block; height: 20rem; overflow: auto; border: 2px solid #7c3aed; border-radius: 10px; }
  * { box-sizing: border-box; }
  .content { min-height: 38rem; padding: 1rem; color: #1f2937; background: #faf5ff; font: 15px/1.5 system-ui, sans-serif; }
  .source { display: inline-block; padding: .7rem 1rem; border-radius: 8px; background: #7c3aed; color: white; cursor: grab; user-select: none; }
  .target { display: grid; min-height: 7rem; margin-top: 22rem; place-content: center; border: 2px dashed #7c3aed; border-radius: 9px; text-align: center; }
  .target.drop-in { background: #ede9fe; }
`;
const ShadowContent = defineComponent({
  name: 'ShadowDndContent',
  setup () {
    const result = ref('Drag the purple card, scroll down, and drop it here.');
    const onDrop = (event: DnDEventPayload) => {
      result.value = `Dropped: ${String(event.data)}`;
    };
    return () => h('div', { class: 'content' }, [
      h('style', shadowStyles),
      h(Drag, { type: 'shadow-card', data: 'Shadow DOM card' }, {
        default: () => h('div', { class: 'source' }, 'Drag inside the shadow root')
      }),
      h(Drop, { acceptsType: 'shadow-card', class: 'target', onDrop }, {
        default: () => result.value
      })
    ]);
  }
});

const host = ref<HTMLElement | null>(null);
let shadowApp: ReturnType<typeof createApp> | null = null;
onMounted(() => {
  if (!host.value) return;
  const shadowRoot = host.value.attachShadow({ mode: 'open' });
  const mountPoint = document.createElement('div');
  shadowRoot.appendChild(mountPoint);
  shadowApp = createApp(ShadowContent);
  shadowApp.mount(mountPoint);
});
onBeforeUnmount(() => {
  shadowApp?.unmount();
  shadowApp = null;
});
</script>

<style scoped>
.shadow-dom-demo__host {
  display: block;
  min-height: 20rem;
}
</style>
