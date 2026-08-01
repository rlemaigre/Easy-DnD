<template>
  <DemoFrame
    title="Reorder and transfer list items"
    description="Items can be reordered in place or cut from one list and inserted into the other."
    docs-link="/components/droplist.html"
    docs-label="View DropList component docs →"
    @reset="reset"
  >
    <div class="dnd-demo__grid">
      <div v-for="list in lists" :key="list.id">
        <span class="dnd-demo__label">{{ list.label }}</span>
        <DropList
          class="dnd-demo__list"
          :items="list.items"
          mode="cut"
          @insert="insert(list.items, $event)"
          @reorder="$event.apply(list.items)"
        >
          <template #item="{ item }">
            <Drag
              :key="item"
              class="dnd-demo__item"
              type="list-item"
              :data="item"
              @cut="remove(list.items, item)"
            >
              {{ item }}
            </Drag>
          </template>
          <template #feedback>
            <div key="feedback" class="dnd-demo__feedback" />
          </template>
          <template #empty>
            <small key="empty">Drop an item here</small>
          </template>
        </DropList>
      </div>
    </div>
  </DemoFrame>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { Drag, DropList } from '../../lib/src';
import type { DemoInsertEvent } from './types';
import DemoFrame from './shared/DemoFrame.vue';

interface DemoList {
  id: string;
  label: string;
  items: string[];
}

const makeLists = (): DemoList[] => [
  { id: 'first', label: 'First list', items: ['One', 'Two', 'Three'] },
  { id: 'second', label: 'Second list', items: ['A', 'B', 'C'] }
];
const lists = reactive<DemoList[]>(makeLists());

const insert = (items: string[], event: DemoInsertEvent<string>) => {
  items.splice(event.index, 0, event.data);
};
const remove = (items: string[], item: string) => {
  const index = items.indexOf(item);
  if (index >= 0) items.splice(index, 1);
};
const reset = () => {
  lists.splice(0, lists.length, ...makeLists());
};
</script>
