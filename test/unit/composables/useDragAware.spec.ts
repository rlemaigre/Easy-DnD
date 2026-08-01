import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, expect, it } from 'vitest';
import { useDragAware } from '../../../lib/src/composables/useDragAware';
import { dnd } from '../../../lib/src/js/DnD';
import { makeDragController, makeDropController, moveEvent } from '../../helpers/dnd';

describe('useDragAware', () => {
  it('exposes reactive public drag state', () => {
    let aware: ReturnType<typeof useDragAware> | undefined;
    mount(defineComponent({
      setup () {
        aware = useDragAware();
        return {};
      },
      template: '<div />'
    }));
    const source = makeDragController(undefined, { component: { name: 'source' } });
    const target = makeDropController({ component: { name: 'target' } });

    expect(aware!.dragInProgress.value).toBe(false);
    dnd.startDrag(source, new Event('mousedown'), 3, 4, 'widget', { id: 1 });
    dnd.mouseMove(moveEvent(9, 10), target);

    expect(aware!.dragInProgress.value).toBe(true);
    expect(aware!.dragType.value).toBe('widget');
    expect(aware!.dragData.value).toEqual({ id: 1 });
    expect(aware!.dragPosition.value).toEqual({ x: 9, y: 10 });
    expect(aware!.dragTop.value).toEqual({ name: 'target' });
  });
});
