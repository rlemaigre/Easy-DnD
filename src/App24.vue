<template>
  <main class="issue-demo">
    <h1>Issue #67 — Locked DropList item</h1>
    <p>
      Compare true positional locking with the existing disabled-only behavior.
    </p>

    <div class="examples">
      <section>
        <h2>Positional lock</h2>
        <p>
          Uses <code>DropList.reorderable</code> and <code>Drag.disabled</code>. Other items can cross the policy item without changing its position.
        </p>

        <DropList
          :items="lockedItems"
          :reorderable="isReorderable"
          class="list"
          column
          no-animations
          @reorder="$event.apply(lockedItems)"
        >
          <template #item="{ item, index }">
            <Drag
              :key="item.id"
              :data="item"
              :disabled="!isReorderable(item, index)"
              class="item"
              :class="{ locked: item.locked }"
            >
              <span>{{ item.title }}</span>
              <strong v-if="item.locked">Locked at position {{ index + 1 }}</strong>
            </Drag>
          </template>

          <template #feedback>
            <div key="locked-feedback" class="feedback" />
          </template>
        </DropList>

        <p class="hint">
          Try moving “Inbox” to the bottom. The policy remains at position 3.
        </p>
      </section>

      <section>
        <h2>Disabled only</h2>
        <p>
          Uses only <code>Drag.disabled</code>. The policy item cannot start a drag, but another item can cross and shift it.
        </p>

        <DropList
          :items="disabledOnlyItems"
          class="list"
          column
          no-animations
          @reorder="$event.apply(disabledOnlyItems)"
        >
          <template #item="{ item, index }">
            <Drag
              :key="item.id"
              :data="item"
              :disabled="item.locked"
              class="item"
              :class="{ locked: item.locked }"
            >
              <span>{{ item.title }}</span>
              <strong v-if="item.locked">Disabled, currently position {{ index + 1 }}</strong>
            </Drag>
          </template>

          <template #feedback>
            <div key="disabled-feedback" class="feedback" />
          </template>
        </DropList>

        <p class="hint">
          Try moving “Inbox” below the policy item to see its position change.
        </p>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Drag from '../lib/src/components/Drag.vue';
import DropList from '../lib/src/components/DropList.vue';
import '../lib/src/js/DragImagesManager';

interface DemoItem {
  id: number;
  title: string;
  locked?: boolean;
}

const initialItems: DemoItem[] = [
  { id: 1, title: 'Inbox' },
  { id: 2, title: 'Design review' },
  { id: 3, title: 'Required policy', locked: true },
  { id: 4, title: 'Quality assurance' },
  { id: 5, title: 'Ready to publish' }
];
const lockedItems = ref(initialItems.map(item => ({ ...item })));
const disabledOnlyItems = ref(initialItems.map(item => ({ ...item })));
const isReorderable = (item: unknown, index: number) => index >= 0 && !(item as DemoItem).locked;
</script>

<style scoped>
.issue-demo { max-width: 1100px; margin: 40px auto; font-family: sans-serif; }
.examples { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; margin-top: 24px; }
.examples section { min-width: 0; }
.examples section > p { min-height: 48px; }
.list { margin-top: 24px; border: 1px solid #94a3b8; border-radius: 12px; overflow: hidden; }
.item { display: flex; justify-content: space-between; padding: 16px; background: #eff6ff; border-bottom: 1px solid #bfdbfe; cursor: grab; }
.item.locked { background: #fef3c7; border-color: #f59e0b; cursor: not-allowed; }
.item strong { color: #92400e; font-size: 13px; }
.feedback { height: 4px; background: #2563eb; }
.hint { color: #64748b; }
@media (max-width: 760px) { .examples { grid-template-columns: 1fr; } }
</style>
