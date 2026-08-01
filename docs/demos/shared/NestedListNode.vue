<template>
  <DropList
    class="dnd-demo__list nested-list"
    :class="{ 'dnd-demo__list--row': group.direction === 'row' }"
    :items="group.items"
    accepts-type="widget"
    mode="cut"
    :row="group.direction === 'row'"
    :column="group.direction === 'column'"
    @insert="insert"
    @reorder="reorder"
  >
    <template #item="{ item, index }">
      <NestedListNode
        v-if="isDemoGroup(item)"
        :key="item.id"
        :group="item"
        :rich="rich"
        @update:group="updateChild(index, $event)"
      />
      <Drag
        v-else
        :key="item.id"
        class="dnd-demo__widget"
        :class="rich ? `dnd-demo__widget--${item.kind}` : undefined"
        :style="rich ? { '--widget-height': dashboardHeight(item.kind) } : undefined"
        type="widget"
        :data="item"
        @cut="remove(index)"
      >
        <DashboardWidgetPreview v-if="rich" :widget="item" />
        <template v-else>
          <strong>{{ item.label }}</strong>
          <small>{{ item.kind }}</small>
        </template>
      </Drag>
    </template>
    <template #feedback="{ data }">
      <div
        v-if="rich && isRichDemoWidget(data)"
        key="rich-feedback"
        :class="feedbackClass(data)"
        :style="{ '--feedback-height': feedbackHeight(data.kind) }"
      >
        <span class="dnd-demo__feedback-label">{{ data.kind }} widget</span>
      </div>
      <div v-else key="feedback" class="dnd-demo__feedback" />
    </template>
    <template #reordering-feedback="{ item }">
      <div
        v-if="rich && isRichDemoWidget(item)"
        key="rich-reordering-feedback"
        :class="feedbackClass(item)"
        :style="{ '--feedback-height': feedbackHeight(item.kind) }"
      >
        <span class="dnd-demo__feedback-label">{{ item.kind }} widget</span>
      </div>
      <div v-else key="reordering-feedback-fallback" class="dnd-demo__feedback" />
    </template>
    <template #empty>
      <small key="empty">Drop a widget here</small>
    </template>
  </DropList>
</template>

<script setup lang="ts">
import { Drag, DropList } from '../../../lib/src';
import type { DemoGroup, DemoInsertEvent, DemoReorderEvent, DemoTreeItem, DemoWidget } from '../types';
import { createDemoId, isDemoGroup } from '../types';
import DashboardWidgetPreview from './DashboardWidgetPreview.vue';

const props = defineProps<{
  group: DemoGroup;
  rich?: boolean;
}>();
const emit = defineEmits<{
  'update:group': [group: DemoGroup];
}>();

const updateItems = (items: DemoTreeItem[]) => {
  emit('update:group', { ...props.group, items });
};
const insert = (event: DemoInsertEvent<DemoTreeItem>) => {
  const items = [...props.group.items];
  const item = isDemoGroup(event.data)
    ? event.data
    : { ...event.data, id: createDemoId() };
  items.splice(event.index, 0, item);
  updateItems(items);
};
const reorder = (event: DemoReorderEvent) => {
  const items = [...props.group.items];
  event.apply(items);
  updateItems(items);
};
const remove = (index: number) => {
  const items = [...props.group.items];
  items.splice(index, 1);
  updateItems(items);
};
const updateChild = (index: number, child: DemoGroup) => {
  const items = [...props.group.items];
  items[index] = child;
  updateItems(items);
};

const isRichDemoWidget = (value: unknown): value is DemoWidget => {
  return !!value && typeof value === 'object' &&
    'kind' in value &&
    typeof (value as DemoWidget).kind === 'string' &&
    'label' in value &&
    'id' in value;
};

const feedbackClass = (item: DemoWidget) => [
  'dnd-demo__feedback',
  'dnd-demo__feedback--dashboard'
];

const feedbackHeight = (kind: DemoWidget['kind']) => {
  if (kind === 'chart') return '10rem';
  if (kind === 'metric') return '5.35rem';
  if (kind === 'activity') return '6.2rem';
  return '5rem';
};

const dashboardHeight = (kind: DemoWidget['kind']) => {
  if (kind === 'chart') return '10rem';
  if (kind === 'metric') return '5.35rem';
  if (kind === 'activity') return '6.2rem';
  return '5rem';
};
</script>

<style scoped>
.nested-list {
  width: 100%;
  flex: none;
  min-width: 0;
  max-width: 100%;
}

.dnd-demo__list--row > .dnd-demo__widget--chart {
  flex-grow: 1.7;
}

.dnd-demo__widget {
  min-height: var(--widget-height, auto);
}

.dnd-demo__feedback--dashboard {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  height: var(--feedback-height, 0);
  width: auto;
  box-sizing: border-box;
  padding: 0;
  border: 2px dashed var(--vp-c-brand-1);
  border-radius: 7px;
  background: color-mix(in srgb, var(--vp-c-brand-soft) 65%, transparent);
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  text-transform: lowercase;
}

.dnd-demo__feedback--dashboard .dnd-demo__feedback-label {
  opacity: 0.8;
  pointer-events: none;
}

:global(.drag-in-progress .nested-list > *) {
  transition-duration: 0s;
}

@container (max-width: 520px) {
  .nested-list.dnd-demo__list--row {
    flex-direction: column;
  }

  .nested-list.dnd-demo__list--row > :deep(*) {
    width: 100%;
    flex: none;
  }
}
</style>
