<template>
  <DemoFrame
    title="Keep an item pinned while others move around it"
    description="The policy remains at position 3 while unlocked items can move from one side of it to the other."
    docs-link="/components/droplist.html#position-locking"
    docs-label="View position-locking docs →"
    @reset="reset"
  >
    <!-- #region demo-template -->
    <DropList
      :items="items"
      :reorderable="isReorderable"
      class="dnd-demo__list position-lock-demo__list"
      column
      no-animations
      @reorder="reorder"
    >
      <template #item="{ item, index }">
        <Drag
          :key="item.id"
          :data="item"
          :disabled="!isReorderable(item, index)"
          class="dnd-demo__item position-lock-demo__item"
          :class="{ 'position-lock-demo__item--locked': item.locked }"
        >
          <span>{{ item.label }}</span>
          <small v-if="item.locked">Pinned at position {{ index + 1 }}</small>
        </Drag>
      </template>

      <template #feedback>
        <div key="feedback" class="dnd-demo__feedback" />
      </template>
    </DropList>
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
import { Drag, DropList } from 'vue-easy-dnd';
import type { DemoReorderEvent } from './types';

interface PositionLockItem {
  id: number;
  label: string;
  locked?: boolean;
}

const makeItems = (): PositionLockItem[] => [
  { id: 1, label: 'Inbox' },
  { id: 2, label: 'Design review' },
  { id: 3, label: 'Required policy', locked: true },
  { id: 4, label: 'Quality assurance' },
  { id: 5, label: 'Ready to publish' }
];
const items = ref(makeItems());
const status = ref('Move an unlocked item across the pinned policy.');
const isReorderable = (item: unknown, index: number) =>
  index >= 0 && !(item as PositionLockItem).locked;
const reorder = (event: DemoReorderEvent) => {
  event.apply(items.value);
  status.value = `Moved position ${event.from + 1} to ${event.to + 1}; the policy is still position 3.`;
};
const reset = () => {
  items.value = makeItems();
  status.value = 'Move an unlocked item across the pinned policy.';
};
// #endregion demo-script
</script>

<style scoped>
.position-lock-demo__list {
  max-width: 28rem;
  margin: 0 auto;
}

.position-lock-demo__item {
  width: 100%;
  justify-content: space-between;
}

.position-lock-demo__item--locked {
  border-color: var(--vp-c-warning-1);
  background: var(--vp-c-warning-soft);
  cursor: not-allowed;
}

.position-lock-demo__item small {
  color: var(--vp-c-warning-1);
  font-weight: 700;
}
</style>
