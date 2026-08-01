<template>
  <main class="issue-demo">
    <h1>Issue #158 — DropList default slot</h1>
    <p>The footer is rendered after the generated items and remains available when the list is empty.</p>

    <DropList
      :items="items"
      class="list"
      column
      no-animations
      @reorder="$event.apply(items)"
    >
      <template #item="{ item }">
        <Drag
          :key="item"
          :data="item"
          class="item"
        >
          {{ item }}
        </Drag>
      </template>

      <template #feedback>
        <div key="feedback" class="feedback" />
      </template>

      <template #empty>
        <p key="empty" class="empty">
          The list is empty.
        </p>
      </template>

      <button
        key="add-footer"
        class="footer"
        type="button"
        @click="addItem"
      >
        + Add item from the default slot
      </button>
    </DropList>

    <button type="button" @click="items = []">
      Clear list
    </button>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Drag from '../lib/src/components/Drag.vue';
import DropList from '../lib/src/components/DropList.vue';
import '../lib/src/js/DragImagesManager';

const items = ref(['Alpha', 'Bravo', 'Charlie']);
let nextItem = 1;
const addItem = () => items.value.push(`New item ${nextItem++}`);
</script>

<style scoped>
.issue-demo { max-width: 520px; margin: 40px auto; font-family: sans-serif; }
.list { border: 1px solid #94a3b8; border-radius: 12px; overflow: hidden; margin: 24px 0; }
.item, .footer, .empty { display: block; box-sizing: border-box; width: 100%; padding: 14px; }
.item { background: #eff6ff; border-bottom: 1px solid #bfdbfe; cursor: grab; }
.footer { border: 0; background: #0f172a; color: white; cursor: pointer; }
.empty { margin: 0; color: #64748b; text-align: center; }
.feedback { height: 4px; background: #2563eb; }
</style>
