/**
 * This files contains the primitives required to create drag images from HTML elements that serve as models. A snapshot
 * of the computed styles of the model elements is taken when creating the drag image, so that it will look the same as
 * the model, no matter where the drag images is grafted into the DOM.
 */
/**
 * Creates a drag image using the given element as model.
 */
export declare function createDragImage(el: HTMLElement): HTMLElement;
