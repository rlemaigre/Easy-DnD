import { describe, expect, it } from 'vitest';
import { DnDEvent, InsertEvent, ReorderEvent } from '../../../lib/src/js/events';

describe('public event classes', () => {
  it('initialises DnDEvent with stable empty values', () => {
    expect(new DnDEvent()).toEqual({
      type: null,
      data: null,
      top: null,
      previousTop: null,
      source: null,
      position: null,
      success: null,
      native: null
    });
  });

  it('stores insert metadata', () => {
    expect(new InsertEvent('widget', { id: 3 }, 2)).toEqual({
      type: 'widget',
      data: { id: 3 },
      index: 2
    });
  });

  it.each([
    { from: 0, to: 2, expected: ['b', 'c', 'a'] },
    { from: 2, to: 0, expected: ['c', 'a', 'b'] },
    { from: 1, to: 1, expected: ['a', 'b', 'c'] }
  ])('applies a reorder from $from to $to', ({ from, to, expected }) => {
    const values = ['a', 'b', 'c'];
    const event = new ReorderEvent(from, to);
    event.apply(values);

    expect(values).toEqual(expected);
    expect(event).toMatchObject({ from, to });
  });

  it('keeps locked positions fixed while movable items cross them', () => {
    const values = ['a', 'b', 'locked', 'c', 'd'];
    const event = new ReorderEvent(0, 4, [2]);

    event.apply(values);

    expect(values).toEqual(['b', 'c', 'locked', 'd', 'a']);
    expect(event.locked).toEqual([2]);

    new ReorderEvent(4, 0, [2]).apply(values);
    expect(values).toEqual(['a', 'b', 'locked', 'c', 'd']);
  });
});
