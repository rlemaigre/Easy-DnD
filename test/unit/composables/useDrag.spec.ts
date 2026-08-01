import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useDrag, type DragProps } from '../../../lib/src/composables/useDrag';
import { dnd } from '../../../lib/src/js/DnD';

type DragApi = ReturnType<typeof useDrag>;

const defaultProps: DragProps = {
  type: 'widget',
  data: { id: 1 },
  dragImageOpacity: 0.7,
  disabled: false,
  goBack: false,
  handle: null,
  delta: 0,
  delay: 0,
  dragClass: null,
  vibration: 0,
  scrollingEdgeSize: 0
};

const mountHarness = (overrides: Partial<DragProps> = {}, withDragImage = false) => {
  const props = { ...defaultProps, ...overrides };
  const emitted = vi.fn();
  let api: DragApi | undefined;
  const wrapper = mount(defineComponent({
    setup () {
      const rootElement = ref<HTMLElement | null>(null);
      const dragImageElement = ref<HTMLElement | null>(null);
      api = useDrag(props, emitted, {
        rootElement,
        dragImageElement,
        hasDragImage: () => withDragImage
      });
      return { rootElement, dragImageElement };
    },
    template: `<div ref="rootElement" class="source">
      <button class="handle"><img class="image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="></button>
      <span class="content">content</span>
      <div v-if="${withDragImage}" ref="dragImageElement"><strong class="preview">preview</strong></div>
    </div>`
  }), { attachTo: document.body });

  return { wrapper, emitted, getApi: () => api! };
};

const down = (element: Element, options: MouseEventInit = {}) => element.dispatchEvent(new MouseEvent('mousedown', {
  bubbles: true,
  cancelable: true,
  buttons: 1,
  clientX: 5,
  clientY: 5,
  ...options
}));

const movement = (element: Element, x: number, y: number) => {
  const event = new MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y
  });
  Object.defineProperty(event, 'target', { configurable: true, value: element });
  return event;
};

describe('useDrag', () => {
  it('starts after movement exceeds delta and emits lifecycle events', async () => {
    const { wrapper, emitted, getApi } = mountHarness({ delta: 4 });
    down(wrapper.get('.content').element);

    getApi().onMouseMove(movement(wrapper.get('.content').element, 8, 5));
    expect(dnd.inProgress).toBe(false);

    getApi().onMouseMove(movement(wrapper.get('.content').element, 10, 5));
    expect(dnd.inProgress).toBe(true);
    expect(document.documentElement.classList.contains('drag-in-progress')).toBe(true);
    expect(emitted).toHaveBeenCalledWith('dragstart', expect.objectContaining({
      type: 'widget',
      data: { id: 1 }
    }));

    getApi().onMouseUp(new MouseEvent('mouseup'));
    await vi.waitFor(() => expect(dnd.inProgress).toBe(false));
    expect(emitted).toHaveBeenCalledWith('dragend', expect.objectContaining({ success: false }));
    expect(document.documentElement.classList.contains('drag-in-progress')).toBe(false);
  });

  it('does not initialise when disabled, using the wrong button, or on dnd-no-drag content', () => {
    const disabled = mountHarness({ disabled: true });
    down(disabled.wrapper.get('.content').element);
    expect(disabled.getApi().downEvent.value).toBeNull();

    const enabled = mountHarness();
    down(enabled.wrapper.get('.content').element, { buttons: 2 });
    expect(enabled.getApi().downEvent.value).toBeNull();
    enabled.wrapper.get('.content').element.classList.add('dnd-no-drag');
    down(enabled.wrapper.get('.content').element);
    expect(enabled.getApi().downEvent.value).toBeNull();
  });

  it('only initialises from the configured handle or its children', () => {
    const { wrapper, getApi } = mountHarness({ handle: '.handle' });

    down(wrapper.get('.content').element);
    expect(getApi().downEvent.value).toBeNull();

    down(wrapper.get('.image').element);
    expect(getApi().downEvent.value).toBeInstanceOf(MouseEvent);
  });

  it('waits for the delay and performs optional vibration', () => {
    vi.useFakeTimers();
    const vibrate = vi.fn();
    Object.defineProperty(window.navigator, 'vibrate', { configurable: true, value: vibrate });
    const { wrapper, getApi } = mountHarness({ delay: 80, vibration: 25 });
    down(wrapper.get('.content').element);

    expect(getApi().dragInitialised.value).toBe(false);
    vi.advanceTimersByTime(79);
    expect(getApi().dragInitialised.value).toBe(false);
    vi.advanceTimersByTime(1);
    expect(getApi().dragInitialised.value).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(25);
    vi.useRealTimers();
  });

  it('prevents the browser native image drag after pointer down', () => {
    const { wrapper } = mountHarness();
    const image = wrapper.get('.image').element;
    down(image);

    const nativeDrag = new Event('dragstart', { bubbles: true, cancelable: true });
    image.dispatchEvent(nativeDrag);

    expect(nativeDrag.defaultPrevented).toBe(true);
  });

  it('creates a styled clone from either the source or custom preview', async () => {
    const sourceHarness = mountHarness({ dragClass: 'custom-ghost', dragImageOpacity: 0.35 });
    const sourceImage = sourceHarness.getApi().createDragImage('translate(-2px, -3px)');
    expect(sourceImage).not.toBe(sourceHarness.wrapper.element);
    expect(sourceImage.classList.contains('dnd-ghost')).toBe(true);
    expect(sourceImage.classList.contains('custom-ghost')).toBe(true);
    expect(sourceImage.style.transform).toBe('translate(-2px, -3px)');
    expect(sourceImage.__opacity).toBe(0.35);

    const previewHarness = mountHarness({}, true);
    await nextTick();
    const previewImage = previewHarness.getApi().createDragImage(null);
    expect(previewImage.classList.contains('preview')).toBe(true);
    expect(previewImage.classList.contains('dnd-ghost')).toBe(true);
    expect(previewImage.textContent).toBe('preview');
  });

  it('cancels on Escape and restores selection state', async () => {
    const { wrapper, getApi } = mountHarness();
    document.documentElement.style.userSelect = 'text';
    down(wrapper.get('.content').element);
    getApi().onMouseMove(movement(wrapper.get('.content').element, 10, 10));
    expect(dnd.inProgress).toBe(true);

    getApi().onKeyUp(new KeyboardEvent('keyup', { key: 'Escape' }));
    await vi.waitFor(() => expect(dnd.inProgress).toBe(false));
    expect(document.documentElement.style.userSelect).toBe('text');
  });

  it('cancels its own active drag when unmounted', async () => {
    const { wrapper, getApi } = mountHarness();
    down(wrapper.get('.content').element);
    getApi().onMouseMove(movement(wrapper.get('.content').element, 10, 10));
    expect(dnd.inProgress).toBe(true);

    wrapper.unmount();
    await nextTick();
    expect(dnd.inProgress).toBe(false);
  });
});
