import { describe, expect, it } from 'vitest';
import Grid from '../../../lib/src/js/Grid';
import { rect, setRect } from '../../helpers/dnd';

const makeList = (...dimensions: DOMRect[]) => {
  const root = document.createElement('div');
  dimensions.forEach((dimensions) => {
    const child = document.createElement('div');
    setRect(child, dimensions);
    root.appendChild(child);
  });
  setRect(root, rect(0, 0, 500, 500));
  document.body.appendChild(root);
  return root;
};

describe('Grid', () => {
  it('creates centre magnets and returns the nearest item', () => {
    const root = makeList(rect(0, 0, 100, 80), rect(120, 0, 100, 80));
    const grid = new Grid(root.children, 1, 'auto', null);

    expect(grid.magnets).toEqual([{ x: 50, y: 40 }, { x: 170, y: 40 }]);
    expect(grid.closestIndex({ x: 10, y: 40 })).toBe(0);
    expect(grid.closestIndex({ x: 200, y: 40 })).toBe(1);
  });

  it('places nested-list magnets before items according to orientation', () => {
    const root = makeList(rect(10, 20, 100, 80), rect(120, 20, 100, 80));
    root.children[0].classList.add('dnd-drop');

    expect(new Grid(root.children, 1, 'row', null).magnets).toEqual([
      { x: 10, y: 60 },
      { x: 170, y: 60 }
    ]);
    expect(new Grid(root.children, 1, 'column', null).magnets[0]).toEqual({ x: 60, y: 20 });
  });

  it('places reorder magnets before or after nested items', () => {
    const root = makeList(rect(0, 0, 100, 40), rect(0, 40, 100, 40), rect(0, 80, 100, 40));
    for (const child of root.children) child.classList.add('dnd-drop');

    const down = new Grid(root.children, 2, 'column', 0);
    expect(down.magnets).toEqual([
      { x: 50, y: 0 },
      { x: 50, y: 80 },
      { x: 50, y: 120 }
    ]);

    const up = new Grid(root.children, 2, 'column', 2);
    expect(up.magnets).toEqual([
      { x: 50, y: 0 },
      { x: 50, y: 40 },
      { x: 50, y: 80 }
    ]);
  });

  it('requires an explicit direction for nested drop lists', () => {
    const root = makeList(rect(0, 0, 100, 80));
    root.children[0].classList.add('dnd-drop');

    expect(() => new Grid(root.children, 0, 'auto', null)).toThrow('missing one of these attributes');
  });

  it('rejects collections without an HTML parent', () => {
    const orphan = document.createElement('div');
    expect(() => new Grid(orphan.children, 0, 'auto', null)).toThrow(TypeError);
  });

  it('corrects magnets when the container moves or scrolls', () => {
    const root = makeList(rect(0, 0, 100, 100));
    let currentRect = rect(20, 30, 500, 500);
    Object.defineProperty(root, 'getBoundingClientRect', {
      configurable: true,
      value: () => currentRect
    });
    root.scrollLeft = 5;
    root.scrollTop = 10;
    const grid = new Grid(root.children, 0, 'auto', null);

    currentRect = rect(35, 55, 500, 500);
    root.scrollLeft = 8;
    root.scrollTop = 16;

    expect(grid.correction()).toEqual({ x: 12, y: 19 });
  });
});
