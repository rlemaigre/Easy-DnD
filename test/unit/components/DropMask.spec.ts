import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DropMask from '../../../lib/src/components/DropMask.vue';
import { dnd } from '../../../lib/src/js/DnD';
import { makeDragController, makeDropController, moveEvent } from '../../helpers/dnd';

describe('DropMask component', () => {
  it('renders its tag and masks the active drop target', () => {
    const wrapper = mount(DropMask, {
      props: { tag: 'aside' },
      slots: { default: '<span>mask</span>' }
    });
    const target = makeDropController();
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', null);
    dnd.mouseMove(moveEvent(1, 1), target);

    wrapper.element.dispatchEvent(moveEvent(2, 2));

    expect(wrapper.element.tagName).toBe('ASIDE');
    expect(wrapper.text()).toBe('mask');
    expect(dnd.topController).toBeNull();
  });
});
