<template>
  <main class="issue-demo">
    <h1>Issue #155 — Scroll propagation</h1>
    <label>
      <input v-model="propagate" type="checkbox" />
      Allow scrolling to propagate to the outer container
    </label>

    <div class="outer-scroll">
      <p class="spacer">
        Outer scroll area
      </p>
      <DropList
        :items="items"
        :scrolling-propagation="propagate"
        :scrolling-edge-size="55"
        class="inner-scroll"
        column
        no-animations
        @reorder="$event.apply(items)"
      >
        <template #item="{ item }">
          <Drag
            :key="item"
            :data="item"
            :scrolling-propagation="propagate"
            class="item"
          >
            {{ item }}
          </Drag>
        </template>
        <template #feedback>
          <div key="feedback" class="feedback" />
        </template>
      </DropList>
      <p class="spacer">
        Outer content below the list
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Drag from '../lib/src/components/Drag.vue';
import DropList from '../lib/src/components/DropList.vue';
import '../lib/src/js/DragImagesManager';

const propagate = ref(false);
const items = ref(Array.from({ length: 18 }, (_, index) => `Scrollable item ${index + 1}`));
</script>

<style scoped>
.issue-demo { max-width: 620px; margin: 40px auto; font-family: sans-serif; }
.outer-scroll { height: 440px; overflow: auto; margin-top: 20px; padding: 20px; border: 3px solid #f97316; border-radius: 14px; }
.inner-scroll { height: 250px; overflow: auto; border: 3px solid #2563eb; border-radius: 10px; }
.item { padding: 14px; background: #eff6ff; border-bottom: 1px solid #bfdbfe; cursor: grab; }
.spacer { height: 180px; display: grid; place-items: center; color: #9a3412; }
.feedback { height: 4px; background: #2563eb; }
</style>
