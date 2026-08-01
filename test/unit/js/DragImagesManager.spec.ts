import { describe, expect, it, vi } from 'vitest';
import { DragImagesManager } from '../../../lib/src/js/DragImagesManager';
import { dnd } from '../../../lib/src/js/DnD';
import type { DnDEventPayload, DragImageElement } from '../../../lib/src/types';
import { makeDragController, makeDropController, rect, setRect } from '../../helpers/dnd';

const freshManager = (): DragImagesManager => Object.assign(
  Object.create(DragImagesManager.prototype) as object,
  {
    selfTransform: null,
    clones: null,
    source: null,
    sourcePos: null,
    sourceClone: null
  }
) as DragImagesManager;

const payload = (overrides: Partial<DnDEventPayload> = {}): DnDEventPayload => ({
  type: 'widget',
  data: null,
  top: null,
  source: null,
  topController: null,
  sourceController: null,
  position: { x: 20, y: 30 },
  success: null,
  native: null,
  ...overrides
});

describe('DragImagesManager', () => {
  it('captures source geometry when a drag starts', () => {
    const element = document.createElement('div');
    setRect(element, rect(5, 8, 100, 40));
    const source = makeDragController(element);
    const manager = freshManager();

    manager.onDragStart(payload({ sourceController: source, position: { x: 20, y: 30 } }));

    expect(manager.source).toBe(source);
    expect(manager.sourcePos).toEqual({ x: 5, y: 8 });
    expect(manager.selfTransform).toBe('translate(-15px, -22px)');
    expect(manager.clones).toBeInstanceOf(Map);
  });

  it('switches between source and target imagery and reuses clones', () => {
    const sourceImage = document.createElement('div') as DragImageElement;
    sourceImage.__opacity = 0.6;
    const targetImage = document.createElement('div') as DragImageElement;
    targetImage.__opacity = 0.8;
    const source = makeDragController(undefined, { createDragImage: vi.fn(() => sourceImage) });
    const target = makeDropController({ createDragImage: vi.fn(() => targetImage) });
    const manager = freshManager();
    manager.source = source;
    manager.clones = new Map();

    expect(manager.switch(null)).toBe(sourceImage);
    expect(sourceImage.parentNode).toBe(document.body);
    expect(sourceImage.style.opacity).toBe('0.6');
    expect(manager.switch(target)).toBe(targetImage);
    expect(targetImage.parentNode).toBe(document.body);
    expect(targetImage.style.opacity).toBe('0.8');
    expect(target.createDragImage).toHaveBeenCalledOnce();
    manager.switch(target);
    expect(target.createDragImage).toHaveBeenCalledOnce();
  });

  it('uses source imagery when requested by a target', () => {
    const sourceImage = document.createElement('div') as DragImageElement;
    const manager = freshManager();
    manager.source = makeDragController(undefined, { createDragImage: () => sourceImage });
    manager.clones = new Map();
    const target = makeDropController({ createDragImage: () => 'source' });

    expect(manager.switch(target)).toBe(sourceImage);
    expect(manager.clones!.get(target)).toBe(sourceImage);
  });

  it('moves every created clone and removes them during cleanup', () => {
    const sourceImage = document.createElement('div') as DragImageElement;
    const targetImage = document.createElement('div') as DragImageElement;
    document.body.append(sourceImage, targetImage);
    const manager = freshManager();
    manager.sourceClone = sourceImage;
    manager.clones = new Map([[makeDropController(), targetImage]]);
    dnd.position = { x: 44, y: 55 };

    manager.onDragPositionChanged();
    expect(sourceImage.style.left).toBe('44px');
    expect(targetImage.style.top).toBe('55px');
    manager.cleanUp();

    expect(sourceImage.isConnected).toBe(false);
    expect(targetImage.isConnected).toBe(false);
    expect(manager.sourceClone).toBeNull();
    expect(manager.clones).toBeNull();
  });
});
