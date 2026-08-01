<template>
  <DemoFrame
    title="Update a drag image during an active drag"
    description="Move the card more than 120px horizontally to replace the compact preview with its expanded state."
    docs-link="/components/drag.html#dynamic-drag-images"
    docs-label="View dynamic drag-image docs →"
    @reset="reset"
  >
    <!-- #region demo-template -->
    <div class="dnd-demo__grid dynamic-image-demo">
      <div>
        <span class="dnd-demo__label">Source</span>
        <Drag
          class="dnd-demo__card dynamic-image-demo__source"
          type="dynamic-preview"
          :data="reportName"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        >
          <strong>{{ reportName }}</strong>
          <small>Drag horizontally to expand the preview</small>

          <template #drag-image>
            <div class="dnd-demo__ghost dynamic-image-demo__preview" :class="previewMode">
              <strong>{{ reportName }}</strong>
              <small v-if="previewMode === 'expanded'">
                Revenue, retention, and customer-growth summary
              </small>
            </div>
          </template>
        </Drag>
      </div>

      <Drop
        class="dnd-demo__zone dynamic-image-demo__target"
        accepts-type="dynamic-preview"
        @drop="onDrop"
      >
        <span class="dnd-demo__label">Target</span>
        {{ result }}
      </Drop>
    </div>
    <!-- #endregion demo-template -->

    <template #footer>
      Preview state: {{ previewMode }}
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref, watch } from 'vue';
import { Drag, Drop, refreshDragImage, useDragAware } from 'vue-easy-dnd';
import type { DnDEventPayload } from 'vue-easy-dnd';

const reportName = 'Quarterly report';
const { dragPosition } = useDragAware();
const previewMode = ref<'compact' | 'expanded'>('compact');
const startX = ref(0);
const ownsDrag = ref(false);
const result = ref('Drop the report here');

watch(dragPosition, position => {
  if (!ownsDrag.value || !position) return;
  const nextMode = Math.abs(position.x - startX.value) > 120 ? 'expanded' : 'compact';
  if (nextMode === previewMode.value) return;
  previewMode.value = nextMode;
  void refreshDragImage();
});

const onDragStart = (event: DnDEventPayload) => {
  ownsDrag.value = true;
  startX.value = event.position?.x ?? 0;
};
const onDragEnd = () => {
  ownsDrag.value = false;
  previewMode.value = 'compact';
};
const onDrop = (event: DnDEventPayload) => {
  result.value = `Received: ${String(event.data)}`;
};
const reset = () => {
  previewMode.value = 'compact';
  result.value = 'Drop the report here';
};
// #endregion demo-script
</script>

<style scoped>
.dynamic-image-demo {
  align-items: stretch;
}

.dynamic-image-demo__source,
.dynamic-image-demo__target {
  min-height: 6rem;
}

.dynamic-image-demo__source {
  cursor: grab;
}

.dynamic-image-demo__target {
  display: grid;
  place-content: center;
  text-align: center;
}

.dynamic-image-demo__preview {
  display: grid;
  gap: 0.25rem;
  transition: padding 0.15s, background 0.15s;
}

.dynamic-image-demo__preview.expanded {
  padding: 1rem 1.25rem;
  background: var(--vp-c-purple-1);
}

.dynamic-image-demo__preview small {
  color: white;
}
</style>
