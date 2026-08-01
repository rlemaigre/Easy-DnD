import { nextTick } from 'vue';
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
    sourceClone: null,
    activeClone: null,
    activeTarget: undefined,
    generation: 0,
    refreshRequest: 0,
    fadingClone: null,
    fadeTimer: undefined,
    goBackTimer: undefined,
    handlers: {}
  }
) as unknown as DragImagesManager;

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

  it('bounds retained target imagery to the active and fading clones', () => {
    vi.useFakeTimers();
    const firstImage = document.createElement('div') as DragImageElement;
    const secondImage = document.createElement('div') as DragImageElement;
    const manager = freshManager();
    manager.source = makeDragController();
    manager.clones = new Map();

    manager.switch(makeDropController({ createDragImage: () => firstImage }));
    manager.switch(makeDropController({ createDragImage: () => secondImage }));
    expect(firstImage.isConnected).toBe(true);
    expect(secondImage.isConnected).toBe(true);
    expect(manager.clones.size).toBe(1);

    vi.advanceTimersByTime(220);
    expect(firstImage.isConnected).toBe(false);
    expect(secondImage.isConnected).toBe(true);
    manager.cleanUp();
    vi.useRealTimers();
  });

  it('uses a timeout fallback to clean up go-back imagery', async () => {
    vi.useFakeTimers();
    const image = document.createElement('div') as DragImageElement;
    const manager = freshManager();
    manager.source = makeDragController(undefined, {
      getGoBack: () => true,
      createDragImage: () => image
    });
    manager.sourcePos = { x: 5, y: 8 };
    manager.clones = new Map();
    const frame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);
      return 1;
    });

    manager.onDragEnd(payload({ success: false }));
    await nextTick();
    expect(image.isConnected).toBe(true);
    vi.advanceTimersByTime(600);
    expect(image.isConnected).toBe(false);
    expect(manager.source).toBeNull();

    frame.mockRestore();
    vi.useRealTimers();
  });

  it('moves only the active clone and removes every clone during cleanup', () => {
    const sourceImage = document.createElement('div') as DragImageElement;
    const targetImage = document.createElement('div') as DragImageElement;
    document.body.append(sourceImage, targetImage);
    const manager = freshManager();
    manager.sourceClone = sourceImage;
    manager.clones = new Map([[makeDropController(), targetImage]]);
    manager.activeClone = targetImage;
    dnd.position = { x: 44, y: 55 };

    manager.onDragPositionChanged();
    expect(sourceImage.style.left).toBe('');
    expect(targetImage.style.top).toBe('55px');
    manager.cleanUp();

    expect(sourceImage.isConnected).toBe(false);
    expect(targetImage.isConnected).toBe(false);
    expect(manager.sourceClone).toBeNull();
    expect(manager.clones).toBeNull();
  });

  it('rebuilds a source drag image after its reactive model changes', async () => {
    let label = 'compact';
    const source = makeDragController(undefined, {
      createDragImage: () => {
        const image = document.createElement('div') as DragImageElement;
        image.textContent = label;
        return image;
      }
    });
    const manager = freshManager();
    manager.source = source;
    manager.clones = new Map();
    dnd.inProgress = true;
    dnd.sourceController = source;
    dnd.topController = null;
    dnd.position = { x: 20, y: 30 };

    const first = manager.switch(null)!;
    expect(first.textContent).toBe('compact');
    label = 'expanded';
    const refreshed = await manager.refresh();

    expect(refreshed).not.toBe(first);
    expect(refreshed?.textContent).toBe('expanded');
    manager.cleanUp();
    dnd.resetVariables();
  });
});
