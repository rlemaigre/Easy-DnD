<template>
  <DemoFrame
    title="Observe drag state"
    description="useDragAware exposes reactive state without coupling your component to drag internals."
    docs-link="/events.html#usedragaware"
    docs-label="View composables docs →"
    :resettable="false"
  >
    <!-- #region demo-template -->
    <div class="dnd-demo__row">
      <Drag
        class="dnd-demo__item"
        type="number"
        :data="1"
      >
        One
      </Drag>
      <Drag
        class="dnd-demo__item"
        type="number"
        :data="2"
      >
        Two
      </Drag>
      <Drop class="dnd-demo__zone demo-state-target">
        Target
      </Drop>
    </div>
    <dl class="demo-state">
      <div><dt>In progress</dt><dd>{{ dragInProgress }}</dd></div>
      <div><dt>Type</dt><dd>{{ dragType ?? '—' }}</dd></div>
      <div><dt>Data</dt><dd>{{ dragData ?? '—' }}</dd></div>
      <div><dt>Position</dt><dd>{{ formattedPosition }}</dd></div>
      <div><dt>Source component</dt><dd>{{ dragSource ? 'available' : '—' }}</dd></div>
      <div><dt>Top component</dt><dd>{{ dragTop ? 'available' : '—' }}</dd></div>
    </dl>
    <!-- #endregion demo-template -->
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { computed } from 'vue';
import { Drag, Drop, useDragAware } from 'vue-easy-dnd';

const {
  dragInProgress,
  dragType,
  dragData,
  dragPosition,
  dragSource,
  dragTop
} = useDragAware();
const formattedPosition = computed(() => dragPosition.value
  ? `${Math.round(dragPosition.value.x)}, ${Math.round(dragPosition.value.y)}`
  : '—');
// #endregion demo-script
</script>

<style scoped>
.demo-state-target {
  flex: 1 1 10rem;
}

.demo-state {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.5rem;
  margin: 1rem 0 0;
}

.demo-state div {
  padding: 0.5rem;
  border-radius: 7px;
  background: var(--vp-c-bg);
}

.demo-state dt {
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}

.demo-state dd {
  margin: 0.1rem 0 0;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
}
</style>
