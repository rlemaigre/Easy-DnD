import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import DropList from '../../../lib/src/components/DropList.vue';
import { dnd } from '../../../lib/src/js/DnD';
import { InsertEvent, ReorderEvent } from '../../../lib/src/js/events';
import { makeDragController, moveEvent, rect, setRect } from '../../helpers/dnd';

interface Item {
  id: number;
  label: string;
}

const items: Item[] = [
  { id: 1, label: 'One' },
  { id: 2, label: 'Two' },
  { id: 3, label: 'Three' }
];

const mountList = (props: Record<string, unknown> = {}) => mount(DropList, {
  attachTo: document.body,
  props: {
    items,
    acceptsType: 'widget',
    mode: 'copy',
    column: true,
    noAnimations: true,
    ...props
  },
  slots: {
    item: ({ item, reorder }: { item: Item; reorder: boolean }) => h('div', {
      class: ['item', { reordered: reorder }],
      key: item.id,
      'data-id': item.id
    }, item.label),
    feedback: () => h('div', { class: 'feedback', key: 'available-feedback' }),
    'reordering-feedback': ({ item }: { item: Item }) => h('div', {
      class: 'reordering-feedback',
      key: 'reordering-feedback'
    }, item.label),
    empty: () => h('small', { class: 'empty' }, 'Nothing here')
  }
});

const layOut = (wrapper: ReturnType<typeof mountList>) => {
  setRect(wrapper.element, rect(0, 0, 200, 160));
  wrapper.findAll('.item').forEach((item, index) => {
    setRect(item.element, rect(0, index * 40, 200, 40));
  });
};

describe('DropList component', () => {
  it('renders items through the item slot and supports a custom tag', () => {
    const wrapper = mountList({ tag: 'ol' });

    expect(wrapper.element.tagName).toBe('OL');
    expect(wrapper.findAll('.item').map(item => item.text())).toEqual(['One', 'Two', 'Three']);
    expect(wrapper.classes()).toContain('drop-list');
  });

  it('emits drop and insert at the closest position for an external drag', async () => {
    const onDrop = vi.fn();
    const onInsert = vi.fn();
    const source = makeDragController();
    const wrapper = mountList({ onDrop, onInsert });
    layOut(wrapper);

    dnd.startDrag(source, new Event('mousedown'), 0, 0, 'widget', { id: 4, label: 'Four' });
    await nextTick();
    await nextTick();
    layOut(wrapper);
    const state = wrapper.vm as unknown as {
      refresh: () => Promise<void>;
      grid: { magnets: unknown[] };
      closestIndex: number | null;
    };
    await state.refresh();
    expect(state.grid.magnets).toEqual([
      { x: 100, y: 20 },
      { x: 100, y: 60 },
      { x: 100, y: 100 },
      { x: 0, y: 0 }
    ]);
    wrapper.element.dispatchEvent(moveEvent(100, 58));
    await nextTick();
    expect(state.closestIndex).toBe(1);
    dnd.stopDrag(new Event('mouseup'));

    expect(onDrop).toHaveBeenCalledOnce();
    expect(source.notifyDrop).toHaveBeenCalledWith('copy', expect.any(Object));
    expect(onInsert).toHaveBeenCalledOnce();
    const insertion = onInsert.mock.calls[0]?.[0] as InsertEvent;
    expect(insertion).toBeInstanceOf(InsertEvent);
    expect(insertion).toMatchObject({
      type: 'widget',
      data: { id: 4, label: 'Four' },
      index: 1
    });
  });

  it('reorders an item dragged within the same list', async () => {
    const onReorder = vi.fn();
    const wrapper = mountList({ onReorder });
    layOut(wrapper);
    const sourceElement = wrapper.findAll('.item')[0].element as HTMLElement;
    const source = makeDragController(sourceElement);

    dnd.startDrag(source, new Event('mousedown'), 1, 20, 'widget', items[0]);
    await nextTick();
    wrapper.element.dispatchEvent(moveEvent(10, 100));
    await nextTick();
    expect(wrapper.classes()).toContain('reordering');
    expect(wrapper.find('.reordering-feedback').exists()).toBe(true);
    dnd.stopDrag(new Event('mouseup'));

    expect(onReorder).toHaveBeenCalledOnce();
    const reorder = onReorder.mock.calls[0]?.[0] as ReorderEvent;
    expect(reorder).toBeInstanceOf(ReorderEvent);
    expect(reorder).toMatchObject({ from: 0, to: 2 });
  });

  it('does not reorder a single-item list or emit unchanged positions', async () => {
    const onReorder = vi.fn();
    const single = [{ id: 1, label: 'One' }];
    const wrapper = mountList({ items: single, onReorder });
    setRect(wrapper.element, rect(0, 0, 200, 40));
    setRect(wrapper.get('.item').element, rect(0, 0, 200, 40));
    const source = makeDragController(wrapper.get('.item').element as HTMLElement);

    dnd.startDrag(source, new Event('mousedown'), 1, 1, 'widget', single[0]);
    wrapper.element.dispatchEvent(moveEvent(10, 20));
    dnd.stopDrag(new Event('mouseup'));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('renders the empty slot for an empty list', () => {
    const wrapper = mountList({ items: [] });
    expect(wrapper.get('.empty').text()).toBe('Nothing here');
  });

  it('uses source imagery unless a matching custom drag-image slot exists', async () => {
    const wrapper = mount(DropList, {
      props: { items, acceptsType: 'widget', noAnimations: true, column: true },
      slots: {
        item: ({ item }: { item: Item }) => h('div', { class: 'item', key: item.id }, item.label),
        feedback: () => h('div', { key: 'feedback' }),
        'drag-image': () => h('div', { class: 'list-preview' }, 'preview')
      }
    });
    layOut(wrapper);
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', items[0]);
    await nextTick();

    expect(wrapper.get('.list-preview').text()).toBe('preview');
  });
});
