<template>
  <main class="issue-demo">
    <h1>Issue #30 — Dynamic drag image</h1>
    <p>Drag more than 180px beyond any edge of the original “Drag this item” box to expand the active preview.</p>

    <div class="stage">
      <Drag
        type="dynamic-card"
        :data="'Demo item'"
        class="source"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
      >
        <strong>Drag this item</strong>
        <small>Move 180px beyond any edge to expand</small>
        <template #drag-image>
          <div class="preview" :class="previewMode">
            <strong>Demo item</strong>
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
const expansionDistance = 180;
const previewMode = ref<'compact' | 'expanded'>('compact');
const sourceBounds = ref<Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'> | null>(null);
const result = ref('Drop here');

watch(dragPosition, position => {
  const bounds = sourceBounds.value;
  if (!position || !bounds) return;
  const isOutsideSource = position.x < bounds.left - expansionDistance ||
    position.x > bounds.right + expansionDistance ||
    position.y < bounds.top - expansionDistance ||
    position.y > bounds.bottom + expansionDistance;
  const nextMode = isOutsideSource ? 'expanded' : 'compact';
  if (nextMode === previewMode.value) return;
  previewMode.value = nextMode;
  void refreshDragImage();
});

const onDragStart = (event: DnDEventPayload) => {
  const bounds = event.sourceController?.getElement().getBoundingClientRect();
  sourceBounds.value = bounds
    ? { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }
    : null;
};
const onDragEnd = () => {
  sourceBounds.value = null;
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
.source { display: grid; gap: 6px; background: #1d4ed8; color: white; cursor: grab; }
.source small { opacity: 0.8; }
.target { min-width: 240px; border: 2px dashed #1d4ed8; display: grid; place-items: center; }
.preview { display: grid; gap: 6px; padding: 16px; border-radius: 10px; color: white; background: #1d4ed8; white-space: nowrap; }
.preview.expanded { padding: 24px; background: #7c3aed; }
</style>
