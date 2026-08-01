import { nextTick } from 'vue';
import { dnd } from './DnD';
import type {
  DnDEventPayload,
  DragController,
  DragImageElement,
  DropController,
  Point
} from '../types';

const FADE_DURATION = 220;
const GO_BACK_DURATION = 500;

/** Manages the bounded set of DOM clones used during a drag. */
export class DragImagesManager {

  selfTransform: string | null = null;
  clones: Map<DropController, DragImageElement | null> | null = null;
  source: DragController | null = null;
  sourcePos: Point | null = null;
  sourceClone: DragImageElement | null = null;
  activeClone: DragImageElement | null = null;
  activeTarget: DropController | null | undefined;

  private generation = 0;
  private fadingClone: DragImageElement | null = null;
  private fadeTimer: ReturnType<typeof setTimeout> | undefined;
  private goBackTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly handlers = {
    dragstart: (event: DnDEventPayload) => this.onDragStart(event),
    dragtopchanged: (event: DnDEventPayload) => this.onDragTopChanged(event),
    dragpositionchanged: () => this.onDragPositionChanged(),
    dragend: (event: DnDEventPayload) => this.onDragEnd(event)
  };

  constructor () {
    dnd.on('dragstart', this.handlers.dragstart);
    dnd.on('dragtopchanged', this.handlers.dragtopchanged);
    dnd.on('dragpositionchanged', this.handlers.dragpositionchanged);
    dnd.on('dragend', this.handlers.dragend);
  }

  dispose () {
    dnd.off('dragstart', this.handlers.dragstart);
    dnd.off('dragtopchanged', this.handlers.dragtopchanged);
    dnd.off('dragpositionchanged', this.handlers.dragpositionchanged);
    dnd.off('dragend', this.handlers.dragend);
    this.cleanUp();
  }

  onDragStart (event: DnDEventPayload) {
    this.cleanUp();
    const sourceRect = event.sourceController!.getElement().getBoundingClientRect();
    this.sourcePos = { x: sourceRect.left, y: sourceRect.top };
    this.selfTransform = `translate(-${event.position!.x - sourceRect.left}px, -${event.position!.y - sourceRect.top}px)`;
    this.clones = new Map();
    this.source = event.sourceController;
  }

  onDragEnd (event: DnDEventPayload) {
    const generation = this.generation;
    void nextTick().then(() => {
      if (generation !== this.generation) return;
      if (event.success || !this.source?.getGoBack()) {
        this.cleanUp();
        return;
      }

      const image = this.switch(null);
      const sourcePos = this.sourcePos;
      if (!image || !sourcePos) {
        this.cleanUp();
        return;
      }

      requestAnimationFrame(() => {
        if (generation !== this.generation) return;
        image.style.transition = `all ${GO_BACK_DURATION}ms`;
        requestAnimationFrame(() => {
          if (generation !== this.generation) return;
          image.style.left = `${sourcePos.x}px`;
          image.style.top = `${sourcePos.y}px`;
          image.style.transform = 'translate(0,0)';
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            if (generation === this.generation) this.cleanUp();
          };
          image.addEventListener('transitionend', finish, { once: true });
          this.goBackTimer = setTimeout(finish, GO_BACK_DURATION + 100);
        });
      });
    });
  }

  cleanUp () {
    this.generation++;
    if (this.fadeTimer !== undefined) clearTimeout(this.fadeTimer);
    if (this.goBackTimer !== undefined) clearTimeout(this.goBackTimer);

    const images = new Set<DragImageElement>();
    this.clones?.forEach(clone => {
      if (clone) images.add(clone);
    });
    if (this.sourceClone) images.add(this.sourceClone);
    if (this.activeClone) images.add(this.activeClone);
    if (this.fadingClone) images.add(this.fadingClone);
    images.forEach(image => image.remove());

    this.selfTransform = null;
    this.clones = null;
    this.source = null;
    this.sourceClone = null;
    this.sourcePos = null;
    this.activeClone = null;
    this.activeTarget = undefined;
    this.fadingClone = null;
    this.fadeTimer = undefined;
    this.goBackTimer = undefined;
  }

  onDragTopChanged (event: DnDEventPayload) {
    const generation = this.generation;
    const top = event.topController;
    void nextTick().then(() => {
      if (generation !== this.generation || dnd.topController !== top) return;
      this.switch(top);
      this.onDragPositionChanged();
    });
  }

  switch (top: DropController | null): DragImageElement | null {
    if (!this.clones || !this.source) return null;
    if (this.activeTarget === top) return this.activeClone;

    if (this.fadeTimer !== undefined) clearTimeout(this.fadeTimer);
    this.fadingClone?.remove();
    const previousClone = this.activeClone;
    if (previousClone) previousClone.style.opacity = '0';

    let nextClone: DragImageElement | null;
    this.clones.clear();
    if (top === null) {
      nextClone = this.getSourceClone();
    }
    else {
      const image = top.createDragImage(this.selfTransform);
      nextClone = image === 'source' ? this.getSourceClone() : image;
      this.clones.set(top, nextClone);
      if (nextClone && nextClone !== this.sourceClone) {
        nextClone.style.opacity = '0';
        document.body.appendChild(nextClone);
      }
    }

    this.activeTarget = top;
    this.activeClone = nextClone;
    if (nextClone) {
      void nextClone.offsetWidth;
      nextClone.style.opacity = String(nextClone.__opacity ?? 1);
      nextClone.style.visibility = 'visible';
    }

    if (previousClone && previousClone !== nextClone && previousClone !== this.sourceClone) {
      this.fadingClone = previousClone;
      this.fadeTimer = setTimeout(() => {
        previousClone.remove();
        if (this.fadingClone === previousClone) this.fadingClone = null;
        this.fadeTimer = undefined;
      }, FADE_DURATION);
    }
    return nextClone;
  }

  getSourceClone (): DragImageElement {
    if (this.sourceClone === null) {
      this.sourceClone = this.source!.createDragImage(this.selfTransform);
      this.sourceClone.style.opacity = '0';
      document.body.appendChild(this.sourceClone);
    }
    return this.sourceClone;
  }

  onDragPositionChanged () {
    if (!dnd.position || !this.activeClone) return;
    this.activeClone.style.left = `${dnd.position.x}px`;
    this.activeClone.style.top = `${dnd.position.y}px`;
  }
}

new DragImagesManager();
