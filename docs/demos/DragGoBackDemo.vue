<template>
  <DemoFrame
    title="Return unsuccessful drags"
    description="Release outside the target to see the drag image return to its source."
    docs-link="/components/drag.html"
    docs-label="View Drag component docs →"
    @reset="status = 'Nothing dropped yet'"
  >
    <!-- #region go-back-example -->
    <div class="dnd-demo__grid">
      <div>
        <span class="dnd-demo__label">Source</span>
        <Drag
          class="dnd-demo__item"
          :data="'Example item'"
          go-back
        >
          Drag me
        </Drag>
      </div>
      <Drop class="dnd-demo__zone" @drop="onDrop">
        <span class="dnd-demo__label">Valid target</span>
        Drop here
      </Drop>
    </div>
    <!-- #endregion go-back-example -->
    <template #footer>
      {{ status }}
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region go-back-script
import { ref } from 'vue';
import { Drag, Drop } from 'vue-easy-dnd';
import type { DnDEventPayload } from 'vue-easy-dnd';

const status = ref('Nothing dropped yet');
const onDrop = (event: DnDEventPayload) => {
  status.value = `Dropped: ${String(event.data)}`;
};
// #endregion go-back-script
</script>
