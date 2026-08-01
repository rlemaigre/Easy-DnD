<template>
  <DemoFrame
    title="Return unsuccessful drags"
    description="Release outside the target to see the drag image return to its source."
    docs-link="/components/drag.html"
    docs-label="View Drag component docs →"
    @reset="status = 'Nothing dropped yet'"
  >
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
    <template #footer>
      {{ status }}
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Drag, Drop } from '../../lib/src';
import type { DnDEventPayload } from '../../lib/src';
import DemoFrame from './shared/DemoFrame.vue';

const status = ref('Nothing dropped yet');
const onDrop = (event: DnDEventPayload) => {
  status.value = `Dropped: ${String(event.data)}`;
};
</script>
