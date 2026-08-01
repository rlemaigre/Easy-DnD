<template>
  <DemoFrame
    title="Nested drop lists"
    description="Move widgets between row and column lists; each list declares its direction."
    docs-link="/components/droplist.html#nested-droplists"
    docs-label="View nested DropList docs →"
    @reset="tree = makeTree()"
  >
    <!-- #region demo-template -->
    <NestedListNode :group="tree" @operation="applyOperation" />
    <!-- #endregion demo-template -->
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref } from 'vue';
import type { DemoGroup, DemoTreeOperation } from './types';
import { applyDemoTreeOperation } from './types';
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
const applyOperation = (operation: DemoTreeOperation) => {
  tree.value = applyDemoTreeOperation(tree.value, operation);
};
// #endregion demo-script
</script>
