import { mount } from '@vue/test-utils';
import { defineComponent, h, markRaw, nextTick } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import Drag from '../../../lib/src/components/Drag.vue';
import { dnd } from '../../../lib/src/js/DnD';

const beginDrag = async (element: Element) => {
  element.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true,
    buttons: 1,
    clientX: 2,
    clientY: 2
  }));
  await new Promise(resolve => setTimeout(resolve, 0));
  element.dispatchEvent(new MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    clientX: 10,
    clientY: 2
  }));
  await nextTick();
};

describe('Drag component', () => {
  it('renders its configured tag and public class states', () => {
    const wrapper = mount(Drag, {
      props: { tag: 'article', type: 'widget', data: { id: 1 } },
      slots: { default: '<span>Drag me</span>' }
    });

    expect(wrapper.element.tagName).toBe('ARTICLE');
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['dnd-drag', 'drag-no-handle']));
    expect(wrapper.text()).toContain('Drag me');
  });

  it('emits start and end through a real pointer lifecycle', async () => {
    const onDragstart = vi.fn();
    const onDragend = vi.fn();
    const wrapper = mount(Drag, {
      attachTo: document.body,
      props: {
        type: 'widget',
        data: { id: 1 },
        delta: 0,
        onDragstart,
        onDragend
      },
      slots: { default: '<span class="content">Drag me</span>' }
    });

    await beginDrag(wrapper.get('.content').element);
    expect(dnd.inProgress).toBe(true);
    expect(wrapper.classes()).toContain('drag-source');
    expect(onDragstart).toHaveBeenCalledWith(expect.objectContaining({ type: 'widget' }));

    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await vi.waitFor(() => expect(dnd.inProgress).toBe(false));
    expect(onDragend).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('does not start when disabled', async () => {
    const wrapper = mount(Drag, {
      props: { type: 'widget', disabled: true },
      slots: { default: '<span>Disabled</span>' }
    });
    await beginDrag(wrapper.element);

    expect(dnd.inProgress).toBe(false);
    expect(wrapper.classes()).toEqual(['dnd-drag']);
  });

  it('mounts the custom preview only while a drag is initialised', async () => {
    const wrapper = mount(Drag, {
      props: { type: 'widget', delay: 25 },
      slots: {
        default: 'source',
        'drag-image': '<span class="preview">preview</span>'
      }
    });
    expect(wrapper.find('.__drag-image').exists()).toBe(false);

    wrapper.element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, buttons: 1 }));
    await vi.waitFor(() => expect(wrapper.find('.__drag-image').exists()).toBe(true));
    expect(wrapper.get('.preview').text()).toBe('preview');
  });

  it('forwards non-reserved slots to a component tag', () => {
    const CustomTag = markRaw(defineComponent({
      template: '<section><slot /><slot name="badge" label="new" /></section>'
    }));
    const wrapper = mount(Drag, {
      props: { tag: CustomTag, type: 'widget' },
      slots: {
        default: 'body',
        badge: ({ label }: { label: string }) => h('b', { class: 'badge' }, label)
      }
    });

    expect(wrapper.text()).toContain('body');
    expect(wrapper.get('.badge').text()).toBe('new');
  });

  it('rebinds drag listeners when its root tag changes', async () => {
    const wrapper = mount(Drag, {
      attachTo: document.body,
      props: { tag: 'div', type: 'widget' },
      slots: { default: '<span class="content">Drag me</span>' }
    });

    await wrapper.setProps({ tag: 'section' });
    await beginDrag(wrapper.get('.content').element);
    expect(wrapper.element.tagName).toBe('SECTION');
    expect(dnd.inProgress).toBe(true);
    document.dispatchEvent(new MouseEvent('mouseup'));
    await vi.waitFor(() => expect(dnd.inProgress).toBe(false));
  });
});
