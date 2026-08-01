<template>
  <main class="issue-demo">
    <h1>Issue #30 — Dynamic drag image</h1>
    <p>Move more than 180px from the starting point to expand the active preview while dragging.</p>

    <div class="stage">
      <Drag
        type="dynamic-card"
        :data="'Quarterly report'"
        class="source"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
      >
        Drag the report
        <template #drag-image>
          <div class="preview" :class="previewMode">
            <strong>Quarterly report</strong>
            <span v-if="previewMode === 'expanded'">Dynamic details added during this drag</span>
          </div>
        </template>
      </Drag>

      <Drop
        accepts-type="dynamic-card"
        class="target"
        @drop="onDrop"
      >
        {{ result }}
      </Drop>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Drag, Drop, refreshDragImage, useDragAware } from '../lib/src';
import type { DnDEventPayload } from '../lib/src/types';

const { dragPosition } = useDragAware();
const previewMode = ref<'compact' | 'expanded'>('compact');
const startX = ref(0);
const result = ref('Drop here');

watch(dragPosition, position => {
  if (!position) return;
  const nextMode = Math.abs(position.x - startX.value) > 180 ? 'expanded' : 'compact';
  if (nextMode === previewMode.value) return;
  previewMode.value = nextMode;
  void refreshDragImage();
});

const onDragStart = (event: DnDEventPayload) => {
  startX.value = event.position?.x ?? 0;
};
const onDragEnd = () => {
  previewMode.value = 'compact';
};
const onDrop = (event: DnDEventPayload) => {
  result.value = `Received ${String(event.data)}`;
};
</script>

<style scoped>
.issue-demo { max-width: 760px; margin: 40px auto; font-family: sans-serif; }
.stage { display: flex; justify-content: space-between; gap: 80px; margin-top: 50px; }
.source, .target { padding: 28px; border-radius: 12px; }
.source { background: #1d4ed8; color: white; cursor: grab; }
.target { min-width: 240px; border: 2px dashed #1d4ed8; display: grid; place-items: center; }
.preview { display: grid; gap: 6px; padding: 16px; border-radius: 10px; color: white; background: #1d4ed8; white-space: nowrap; }
.preview.expanded { padding: 24px; background: #7c3aed; }
</style>
