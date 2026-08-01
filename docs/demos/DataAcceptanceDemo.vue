<template>
  <DemoFrame
    title="Filter drag data"
    description="All items share a type; accepts-data decides whether each value is allowed."
    docs-link="/components/drop.html#restricting-droppable-data"
    docs-label="View Drop acceptance docs →"
    @reset="reset"
  >
    <!-- #region demo-template -->
    <div class="dnd-demo__row">
      <Drag
        v-for="number in numbers"
        :key="number"
        class="dnd-demo__item"
        type="number"
        :data="number"
        @cut="remove(number)"
      >
        {{ number }}
      </Drag>
    </div>
    <div class="dnd-demo__grid" style="margin-top: 1rem">
      <Drop
        class="dnd-demo__zone"
        :accepts-data="isEven"
        @drop="record('Even', $event)"
      >
        <span class="dnd-demo__label">Copy even numbers</span>
      </Drop>
      <Drop
        class="dnd-demo__zone"
        :accepts-data="isOdd"
        @drop="record('Odd', $event)"
      >
        <span class="dnd-demo__label">Copy odd numbers</span>
      </Drop>
      <Drop
        class="dnd-demo__zone"
        mode="cut"
        @drop="record('Removed', $event)"
      >
        <span class="dnd-demo__label">Cut any number</span>
      </Drop>
    </div>
    <!-- #endregion demo-template -->
    <template #footer>
      {{ status }}
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref } from 'vue';
import { Drag, Drop } from 'vue-easy-dnd';
import type { DnDEventPayload, DragData } from 'vue-easy-dnd';

const numbers = ref([1, 2, 3, 4, 5]);
const status = ref('Try each target');
const isEven = (data: DragData) => typeof data === 'number' && data % 2 === 0;
const isOdd = (data: DragData) => typeof data === 'number' && data % 2 === 1;
const remove = (number: number) => {
  numbers.value = numbers.value.filter(value => value !== number);
};
const record = (target: string, event: DnDEventPayload) => {
  status.value = `${target}: ${String(event.data)}`;
};
const reset = () => {
  numbers.value = [1, 2, 3, 4, 5];
  status.value = 'Try each target';
};
// #endregion demo-script
</script>
