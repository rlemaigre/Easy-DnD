<template>
  <DemoFrame
    title="Custom drag images"
    description="Drag a profile icon and see how each drop zone can show a different drag image."
    docs-link="/components/drag.html#drag-image"
    docs-label="View Drag image docs →"
    @reset="status = 'Drag the item through both target levels'"
  >
    <Drag
      class="dnd-demo__item"
      type="sample"
      :data="profileName"
    >
      <img
        :src="avatarAlex"
        draggable="false"
        :alt="`Profile icon for ${profileName}`"
        class="demo-profile-icon"
      />
      <template #drag-image>
        <img
          :src="avatarAlex"
          draggable="false"
          :alt="`Profile icon for ${profileName}`"
          class="dnd-demo__ghost demo-drag-image"
        />
      </template>
    </Drag>

    <Drop
      class="dnd-demo__zone demo-nested-zone"
      accepts-type="sample"
      @drop="record('outer')"
    >
      <span class="dnd-demo__label">Outer target</span>
      <template #drag-image="{ data }">
        <img
          :src="avatarJordan"
          draggable="false"
          :alt="`Outer drag target preview for ${data}`"
          class="dnd-demo__ghost demo-drag-image"
        />
      </template>

      <Drop
        class="dnd-demo__zone"
        accepts-type="sample"
        @drop="record('inner')"
      >
        <span class="dnd-demo__label">Nested target</span>
        <DropMask class="demo-mask">
          Masked area
        </DropMask>
        <template #drag-image="{ data }">
          <img
            :src="avatarSam"
            draggable="false"
            :alt="`Nested drag target preview for ${data}`"
            class="dnd-demo__ghost demo-drag-image"
          />
        </template>
      </Drop>
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
import avatarAlex from './assets/avatar-alex.jpg';
import avatarJordan from './assets/avatar-jordan.jpg';
import avatarSam from './assets/avatar-sam.jpg';

const status = ref('Drag the item through both target levels');
const profileName = 'Profile';
const record = (target: string) => {
  status.value = `Dropped on the ${target} target`;
};
</script>

<style scoped>
.demo-drag-image {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 999px;
  object-fit: cover;
  box-shadow: var(--vp-shadow-3);
}

.demo-profile-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 999px;
  object-fit: cover;
}

.dnd-demo__item {
  min-width: 4.75rem;
  min-height: 4.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
}

.demo-nested-zone {
  margin-top: 1rem;
}

.demo-mask {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border-radius: 7px;
  background: var(--vp-c-danger-soft);
  text-align: center;
}
</style>
