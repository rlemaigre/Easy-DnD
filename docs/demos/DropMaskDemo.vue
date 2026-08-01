<template>
  <DemoFrame
    title="Mask part of a drop target"
    description="Releasing over the pink mask does nothing; the surrounding target still accepts drops."
    docs-link="/components/dropmask.html"
    docs-label="View DropMask component docs →"
    @reset="status = 'Nothing dropped yet'"
  >
    <Drag
      class="dnd-demo__item"
      data="Masked example"
      go-back
    >
      Drag me
    </Drag>
    <Drop class="dnd-demo__zone demo-mask-target" @drop="onDrop">
      <span class="dnd-demo__label">Drop target</span>
      <DropMask class="demo-mask">
        DropMask
      </DropMask>
    </Drop>
    <template #footer>
      {{ status }}
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Drag, Drop, DropMask } from '../../lib/src';
import DemoFrame from './shared/DemoFrame.vue';

const status = ref('Nothing dropped yet');
const onDrop = () => {
  status.value = 'Dropped on the unmasked target';
};
</script>

<style scoped>
.demo-mask-target {
  margin-top: 1rem;
}

.demo-mask {
  width: min(14rem, 70%);
  margin: 0.5rem auto;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-danger-1);
  border-radius: 8px;
  background: var(--vp-c-danger-soft);
  text-align: center;
}
</style>
