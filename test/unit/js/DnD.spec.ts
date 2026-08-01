import { describe, expect, it, vi } from 'vitest';
import { dnd } from '../../../lib/src/js/DnD';
import type { DnDEventPayload } from '../../../lib/src/types';
import {
  makeDragController,
  makeDropController,
  makeDropMaskController,
  moveEvent
} from '../../helpers/dnd';

describe('DnD state machine', () => {
  it('publishes a complete drag-start payload and initial top change', () => {
    const source = makeDragController();
    const start = vi.fn();
    const topChanged = vi.fn();
    dnd.on('dragstart', start);
    dnd.on('dragtopchanged', topChanged);

    const native = new MouseEvent('mousedown');
    dnd.startDrag(source, native, 11, 22, 'widget', { id: 1 });

    expect(dnd).toMatchObject({
      inProgress: true,
      sourceController: source,
      topController: null,
      position: { x: 11, y: 22 },
      type: 'widget',
      data: { id: 1 }
    });
    expect(start).toHaveBeenCalledWith(expect.objectContaining({
      sourceController: source,
      position: { x: 11, y: 22 },
      type: 'widget',
      native
    }));
    expect(topChanged).toHaveBeenCalledWith(expect.objectContaining({
      topController: null,
      previousTopController: null
    }));

    dnd.off('dragstart', start);
    dnd.off('dragtopchanged', topChanged);
  });

  it('selects candidates, reports movement, and clears the active target', () => {
    const source = makeDragController();
    const target = makeDropController();
    const topChanged = vi.fn();
    const positionChanged = vi.fn();
    dnd.on('dragtopchanged', topChanged);
    dnd.on('dragpositionchanged', positionChanged);
    dnd.startDrag(source, new Event('mousedown'), 0, 0, 'widget', null);

    const entering = moveEvent(10, 20);
    dnd.mouseMove(entering, target);
    expect(entering.defaultPrevented).toBe(false);
    expect(dnd.topController).toBe(target);
    expect(dnd.position).toEqual({ x: 10, y: 20 });
    expect(positionChanged).toHaveBeenLastCalledWith(expect.objectContaining({
      topController: target,
      position: { x: 10, y: 20 }
    }));

    dnd.clearTop(new Event('mouseleave'));
    expect(dnd.topController).toBeNull();
    expect(topChanged).toHaveBeenLastCalledWith(expect.objectContaining({
      previousTopController: target,
      topController: null
    }));

    dnd.off('dragtopchanged', topChanged);
    dnd.off('dragpositionchanged', positionChanged);
  });

  it('does not replace the current target with a rejected candidate', () => {
    const accepted = makeDropController();
    const rejected = makeDropController({ candidate: () => false });
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', null);
    dnd.mouseMove(moveEvent(1, 1), accepted);
    dnd.mouseMove(moveEvent(2, 2), rejected);

    expect(dnd.topController).toBe(accepted);
    expect(dnd.position).toEqual({ x: 1, y: 1 });
  });

  it('uses a drop mask to clear a target without selecting the mask', () => {
    const target = makeDropController();
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', null);
    dnd.mouseMove(moveEvent(1, 1), target);

    const masked = moveEvent(2, 2);
    const stop = vi.spyOn(masked, 'stopPropagation');
    dnd.mouseMove(masked, makeDropMaskController());

    expect(dnd.topController).toBeNull();
    expect(stop).toHaveBeenCalledOnce();
  });

  it.each([
    { compatible: true, allowed: true, success: true },
    { compatible: false, allowed: true, success: false },
    { compatible: true, allowed: false, success: false }
  ])('calculates drop success from compatibility and permission: $success', ({ compatible, allowed, success }) => {
    const target = makeDropController({
      getCompatibleMode: () => compatible,
      getDropAllowed: () => allowed
    });
    const dropped = vi.fn();
    const ended = vi.fn();
    dnd.on('drop', dropped);
    dnd.on('dragend', ended);
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', null);
    dnd.mouseMove(moveEvent(1, 1), target);

    dnd.stopDrag(new MouseEvent('mouseup'));

    const payload = ended.mock.calls[0]?.[0] as DnDEventPayload;
    expect(payload.success).toBe(success);
    expect(payload.topController).toBe(target);
    expect(dropped).toHaveBeenCalledOnce();
    expect(dnd.inProgress).toBe(false);
    dnd.off('drop', dropped);
    dnd.off('dragend', ended);
  });

  it('cancels an active drag with an unsuccessful end event', () => {
    const ended = vi.fn();
    dnd.on('dragend', ended);
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 7, { id: 7 });

    dnd.cancelDrag(new KeyboardEvent('keyup', { key: 'Escape' }));

    expect(ended).toHaveBeenCalledWith(expect.objectContaining({ success: false, type: 7 }));
    expect(dnd).toMatchObject({ inProgress: false, sourceController: null, position: null });
    dnd.off('dragend', ended);
  });

  it('always resets state when an event subscriber throws', () => {
    const failure = () => {
      throw new Error('subscriber failed');
    };
    dnd.on('dragend', failure);
    dnd.startDrag(makeDragController(), new Event('mousedown'), 0, 0, 'widget', null);

    expect(() => dnd.cancelDrag(new Event('cancel'))).toThrow('subscriber failed');
    expect(dnd).toMatchObject({ inProgress: false, sourceController: null, position: null });
    dnd.off('dragend', failure);
  });

  it('keeps wildcard event-bus subscriptions compatible', () => {
    const wildcard = vi.fn();
    dnd.eventBus.on('*', wildcard);
    dnd.startDrag(makeDragController(), new Event('mousedown'), 1, 2, 'widget', null);

    expect(wildcard).toHaveBeenCalledWith('dragstart', expect.objectContaining({ type: 'widget' }));
    dnd.eventBus.off('*', wildcard);
  });
});
