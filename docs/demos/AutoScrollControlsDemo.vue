<template>
  <DemoFrame
    title="Control nested edge scrolling"
    description="Adjust the edge activation distance and scroll delta, then choose whether scrolling can continue into the outer container."
    docs-link="/components/drag.html#automatic-scrolling"
    docs-label="View automatic-scrolling docs →"
    @reset="reset"
  >
    <!-- #region demo-template -->
    <div class="auto-scroll-demo__controls">
      <label>
        Edge activation distance: <strong>{{ edgeSize }}px</strong>
        <input
          v-model.number="edgeSize"
          type="range"
          min="20"
          max="140"
          step="10"
        />
      </label>
      <label>
        Scroll delta: <strong>{{ scrollDelta }}px per step</strong>
        <input
          v-model.number="scrollDelta"
          type="range"
          min="2"
          max="80"
          step="2"
        />
      </label>
      <label class="auto-scroll-demo__toggle">
        <input v-model="propagate" type="checkbox" />
        Allow propagation to the outer container
      </label>
    </div>

    <div class="auto-scroll-demo__outer">
      <p class="auto-scroll-demo__spacer">
        Outer scroll area above the list
      </p>
      <DropList
        :items="items"
        :scrolling-edge-size="edgeSize"
        :scrolling-propagation="propagate"
        class="dnd-demo__list auto-scroll-demo__inner"
        column
        no-animations
        @reorder="$event.apply(items)"
      >
        <template #item="{ item }">
          <Drag
            :key="item"
            :data="item"
            :scrolling-edge-size="edgeSize"
            :scrolling-speed="scrollDelta"
            :scrolling-propagation="propagate"
            class="dnd-demo__item auto-scroll-demo__item"
          >
            {{ item }}
          </Drag>
        </template>

        <template #feedback>
          <div key="feedback" class="dnd-demo__feedback" />
        </template>
      </DropList>
      <p class="auto-scroll-demo__spacer">
        Outer scroll area below the list
      </p>
    </div>
    <!-- #endregion demo-template -->

    <template #footer>
      {{ propagate ? 'Nested scrolling may continue outward.' : 'Scrolling stops at the inner list.' }}
    </template>
  </DemoFrame>
</template>

<script setup lang="ts">
import DemoFrame from './shared/DemoFrame.vue';

// #region demo-script
import { ref } from 'vue';
import { Drag, DropList } from 'vue-easy-dnd';

const makeItems = () => Array.from({ length: 18 }, (_, index) => `Scrollable item ${index + 1}`);
const edgeSize = ref(50);
const scrollDelta = ref(12);
const propagate = ref(false);
const items = ref(makeItems());
const reset = () => {
  edgeSize.value = 50;
  scrollDelta.value = 12;
  propagate.value = false;
  items.value = makeItems();
};
// #endregion demo-script
</script>

<style scoped>
.auto-scroll-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}

.auto-scroll-demo__controls label:not(.auto-scroll-demo__toggle) {
  display: grid;
  min-width: min(100%, 15rem);
  gap: 0.35rem;
}

.auto-scroll-demo__toggle {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.auto-scroll-demo__outer {
  height: 24rem;
  overflow: auto;
  padding: 0.75rem;
  border: 3px solid var(--vp-c-warning-1);
  border-radius: 10px;
}

.auto-scroll-demo__inner {
  height: 16rem;
  overflow: auto;
  border-color: var(--vp-c-brand-1);
}

.auto-scroll-demo__item {
  width: 100%;
  cursor: grab;
}

.auto-scroll-demo__spacer {
  display: grid;
  height: 8rem;
  margin: 0;
  place-content: center;
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>
