import { dnd } from './DnD';
import { nextTick } from 'vue';
import type {
  DnDEventPayload,
  DragController,
  DragImageElement,
  DropController,
  Point
} from '../types';

/**
 * This class reacts to drag events emitted by the dnd object to manage a sequence of drag images and fade from one to the
 * other as the drag progresses.
 */
export class DragImagesManager {

    selfTransform: string | null = null;
    clones: Map<DropController, DragImageElement | null> | null = null;
    source: DragController | null = null;
    sourcePos: Point | null = null;
    sourceClone: DragImageElement | null = null;

    constructor () {
      dnd.on('dragstart', this.onDragStart.bind(this));
      dnd.on('dragtopchanged', this.onDragTopChanged.bind(this));
      dnd.on('dragpositionchanged', this.onDragPositionChanged.bind(this));
      dnd.on('dragend', this.onDragEnd.bind(this));
    }

    onDragStart (event: DnDEventPayload) {
      // If go-back=true and it is still animating while they attempt another drag,
      //      it will bug out. Best to clean up any existing elements on the page before
      //      attempting to start the next animation
      this.cleanUp();

      const sourceElement = event.sourceController!.getElement();
      this.sourcePos = {
        x: sourceElement.getBoundingClientRect().left,
        y: sourceElement.getBoundingClientRect().top
      };
      this.selfTransform = 'translate(-' + (event.position!.x - this.sourcePos.x) + 'px, -' + (event.position!.y - this.sourcePos.y) + 'px)';
      this.clones = new Map();
      this.source = event.sourceController;
    }

    onDragEnd (event: DnDEventPayload) {
      nextTick()
        .then(() => {
          if (!event.success && this.source && this.source.getGoBack()) {
            // Restore the drag image that is active when hovering outside any drop zone :
            const img = this.switch(null);
            if (!img || !this.sourcePos) {
              this.cleanUp();
              return;
            }
            const sourcePos = this.sourcePos;
    
            // Move it back to its original place :
            window.requestAnimationFrame(() => {
              img.style.transition = 'all 0.5s';
              window.requestAnimationFrame(() => {
                img.style.left = sourcePos.x + 'px';
                img.style.top = sourcePos.y + 'px';
                img.style.transform = 'translate(0,0)';
                const handler = () => {
                  this.cleanUp();
                  img.removeEventListener('transitionend', handler);
                };
                img.addEventListener('transitionend', handler);
              });
            });
          }
          else {
            this.cleanUp();
          }
        });
    }

    cleanUp () {
      if (this.clones) {
        this.clones.forEach((clone) => {
          if (!clone) return;
          if (clone.parentNode === document.body) {
            document.body.removeChild(clone);
          }
        });
      }
      if (this.sourceClone !== null) {
        if (this.sourceClone.parentNode === document.body) {
          document.body.removeChild(this.sourceClone);
        }
      }
      this.selfTransform = null;
      this.clones = null;
      this.source = null;
      this.sourceClone = null;
      this.sourcePos = null;
    }

    onDragTopChanged (event: DnDEventPayload) {
      this.switch(event.topController);
    }

    switch (top: DropController | null): DragImageElement | null {
      this.clones?.forEach(clone => {
        if (clone) clone.style.opacity = '0';
      });
      if (this.sourceClone) {
        this.sourceClone.style.opacity = '0';
      }

      let activeClone;
      if (top === null) {
        activeClone = this.getSourceClone();
      }
      else {
        if (!this.clones!.has(top)) {
          let clone = top.createDragImage(this.selfTransform);
          if (clone === 'source') {
            clone = this.getSourceClone();
          }
          else if (clone !== null) {
            clone.style.opacity = '0';
            document.body.appendChild(clone);
          }
          this.clones!.set(top, clone);
        }
        activeClone = this.clones!.get(top) ?? null;
      }

      if (activeClone !== null) {
        void activeClone.offsetWidth; // Forces browser reflow
        activeClone.style.opacity = String(activeClone.__opacity ?? 1);
        activeClone.style.visibility = 'visible';
      }

      return activeClone;
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
      if (!dnd.position) return;
      this.clones?.forEach((clone) => {
        if (!clone) return;
        clone.style.left = dnd.position!.x + 'px';
        clone.style.top = dnd.position!.y + 'px';
      });
      if (this.sourceClone) {
        this.sourceClone.style.left = dnd.position.x + 'px';
        this.sourceClone.style.top = dnd.position.y + 'px';
      }
    }

}

new DragImagesManager();
