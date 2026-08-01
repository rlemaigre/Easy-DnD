<template>
  <main class="issue-demo">
    <h1>Issue #156 — Shadow DOM support</h1>
    <p>The complete drag-and-drop interaction below is mounted inside a custom element's shadow root.</p>
    <easy-dnd-shadow-issue-demo />
  </main>
</template>

<script setup lang="ts">
import { defineCustomElement, h, ref } from 'vue';
import Drag from '../lib/src/components/Drag.vue';
import Drop from '../lib/src/components/Drop.vue';
import '../lib/src/js/DragImagesManager';
import type { DnDEventPayload } from '../lib/src/types';

const tagName = 'easy-dnd-shadow-issue-demo';
const ShadowDemo = defineCustomElement({
  styles: [`
    :host { display: block; max-height: 320px; overflow: auto; border: 2px solid #7c3aed; border-radius: 12px; }
    .content { min-height: 620px; padding: 20px; font: 16px sans-serif; background: #faf5ff; }
    .source { display: inline-block; padding: 14px 20px; background: #7c3aed; color: white; border-radius: 8px; cursor: grab; }
    .target { margin-top: 390px; padding: 36px; border: 2px dashed #7c3aed; border-radius: 10px; text-align: center; }
    .drop-in { background: #ede9fe; }
  `],
  setup () {
    const result = ref('Drag the purple card, then scroll to the target.');
    const onDrop = (event: DnDEventPayload) => {
      result.value = `Dropped: ${String(event.data)}`;
    };
    return () => h('div', { class: 'content' }, [
      h(Drag, { type: 'shadow-card', data: 'Shadow DOM card' }, {
        default: () => h('div', { class: 'source' }, 'Drag me')
      }),
      h(Drop, { acceptsType: 'shadow-card', onDrop }, {
        default: () => h('div', { class: 'target' }, result.value)
      })
    ]);
  }
});

if (!customElements.get(tagName)) customElements.define(tagName, ShadowDemo);
</script>

<style scoped>
.issue-demo { max-width: 640px; margin: 40px auto; font-family: sans-serif; }
</style>
