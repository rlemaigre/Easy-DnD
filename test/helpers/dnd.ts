import { vi } from 'vitest';
import type {
  DragController,
  DragImageElement,
  DropController,
  DropMaskController
} from '../../lib/src/types';

export const makeElement = (className?: string): HTMLElement => {
  const element = document.createElement('div');
  if (className) element.className = className;
  return element;
};

export const makeDragController = (
  element = makeElement(),
  overrides: Partial<DragController> = {}
): DragController => ({
  component: null,
  getElement: () => element,
  getGoBack: () => false,
  createDragImage: () => element.cloneNode(true) as DragImageElement,
  notifyDrop: vi.fn(),
  ...overrides
});

export const makeDropController = (
  overrides: Partial<DropController> = {}
): DropController => ({
  component: null,
  isDropMask: false,
  getElement: () => makeElement(),
  getMode: () => 'copy',
  getScrollingEdgeSize: () => 100,
  getCompatibleMode: () => true,
  getDropAllowed: () => true,
  getReordering: () => false,
  candidate: () => true,
  createDragImage: () => makeElement() as DragImageElement,
  ...overrides
});

export const makeDropMaskController = (
  overrides: Partial<DropMaskController> = {}
): DropMaskController => ({
  component: null,
  isDropMask: true,
  getElement: () => makeElement(),
  ...overrides
});

export const moveEvent = (x: number, y: number) => new CustomEvent('easy-dnd-move', {
  bubbles: true,
  cancelable: true,
  detail: { x, y, native: new MouseEvent('mousemove', { clientX: x, clientY: y }) }
});

export const rect = (left: number, top: number, width: number, height: number): DOMRect => ({
  x: left,
  y: top,
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  toJSON: () => ({})
});

export const setRect = (element: Element, dimensions: DOMRect) => {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => dimensions
  });
};
