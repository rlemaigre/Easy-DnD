import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDragImage } from '../../../lib/src/js/createDragImage';

describe('createDragImage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deep-clones content and applies drag-image positioning', () => {
    const source = document.createElement('article');
    source.className = 'source-card';
    source.style.width = '120px';
    source.innerHTML = '<img src="avatar.png" style="height: 40px"><strong>Alex</strong>';
    document.body.appendChild(source);

    const clone = createDragImage(source);

    expect(clone).not.toBe(source);
    expect(clone.outerHTML).toContain('Alex');
    expect(clone.querySelector('img')).not.toBe(source.querySelector('img'));
    expect(clone.style.position).toBe('fixed');
    expect(clone.style.margin).toBe('0px');
    expect(clone.style.zIndex).toBe('1000');
    expect(clone.style.pointerEvents).toBe('none');
    expect((clone.querySelector('img') as HTMLElement).style.pointerEvents).toBe('none');
  });

  it('copies bitmap contents from root and nested canvas elements', () => {
    const drawImage = vi.fn();
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
    const rootSource = document.createElement('canvas');
    const containerSource = document.createElement('article');
    const nestedSource = document.createElement('canvas');
    containerSource.appendChild(nestedSource);

    const rootClone = createDragImage(rootSource);
    const containerClone = createDragImage(containerSource);
    const nestedClone = containerClone.querySelector('canvas');

    expect(rootClone).toBeInstanceOf(HTMLCanvasElement);
    expect(nestedClone).toBeInstanceOf(HTMLCanvasElement);
    expect(getContext).toHaveBeenCalledTimes(2);
    expect(drawImage).toHaveBeenNthCalledWith(1, rootSource, 0, 0);
    expect(drawImage).toHaveBeenNthCalledWith(2, nestedSource, 0, 0);
  });

  it('does not fail when a cloned canvas cannot create a 2D context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(() => createDragImage(document.createElement('canvas'))).not.toThrow();
  });
});
