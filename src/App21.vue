<template>
  <main class="issue-demo">
    <h1>Issue #136 — Configurable autoscroll speed</h1>
    <label>
      Maximum step: <strong>{{ speed }}px</strong>
      <input
        v-model.number="speed"
        type="range"
        min="2"
        max="80"
        step="2"
      />
    </label>

    <DropList
      :items="items"
      class="scroll-list"
      column
      no-animations
      @reorder="$event.apply(items)"
    >
      <template #item="{ item }">
        <Drag
          :key="item"
          :data="item"
          :scrolling-speed="speed"
          class="item"
        >
          {{ item }}
        </Drag>
      </template>
      <template #feedback>
        <div key="feedback" class="feedback" />
      </template>
    </DropList>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Drag from '../lib/src/components/Drag.vue';
import DropList from '../lib/src/components/DropList.vue';
import '../lib/src/js/DragImagesManager';

const speed = ref(12);
const items = ref(Array.from({ length: 24 }, (_, index) => `Item ${index + 1}`));
</script>

<style scoped>
.issue-demo { max-width: 520px; margin: 40px auto; font-family: sans-serif; }
label { display: grid; gap: 8px; margin-bottom: 18px; }
.scroll-list { height: 380px; overflow: auto; border: 2px solid #0f766e; border-radius: 12px; }
.item { padding: 14px; background: #f0fdfa; border-bottom: 1px solid #99f6e4; cursor: grab; }
.feedback { height: 4px; background: #0f766e; }
</style>
