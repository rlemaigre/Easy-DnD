import { describe, expect, it } from 'vitest';
import { createDragImage } from '../../../lib/src/js/createDragImage';

describe('createDragImage', () => {
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
});
