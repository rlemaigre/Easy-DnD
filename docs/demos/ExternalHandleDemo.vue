<template>
  <DemoFrame
    title="Resolve a drag handle outside the Drag component"
    description="Select a card, then use the shared toolbar button to drag it. The handle is resolved only when the pointer goes down."
    docs-link="/components/drag.html#lazy-and-external-handles"
    docs-label="View handle docs →"
    @reset="reset"
  >
    <!-- #region demo-template -->
    <div class="external-handle-demo__toolbar">
      <button
        v-if="selectedId !== null"
        ref="toolbarHandle"
        type="button"
      >
        Drag selected card
      </button>
      <span>{{ selectedId === null ? 'Select a card first' : `Selected card ${selectedId}` }}</span>
    </div>

    <div class="dnd-demo__grid external-handle-demo__layout">
      <div class="external-handle-demo__cards">
        <Drag
          v-for="item in items"
          :key="item.id"
          :data="item"
          :handle="handles[item.id]"
          type="external-handle-card"
          class="dnd-demo__card external-handle-demo__card"
          :class="{ 'external-handle-demo__card--selected': selectedId === item.id }"
          @click="selectedId = item.id"
        >
          <div>
            <strong>{{ item.title }}</strong>
            <small>Click to select</small>
          </div>
        </Drag>
      </div>

      <Drop
        accepts-type="external-handle-card"
        class="dnd-demo__zone external-handle-demo__target"
        @drop="onDrop"
      >
        {{ result }}
      </Drop>
    </div>
    <!-- #endregion demo-template -->
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref } from 'vue';
import { Drag, Drop } from 'vue-easy-dnd';
import type { DnDEventPayload } from 'vue-easy-dnd';

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
const reset = () => {
  selectedId.value = null;
  result.value = 'Drop the selected card here';
};
// #endregion demo-script
</script>

<style scoped>
.external-handle-demo__toolbar {
  display: flex;
  min-height: 3rem;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.external-handle-demo__toolbar button {
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 7px;
  background: var(--vp-c-brand-1);
  color: white;
  cursor: grab;
}

.external-handle-demo__cards {
  display: grid;
  gap: 0.5rem;
}

.external-handle-demo__card {
  cursor: pointer;
}

.external-handle-demo__card--selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.external-handle-demo__target {
  display: grid;
  min-height: 9rem;
  place-content: center;
  text-align: center;
}
</style>
