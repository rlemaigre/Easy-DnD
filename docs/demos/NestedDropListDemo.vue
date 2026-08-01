<template>
  <DemoFrame
    title="Nested drop lists"
    description="Move widgets between row and column lists; each list declares its direction."
    docs-link="/components/droplist.html#nested-droplists"
    docs-label="View nested DropList docs →"
    @reset="tree = makeTree()"
  >
    <NestedListNode :group="tree" @update:group="tree = $event" />
  </DemoFrame>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { DemoGroup } from './types';
import DemoFrame from './shared/DemoFrame.vue';
import NestedListNode from './shared/NestedListNode.vue';

const makeTree = (): DemoGroup => ({
  id: 1,
  direction: 'column',
  items: [
    { id: 2, label: 'Header', kind: 'text' },
    {
      id: 3,
      direction: 'row',
      items: [
        { id: 4, label: 'Metric', kind: 'metric' },
        {
          id: 5,
          direction: 'column',
          items: [
            { id: 6, label: 'Chart', kind: 'chart' },
            { id: 7, label: 'Summary', kind: 'text' }
          ]
        }
      ]
    }
  ]
});
const tree = ref<DemoGroup>(makeTree());
</script>
