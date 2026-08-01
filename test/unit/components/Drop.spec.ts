import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import Drop from '../../../lib/src/components/Drop.vue';
import { dnd } from '../../../lib/src/js/DnD';
import { makeDragController, moveEvent } from '../../helpers/dnd';

describe('Drop component', () => {
  it('renders a custom tag and reacts to compatible drags', async () => {
    const onDragenter = vi.fn();
    const onDrop = vi.fn();
    const source = makeDragController();
    const wrapper = mount(Drop, {
      attachTo: document.body,
      props: {
        tag: 'section',
        acceptsType: 'widget',
        mode: 'copy',
        onDragenter,
        onDrop
      },
      slots: { default: 'Drop here' }
    });

    dnd.startDrag(source, new Event('mousedown'), 0, 0, 'widget', { id: 1 });
    wrapper.element.dispatchEvent(moveEvent(10, 10));
    await nextTick();

    expect(wrapper.element.tagName).toBe('SECTION');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['drop-in', 'type-allowed', 'drop-allowed']));
    expect(onDragenter).toHaveBeenCalledOnce();
    dnd.stopDrag(new Event('mouseup'));
    expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ data: { id: 1 }, success: true }));
    expect(source.notifyDrop).toHaveBeenCalledWith('copy', expect.any(Object));
  });

  it('shows forbidden state and refuses an incompatible type', async () => {
    const onDrop = vi.fn();
    const wrapper = mount(Drop, {
      props: { acceptsType: 'widget', onDrop },
      slots: { default: 'Drop here' }
    });
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'chart', null);
    wrapper.element.dispatchEvent(moveEvent(5, 5));
    await nextTick();

    expect(dnd.topController).toBeNull();
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['type-forbidden']));
    dnd.stopDrag(new Event('mouseup'));
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('renders custom target drag imagery only for accepted drag types', async () => {
    const wrapper = mount(Drop, {
      props: { acceptsType: 'widget' },
      slots: {
        default: 'Drop here',
        'drag-image': '<span class="target-preview">target preview</span>'
      }
    });
    expect(wrapper.find('.target-preview').exists()).toBe(false);

    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', { id: 1 });
    await nextTick();
    expect(wrapper.get('.target-preview').text()).toBe('target preview');
  });
});
