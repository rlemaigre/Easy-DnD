<template>
  <DemoFrame
    title="Update a drag image during an active drag"
    description="Move 180px beyond any edge of the original source card to replace the compact preview with its expanded state."
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
          :data="itemName"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        >
          <strong>{{ itemName }}</strong>
          <small>Move 180px beyond any edge to expand</small>

          <template #drag-image>
            <div class="dnd-demo__ghost dynamic-image-demo__preview" :class="previewMode">
              <strong>{{ itemName }}</strong>
              <small v-if="previewMode === 'expanded'">
                Additional content rendered during this drag
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
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref, watch } from 'vue';
import { Drag, Drop, refreshDragImage, useDragAware } from 'vue-easy-dnd';
import type { DnDEventPayload } from 'vue-easy-dnd';

const itemName = 'Demo item';
const { dragPosition } = useDragAware();
const expansionDistance = 180;
const previewMode = ref<'compact' | 'expanded'>('compact');
const sourceBounds = ref<Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'> | null>(null);
const ownsDrag = ref(false);
const result = ref('Drop the item here');

watch(dragPosition, position => {
  const bounds = sourceBounds.value;
  if (!ownsDrag.value || !position || !bounds) return;
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
  ownsDrag.value = true;
  const bounds = event.sourceController?.getElement().getBoundingClientRect();
  sourceBounds.value = bounds
    ? { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }
    : null;
};
const onDragEnd = () => {
  ownsDrag.value = false;
  sourceBounds.value = null;
  previewMode.value = 'compact';
};
const onDrop = (event: DnDEventPayload) => {
  result.value = `Received: ${String(event.data)}`;
};
const reset = () => {
  sourceBounds.value = null;
  previewMode.value = 'compact';
  result.value = 'Drop the item here';
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
