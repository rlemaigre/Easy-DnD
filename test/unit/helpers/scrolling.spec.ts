import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cancelScrollAction,
  isContainerReadyToEdgeScroll,
  performEdgeScroll
} from '../../../lib/src/helpers/edgescroller';
import scrollparent from '../../../lib/src/helpers/scrollparent';
import { rect, setRect } from '../../helpers/dnd';

const setDimension = (element: HTMLElement, key: string, value: number) => {
  Object.defineProperty(element, key, { configurable: true, value });
};

afterEach(() => cancelScrollAction());

describe('scrollparent', () => {
  it('finds the nearest scrollable ancestor and otherwise returns body', () => {
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    const child = document.createElement('span');
    outer.style.overflow = 'auto';
    outer.appendChild(inner);
    inner.appendChild(child);
    document.body.appendChild(outer);

    expect(scrollparent(child)).toBe(outer);
    expect(scrollparent(document.createElement('div'))).toBe(document.body);
    expect(scrollparent(null)).toBe(document.body);
  });

  it('crosses a shadow root to find a scrollable host', () => {
    const host = document.createElement('div');
    host.style.overflow = 'auto';
    const shadow = host.attachShadow({ mode: 'open' });
    const child = document.createElement('span');
    shadow.appendChild(child);
    document.body.appendChild(host);

    expect(scrollparent(child)).toBe(host);
    host.remove();
  });
});

describe('edge scrolling', () => {
  const makeScrollable = () => {
    const element = document.createElement('div');
    setRect(element, rect(0, 0, 100, 100));
    setDimension(element, 'clientWidth', 100);
    setDimension(element, 'clientHeight', 100);
    setDimension(element, 'offsetWidth', 100);
    setDimension(element, 'offsetHeight', 100);
    setDimension(element, 'scrollWidth', 300);
    setDimension(element, 'scrollHeight', 300);
    element.scrollLeft = 0;
    element.scrollTop = 0;
    const scrollTo = vi.fn((x: number, y: number) => {
      element.scrollLeft = x;
      element.scrollTop = y;
    });
    Object.defineProperty(element, 'scrollTo', { configurable: true, value: scrollTo });
    return { element, scrollTo };
  };

  it('only reports ready at an edge with remaining scroll space', () => {
    const { element } = makeScrollable();
    expect(isContainerReadyToEdgeScroll(element, 50, 50, 20)).toBe(false);
    expect(isContainerReadyToEdgeScroll(element, 95, 95, 20)).toBe(true);
    expect(isContainerReadyToEdgeScroll(element, 5, 5, 20)).toBe(false);
    element.scrollLeft = 10;
    element.scrollTop = 10;
    expect(isContainerReadyToEdgeScroll(element, 5, 5, 20)).toBe(true);
  });

  it('scrolls toward the active edge and can cancel its timer', () => {
    vi.useFakeTimers();
    const { element, scrollTo } = makeScrollable();

    expect(performEdgeScroll(element, 95, 95, 20)).toBe(true);
    expect(scrollTo).toHaveBeenCalled();
    expect(element.scrollLeft).toBeGreaterThan(0);
    expect(element.scrollTop).toBeGreaterThan(0);
    cancelScrollAction();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('uses a configurable maximum scroll step', () => {
    vi.useFakeTimers();
    const { element } = makeScrollable();

    expect(performEdgeScroll(element, 95, 95, 20, 10)).toBe(true);
    expect(element.scrollLeft).toBe(7.5);
    expect(element.scrollTop).toBe(7.5);
    cancelScrollAction();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns false when edge scrolling is disabled', () => {
    expect(performEdgeScroll(makeScrollable().element, 95, 95, 0)).toBe(false);
  });

  it('returns false when the active edge has no remaining scroll space', () => {
    expect(performEdgeScroll(makeScrollable().element, 5, 5, 20)).toBe(false);
  });
});
