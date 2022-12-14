import { dnd } from './DnD';
import { nextTick } from 'vue';

/**
 * This class reacts to drag events emitted by the dnd object to manage a sequence of drag images and fade from one to the
 * other as the drag progresses.
 */
// todo - this class is completely broken
export class DragImagesManager {

    selfTransform = null;
    clones = null; // todo - Map<Vue, HTMLElement>
    source = null; // todo - Vue = null
    sourcePos = null;
    sourceClone = null;

    constructor () {
      dnd.on('dragstart', this.onDragStart.bind(this));
      dnd.on('dragtopchanged', this.onDragTopChanged.bind(this));
      dnd.on('dragpositionchanged', this.onDragPositionChanged.bind(this));
      dnd.on('dragend', this.onDragEnd.bind(this));
    }

    onDragStart (event) {
      // If go-back=true and it is still animating while they attempt another drag,
      //      it will bug out. Best to clean up any existing elements on the page before
      //      attempting to start the next animation
      this.cleanUp();

      this.sourcePos = {
        x: event.source.$el.getBoundingClientRect().left,
        y: event.source.$el.getBoundingClientRect().top
      };
      this.selfTransform = 'translate(-' + (event.position.x - this.sourcePos.x) + 'px, -' + (event.position.y - this.sourcePos.y) + 'px)';
      this.clones = new Map(); // todo - Map<Vue, HTMLElement>
      this.source = event.source;
    }

    async onDragEnd (event) {
      await nextTick();

      if (!event.success && this.source && this.source['goBack']) {
        // Restore the drag image that is active when hovering outside any drop zone :
        let img = this.switch(null); // todo - switch(null) as HTMLElement

        // Move it back to its original place :
        window.requestAnimationFrame(() => {
          img.style.transition = 'all 0.5s';
          window.requestAnimationFrame(() => {
            img.style.left = this.sourcePos.x + 'px';
            img.style.top = this.sourcePos.y + 'px';
            img.style.transform = 'translate(0,0)';
            let handler = () => {
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
    }

    cleanUp () {
      if (this.clones) {
        this.clones.forEach((clone) => {
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

    onDragTopChanged (event) {
      this.switch(event.top);
    }

    switch (top) {
      this.clones.forEach(clone => {
        clone.style.opacity = '0';
      });
      if (this.sourceClone) {
        this.sourceClone.style.opacity = '0';
      }

      let activeClone;
      if (top === null) {
        activeClone = this.getSourceClone();
      }
      else {
        if (!this.clones.has(top)) {
          let clone = top['createDragImage'](this.selfTransform);
          if (clone === 'source') {
            clone = this.getSourceClone();
          }
          else if (clone !== null) {
            clone.style.opacity = '0';
            document.body.appendChild(clone);
          }
          this.clones.set(top, clone);
        }
        activeClone = this.clones.get(top);
      }

      if (activeClone !== null) {
        activeClone.offsetWidth; // Forces browser reflow
        activeClone.style.opacity = activeClone['__opacity'];
        activeClone.style.visibility = 'visible';
      }

      return activeClone;
    }

    getSourceClone () {
      if (this.sourceClone === null) {
        this.sourceClone = this.source['createDragImage'](this.selfTransform);
        this.sourceClone.style.opacity = '0';
        document.body.appendChild(this.sourceClone);
      }
      return this.sourceClone;
    }

    onDragPositionChanged () {
      this.clones.forEach((clone) => {
        clone.style.left = dnd.position.x + 'px';
        clone.style.top = dnd.position.y + 'px';
      });
      if (this.sourceClone) {
        this.sourceClone.style.left = dnd.position.x + 'px';
        this.sourceClone.style.top = dnd.position.y + 'px';
      }
    }

}

new DragImagesManager();
