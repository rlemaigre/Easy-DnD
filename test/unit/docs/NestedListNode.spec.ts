import { describe, expect, it } from 'vitest';
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { ReorderEvent } from '../../../lib/src/js/events';
import NestedListNode from '../../../docs/demos/shared/NestedListNode.vue';
import { applyDemoTreeOperation } from '../../../docs/demos/types';
import type {
  DemoGroup,
  DemoTreeItem,
  DemoTreeOperation,
  DemoWidget
} from '../../../docs/demos/types';

const DragStub = defineComponent({
  name: 'Drag',
  props: ['data'],
  emits: ['cut'],
  template: '<div class="drag-stub" :data-id="data.id"><slot /></div>'
});

const DropListStub = defineComponent({
  name: 'DropList',
  props: ['items'],
  emits: ['insert', 'reorder'],
  template: `
    <div class="drop-list-stub">
      <div v-for="(item, index) in items" :key="index">
        <slot name="item" :item="item" :index="index" :reorder="false" />
      </div>
      <slot name="feedback" />
      <slot name="reordering-feedback" />
      <slot name="empty" />
    </div>
  `
});

const createWidget = (id: number, label: string): DemoWidget => ({ id, label, kind: 'text' });
const createGroup = (id: number, items: DemoTreeItem[]): DemoGroup => ({ id, direction: 'column', items });

const createHarness = (initialGroup: DemoGroup) => {
  const updates = ref<DemoGroup[]>([]);
  const group = ref(initialGroup);

  const wrapper = mount(defineComponent({
    components: { NestedListNode },
    setup () {
      const onOperation = (operation: DemoTreeOperation) => {
        group.value = applyDemoTreeOperation(group.value, operation);
        updates.value.push(group.value);
      };
      return { group, onOperation };
    },
    template: '<NestedListNode :group="group" @operation="onOperation" />'
  }), {
    global: {
      components: {
        Drag: DragStub,
        DropList: DropListStub
      }
    }
  });

  return { wrapper, updates, group };
};

describe('NestedListNode demo component', () => {
  it('inserts a widget and generates a stable widget id', async () => {
    const initial = createGroup(1, [createWidget(10, 'A'), createWidget(11, 'B')]);
    const { wrapper, updates } = createHarness(initial);

    await wrapper.getComponent(DropListStub).vm.$emit('insert', {
      data: { label: 'C', kind: 'text' },
      index: 1
    });

    expect(updates.value).toHaveLength(1);
    expect(updates.value.at(-1)?.items[1]).toMatchObject({ label: 'C', kind: 'text' });
    expect(updates.value.at(-1)?.items[1]).toHaveProperty('id');
    expect(updates.value.at(-1)?.items).toHaveLength(3);
  });

  it('reorders items using provided reorder event', async () => {
    const initial = createGroup(2, [createWidget(20, 'One'), createWidget(21, 'Two'), createWidget(22, 'Three')]);
    const { wrapper, updates } = createHarness(initial);

    await wrapper.getComponent(DropListStub).vm.$emit('reorder', new ReorderEvent(0, 2));
    expect(updates.value).toHaveLength(1);
    expect(updates.value.at(-1)?.items.map((item) => item.id)).toEqual([21, 22, 20]);
  });

  it('removes widgets when their drag source emits cut', async () => {
    const nested = createGroup(3, [createWidget(30, 'Nested')]);
    const initial = createGroup(4, [createWidget(40, 'Root One'), nested, createWidget(42, 'Root Two')]);
    const { wrapper, updates } = createHarness(initial);

    const rootWidget = wrapper.findAllComponents(DragStub)
      .find(drag => (drag.props('data') as DemoTreeItem).id === 40);
    expect(rootWidget).toBeDefined();
    await rootWidget!.vm.$emit('cut');
    expect(updates.value).toHaveLength(1);
    expect(updates.value.at(-1)?.items).toHaveLength(2);
    expect(updates.value.at(-1)?.items.some((item) => item.id === 40)).toBe(false);
  });

  it('moves a widget between nested lists without restoring the cut source snapshot', async () => {
    const moved = createWidget(30, 'Moved widget');
    const source = createGroup(3, [moved]);
    const target = createGroup(4, []);
    const initial = createGroup(5, [source, target]);
    const { wrapper, updates, group } = createHarness(initial);
    const sourceDrag = wrapper.findAllComponents(DragStub)
      .find(drag => (drag.props('data') as DemoTreeItem).id === moved.id);
    const targetList = wrapper.findAllComponents(DropListStub)
      .find(list => (list.props('items') as DemoTreeItem[]).length === 0);
    expect(sourceDrag).toBeDefined();
    expect(targetList).toBeDefined();

    sourceDrag!.vm.$emit('cut');
    targetList!.vm.$emit('insert', { data: moved, index: 0 });
    await wrapper.vm.$nextTick();

    expect(updates.value).toHaveLength(2);
    const updatedSource = group.value.items.find(item => item.id === source.id) as DemoGroup;
    const updatedTarget = group.value.items.find(item => item.id === target.id) as DemoGroup;
    expect(updatedSource.items).toEqual([]);
    expect(updatedTarget.items).toHaveLength(1);
    expect(updatedTarget.items[0]).toMatchObject({ label: moved.label, kind: moved.kind });
  });
});
