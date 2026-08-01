<template>
  <main class="issue-demo">
    <h1>Issue #23 — Lazy external handle</h1>
    <p>Select a card, then drag it using the toolbar button rendered outside every Drag component.</p>

    <div v-if="selectedId !== null" class="toolbar">
      <button ref="toolbarHandle" type="button">
        Drag selected card
      </button>
      <span>Selected: {{ selectedId }}</span>
    </div>

    <div class="cards">
      <Drag
        v-for="item in items"
        :key="item.id"
        :data="item"
        :handle="handles[item.id]"
        type="external-handle-card"
        class="card"
        :class="{ selected: selectedId === item.id }"
        @click="selectedId = item.id"
      >
        <strong>{{ item.title }}</strong>
        <small>Click to select; this card itself is not the handle.</small>
      </Drag>
    </div>

    <Drop
      accepts-type="external-handle-card"
      class="target"
      @drop="onDrop"
    >
      {{ result }}
    </Drop>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Drag from '../lib/src/components/Drag.vue';
import Drop from '../lib/src/components/Drop.vue';
import '../lib/src/js/DragImagesManager';
import type { DnDEventPayload } from '../lib/src/types';

const items = [
  { id: 1, title: 'Design brief' },
  { id: 2, title: 'Research notes' },
  { id: 3, title: 'Launch checklist' }
];
const selectedId = ref<number | null>(null);
const toolbarHandle = ref<HTMLButtonElement | null>(null);
const result = ref('Drop the selected card here');
const handles: Record<number, () => Element | null> = Object.fromEntries(
  items.map(item => [item.id, () => selectedId.value === item.id ? toolbarHandle.value : null])
);

const onDrop = (event: DnDEventPayload) => {
  const item = event.data as { title: string };
  result.value = `Dropped: ${item.title}`;
};
</script>

<style scoped>
.issue-demo { max-width: 760px; margin: 40px auto; font-family: sans-serif; }
.toolbar { position: sticky; top: 12px; z-index: 2; display: flex; gap: 14px; align-items: center; padding: 14px; background: #0f172a; color: white; border-radius: 10px; }
.toolbar button { padding: 10px 14px; cursor: grab; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
.card { display: grid; gap: 8px; padding: 20px; border: 2px solid #cbd5e1; border-radius: 10px; cursor: pointer; }
.card.selected { border-color: #2563eb; background: #eff6ff; }
.target { min-height: 130px; border: 2px dashed #2563eb; border-radius: 12px; display: grid; place-items: center; }
small { color: #64748b; }
</style>
