<template>
  <DemoFrame
    title="Copy and cut modes"
    description="Copy leaves the source intact. Cut emits back to the source so it can be removed."
    docs-link="/components/drop.html#modes"
    docs-label="View Drop modes docs →"
    @reset="reset"
  >
    <!-- #region demo-template -->
    <div class="dnd-demo__row">
      <Drag
        v-for="item in items"
        :key="item"
        class="dnd-demo__item"
        :data="item"
        @cut="remove(item)"
      >
        {{ item }}
      </Drag>
    </div>
    <div class="dnd-demo__grid" style="margin-top: 1rem">
      <Drop
        class="dnd-demo__zone"
        mode="copy"
        @drop="record('Copied', $event)"
      >
        <span class="dnd-demo__label">Copy</span>
      </Drop>
      <Drop
        class="dnd-demo__zone"
        mode="cut"
        @drop="record('Cut', $event)"
      >
        <span class="dnd-demo__label">Cut</span>
      </Drop>
    </div>
    <!-- #endregion demo-template -->
    <template #footer>
      {{ status }} · {{ items.length }} source items remain
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref } from 'vue';
import { Drag, Drop } from 'vue-easy-dnd';
import type { DnDEventPayload } from 'vue-easy-dnd';

const initialItems = ['One', 'Two', 'Three'];
const items = ref([...initialItems]);
const status = ref('Choose a target');

const remove = (item: string) => {
  items.value = items.value.filter(value => value !== item);
};
const record = (action: string, event: DnDEventPayload) => {
  status.value = `${action} ${String(event.data)}`;
};
const reset = () => {
  items.value = [...initialItems];
  status.value = 'Choose a target';
};
// #endregion demo-script
</script>
