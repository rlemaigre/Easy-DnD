import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import { useDrop, type DropOptions, type DropProps } from '../../../lib/src/composables/useDrop';
import { dnd } from '../../../lib/src/js/DnD';
import type { DragType } from '../../../lib/src/types';
import { makeDragController, moveEvent } from '../../helpers/dnd';

type DropApi = ReturnType<typeof useDrop>;

const mountHarness = (
  overrides: Partial<DropProps> = {},
  optionOverrides: Partial<DropOptions> = {},
  withDragImage = false
) => {
  const props: DropProps = {
    acceptsType: null,
    acceptsData: () => true,
    mode: 'copy',
    dragImageOpacity: 0.7,
    ...overrides
  };
  const emitted = vi.fn();
  let api: DropApi | undefined;
  const wrapper = mount(defineComponent({
    setup () {
      const rootElement = ref<HTMLElement | null>(null);
      const dragImageElement = ref<HTMLElement | null>(null);
      api = useDrop(props, emitted, {
        rootElement,
        dragImageElement,
        ...optionOverrides
      });
      return { rootElement, dragImageElement };
    },
    template: `<div ref="rootElement" class="target">
      <div v-if="${withDragImage}" ref="dragImageElement"><span class="preview">preview</span></div>
    </div>`
  }), { attachTo: document.body });
  return { wrapper, emitted, getApi: () => api! };
};

describe('useDrop', () => {
  it.each([
    { acceptsType: null, accepted: ['anything', 1] },
    { acceptsType: 'widget', accepted: ['widget'] },
    { acceptsType: ['widget', 2], accepted: ['widget', 2] },
    { acceptsType: (type: DragType) => type === 'chart', accepted: ['chart'] }
  ])('supports acceptsType forms', ({ acceptsType, accepted }) => {
    const { getApi } = mountHarness({ acceptsType });
    for (const type of accepted) expect(getApi().effectiveAcceptsType(type)).toBe(true);
    expect(getApi().effectiveAcceptsType('not-accepted')).toBe(acceptsType === null);
  });

  it('combines type and data acceptance into drop permission and CSS state', async () => {
    const acceptsData = vi.fn((data: unknown) => data === 'valid');
    const { wrapper, getApi } = mountHarness({ acceptsType: 'widget', acceptsData });
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', 'invalid');
    wrapper.element.dispatchEvent(moveEvent(5, 5));
    await nextTick();

    expect(getApi().dropIn.value).toBe(true);
    expect(getApi().typeAllowed.value).toBe(true);
    expect(getApi().dropAllowed.value).toBe(false);
    expect(getApi().cssClasses.value).toMatchObject({
      'drop-in': true,
      'type-allowed': true,
      'drop-forbidden': true
    });
    expect(acceptsData).toHaveBeenCalledWith('invalid', 'widget');
  });

  it('lets candidate and drop-allowed options override defaults', () => {
    const candidate = vi.fn(() => false);
    const getDropAllowed = vi.fn(() => false);
    const source = makeDragController();
    const { getApi } = mountHarness({}, { candidate, getDropAllowed });

    expect(getApi().candidate('widget', { id: 1 }, source)).toBe(false);
    expect(candidate).toHaveBeenCalledWith('widget', { id: 1 }, source);
    expect(getApi().dropAllowed.value).toBe(false);
    expect(getDropAllowed).toHaveBeenCalled();
  });

  it('emits enter, over, leave, dragend, drop, and source mode notifications', async () => {
    const source = makeDragController();
    const { wrapper, emitted } = mountHarness({ acceptsType: 'widget', mode: 'cut' });
    dnd.startDrag(source, new Event('mousedown'), 0, 0, 'widget', { id: 1 });
    wrapper.element.dispatchEvent(moveEvent(10, 10));
    wrapper.element.dispatchEvent(moveEvent(11, 11));
    await nextTick();

    expect(emitted).toHaveBeenCalledWith('dragenter', expect.any(Object));
    expect(emitted).toHaveBeenCalledWith('dragover', expect.any(Object));
    dnd.stopDrag(new Event('mouseup'));
    expect(emitted).toHaveBeenCalledWith('drop', expect.objectContaining({ success: true }));
    expect(emitted).toHaveBeenCalledWith('dragend', expect.objectContaining({ success: true }));
    expect(source.notifyDrop).toHaveBeenCalledWith('cut', expect.objectContaining({ success: true }));

    dnd.startDrag(source, new Event('mousedown'), 0, 0, 'widget', null);
    wrapper.element.dispatchEvent(moveEvent(12, 12));
    dnd.clearTop();
    expect(emitted).toHaveBeenCalledWith('dragleave', expect.any(Object));
  });

  it('does not emit a drop when acceptance fails', () => {
    const { wrapper, emitted } = mountHarness({ acceptsType: 'widget' });
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'chart', null);
    wrapper.element.dispatchEvent(moveEvent(1, 1));
    dnd.stopDrag(new Event('mouseup'));

    expect(emitted).not.toHaveBeenCalledWith('drop', expect.anything());
  });

  it('creates a custom drag image and falls back to the source otherwise', async () => {
    const fallback = mountHarness();
    expect(fallback.getApi().createDragImage()).toBe('source');

    const preview = mountHarness({ dragImageOpacity: 0.4 }, {}, true);
    await nextTick();
    const image = preview.getApi().createDragImage();
    expect(image).toBeInstanceOf(HTMLElement);
    if (image instanceof HTMLElement) {
      expect(image.classList.contains('preview')).toBe(true);
      expect(image.classList.contains('dnd-ghost')).toBe(true);
      expect(image.__opacity).toBe(0.4);
    }
  });

  it('clears itself as top target when unmounted', () => {
    const { wrapper, getApi } = mountHarness();
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', null);
    wrapper.element.dispatchEvent(moveEvent(1, 1));
    expect(dnd.topController).toBe(getApi().controller);

    wrapper.unmount();
    expect(dnd.topController).toBeNull();
  });
});
