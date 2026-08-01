/**
 * This files contains the primitives required to create drag images from HTML elements that serve as models. A snapshot
 * of the computed styles of the model elements is taken when creating the drag image, so that it will look the same as
 * the model, no matter where the drag images is grafted into the DOM.
 */

/**
 * Creates a drag image using the given element as model.
 */
import type { DragImageElement } from '../types';

export function createDragImage (el: HTMLElement): DragImageElement {
  const clone = deepClone(el);
  clone.style.position = 'fixed';
  clone.style.margin = '0';
  clone.style.zIndex = '1000';
  clone.style.transition = 'opacity 0.2s';
  return clone;
}

/**
 * Clones the given element and all its descendants.
 */
function deepClone (el: HTMLElement): DragImageElement {
  const clone = el.cloneNode(true) as DragImageElement;
  copyStyle(el, clone);
  const vSrcElements = el.getElementsByTagName('*');
  const vDstElements = clone.getElementsByTagName('*');
  for (let i = vSrcElements.length; i--;) {
    const vSrcElement = vSrcElements[i];
    const vDstElement = vDstElements[i];
    copyStyle(vSrcElement, vDstElement);
  }
  return clone;
}

/**
 * Copy the computed styles from src to destination.
 */
function copyStyle (src: Element, destination: Element) {
  const styledDestination = destination as HTMLElement | SVGElement;
  const computedStyle = window.getComputedStyle(src);
  for (const key of computedStyle) {
    styledDestination.style.setProperty(
      key,
      computedStyle.getPropertyValue(key),
      computedStyle.getPropertyPriority(key)
    );
  }
  styledDestination.style.pointerEvents = 'none';
}
