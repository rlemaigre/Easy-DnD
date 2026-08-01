<template>
  <DemoFrame
    title="Accept drag types"
    description="Each target participates only when its configured type is being dragged."
    docs-link="/components/drag.html#types"
    docs-label="View Drag types docs →"
    @reset="lastDrop = 'Try either item'"
  >
    <!-- #region demo-template -->
    <div class="dnd-demo__row">
      <Drag
        class="dnd-demo__item"
        type="number"
        :data="42"
      >
        Number 42
      </Drag>
      <Drag
        class="dnd-demo__item"
        type="letter"
        data="A"
      >
        Letter A
      </Drag>
    </div>
    <div class="dnd-demo__grid" style="margin-top: 1rem">
      <Drop
        class="dnd-demo__zone"
        accepts-type="number"
        @drop="record('Numbers', $event)"
      >
        <span class="dnd-demo__label">Numbers only</span>
      </Drop>
      <Drop
        class="dnd-demo__zone"
        accepts-type="letter"
        @drop="record('Letters', $event)"
      >
        <span class="dnd-demo__label">Letters only</span>
      </Drop>
    </div>
    <!-- #endregion demo-template -->
    <template #footer>
      {{ lastDrop }}
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref } from 'vue';
import { Drag, Drop } from 'vue-easy-dnd';
import type { DnDEventPayload } from 'vue-easy-dnd';

const lastDrop = ref('Try either item');
const record = (target: string, event: DnDEventPayload) => {
  lastDrop.value = `${target} accepted ${String(event.data)}`;
};
// #endregion demo-script
</script>
