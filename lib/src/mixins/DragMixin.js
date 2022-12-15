import DragAwareMixin from './DragAwareMixin';
import { createDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';
import scrollparent from '../helpers/scrollparent';
import { cancelScrollAction, performEdgeScroll } from '../helpers/edgescroller';

export default {
  mixins: [DragAwareMixin],
  props: {
    type: {
      type: String,
      default: null
    },
    data: {
      default: null
    },
    dragImageOpacity: {
      type: Number,
      default: 0.7
    },
    disabled: {
      type: Boolean,
      default: false
    },
    goBack: {
      type: Boolean,
      default: false
    },
    handle: {
      type: String,
      default: null
    },
    delta: {
      type: Number,
      default: 0
    },
    delay: {
      type: Number,
      default: 0
    },
    dragClass: {
      type: String,
      default: null
    },
    vibration: {
      type: Number,
      default: 0
    },
    scrollingEdgeSize: {
      type: Number,
      default: 100
    }
  },
  data () {
    return {
      dragInitialised: false,
      dragStarted: false,
      ignoreNextClick: false,
      initialUserSelect: null,
      downEvent: null,
      startPosition: null,
      delayTimer: null,
      scrollContainer: null
    };
  },
  computed: {
    cssClasses () {
      const clazz = {
        'dnd-drag': true
      };
      if (!this.disabled) {
        return {
          ...clazz,
          'drag-source': this.dragInProgress && this.dragSource === this,
          'drag-mode-copy': this.currentDropMode === 'copy',
          'drag-mode-cut': this.currentDropMode === 'cut',
          'drag-mode-reordering': this.currentDropMode === 'reordering',
          'drag-no-handle': !this.handle
        };
      }
      else {
        return clazz;
      }
    },
    currentDropMode () {
      if (this.dragInProgress && this.dragSource === this) {
        if (this.dragTop && this.dragTop['dropAllowed']) {
          if (this.dragTop['reordering']) {
            return 'reordering';
          }
          else {
            return this.dragTop['mode'];
          }
        }
        else {
          return null;
        }
      }
      else {
        return null;
      }
    }
  },
  methods: {
    onSelectStart (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    performVibration () {
      // If browser can perform vibration and user has defined a vibration, perform it
      if (this.vibration > 0 && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(this.vibration);
      }
    },
    onMouseDown (e) {
      let target = null;
      let goodButton = false;
      if (e.type === 'mousedown') {
        const mouse = e;
        target = e.target;
        goodButton = mouse.buttons === 1;
      }
      else {
        const touch = e;
        target = touch.touches[0].target;
        goodButton = true;
      }

      if (this.disabled || this.downEvent !== null || !goodButton) {
        return;
      }

      // Check that the target element is eligible for starting a drag
      // Includes checking against the handle selector
      //   or whether the element contains 'dnd-no-drag' class (which should disable dragging from that
      //   sub-element of a draggable parent)
      const goodTarget = !target.matches('.dnd-no-drag, .dnd-no-drag *') &&
              (
                !this.handle ||
                target.matches(this.handle + ', ' + this.handle + ' *')
              );

      if (!goodTarget) {
        return;
      }

      this.scrollContainer = scrollparent(target);
      this.initialUserSelect = document.body.style.userSelect;
      document.documentElement.style.userSelect = 'none'; // Permet au drag de se poursuivre normalement même
      // quand on quitte un élémént avec overflow: hidden.
      this.dragStarted = false;
      this.downEvent = e;
      if (this.downEvent.type === 'mousedown') {
        const mouse = e;
        this.startPosition = {
          x: mouse.clientX,
          y: mouse.clientY
        };
      }
      else {
        const touch = e;
        this.startPosition = {
          x: touch.touches[0].clientX,
          y: touch.touches[0].clientY
        };
      }

      if (this.delay) {
        this.dragInitialised = false;
        clearTimeout(this.delayTimer);
        this.delayTimer = setTimeout(() => {
          this.dragInitialised = true;
          this.performVibration();
        }, this.delay);
      }
      else {
        this.dragInitialised = true;
        this.performVibration();
      }

      document.addEventListener('click', this.onMouseClick, true);
      document.addEventListener('mouseup', this.onMouseUp);
      document.addEventListener('touchend', this.onMouseUp);
      document.addEventListener('selectstart', this.onSelectStart);
      document.addEventListener('keyup', this.onKeyUp);

      setTimeout(() => {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('touchmove', this.onMouseMove, { passive: false });
        document.addEventListener('easy-dnd-move', this.onEasyDnDMove);
      }, 0);

      // Prevents event from bubbling to ancestor drag components and initiate several drags at the same time
      e.stopPropagation();
    },
    // Prevent the user from accidentally causing a click event
    // if they have just attempted a drag event
    onMouseClick (e) {
      if (this.ignoreNextClick) {
        e.preventDefault();
        e.stopPropagation && e.stopPropagation();
        e.stopImmediatePropagation && e.stopImmediatePropagation();
        this.ignoreNextClick = false;
        return false;
      }
    },
    onMouseMove (e) {
      // We ignore the mousemove event that follows touchend :
      if (this.downEvent === null) return;

      // On touch devices, we ignore fake mouse events and deal with touch events only.
      if (this.downEvent.type === 'touchstart' && e.type === 'mousemove') return;

      // Find out event target and pointer position :
      let target = null;
      let x = null;
      let y = null;
      if (e.type === 'touchmove') {
        const touch = e;
        x = touch.touches[0].clientX;
        y = touch.touches[0].clientY;
        target = document.elementFromPoint(x, y);
        if (!target) {
          // Mouse going off screen. Ignore event.
          return;
        }
      }
      else {
        const mouse = e;
        x = mouse.clientX;
        y = mouse.clientY;
        target = mouse.target;
      }

      // Distance between current event and start position :
      const dist = Math.sqrt(Math.pow(this.startPosition.x - x, 2) + Math.pow(this.startPosition.y - y, 2));

      // If the drag has not begun yet and distance from initial point is greater than delta, we start the drag :
      if (!this.dragStarted && dist > this.delta) {
        // If they have dragged greater than the delta before the delay period has ended,
        // It means that they attempted to perform another action (such as scrolling) on the page
        if (!this.dragInitialised) {
          clearTimeout(this.delayTimer);
        }
        else {
          this.ignoreNextClick = true;
          this.dragStarted = true;
          dnd.startDrag(this, this.downEvent, this.startPosition.x, this.startPosition.y, this.type, this.data);
          document.documentElement.classList.add('drag-in-progress');
        }
      }

      // Dispatch custom easy-dnd-move event :
      if (this.dragStarted) {
        // If cursor/touch is at edge of container, perform scroll if available
        // If this.dragTop is defined, it means they are dragging on top of another DropList/EasyDnd component
        // if dropTop is a DropList, use the scrollingEdgeSize of that container if it exists, otherwise use the scrollingEdgeSize of the Drag component
        const currEdgeSize = this.dragTop && this.dragTop.$props.scrollingEdgeSize !== undefined ?
          this.dragTop.$props.scrollingEdgeSize :
          this.scrollingEdgeSize;

        if (currEdgeSize) {
          const currScrollContainer = this.dragTop ? scrollparent(this.dragTop.$el) : this.scrollContainer;
          performEdgeScroll(e, currScrollContainer, x, y, currEdgeSize);
        }
        else {
          cancelScrollAction();
        }

        const custom = new CustomEvent('easy-dnd-move', {
          bubbles: true,
          cancelable: true,
          detail: {
            x,
            y,
            native: e
          }
        });
        target.dispatchEvent(custom);
      }

      // Prevent scroll on touch devices if they were performing a drag
      if (this.dragInitialised && e.cancelable) {
        e.preventDefault();
      }
    },
    onEasyDnDMove (e) {
      dnd.mouseMove(e, null);
    },
    onMouseUp (e) {
      // On touch devices, we ignore fake mouse events and deal with touch events only.
      if (this.downEvent.type === 'touchstart' && e.type === 'mouseup') return;

      // This delay makes sure that when the click event that results from the mouseup is produced, the drag is
      // still in progress. So by checking the flag dnd.inProgress, one can tell apart true clicks from drag and
      // drop artefacts.
      setTimeout(() => {
        this.cancelDragActions();

        if (this.dragStarted) {
          dnd.stopDrag(e);
        }
        this.finishDrag();
      }, 0);
    },
    onKeyUp (e) {
      // If ESC is pressed, cancel the drag
      if (e.key === 'Escape') {
        this.cancelDragActions();

        setTimeout(() => {
          dnd.cancelDrag(e);
          this.finishDrag();
        }, 0);
      }
    },
    cancelDragActions () {
      this.dragInitialised = false;
      clearTimeout(this.delayTimer);
      cancelScrollAction();
    },
    finishDrag () {
      this.downEvent = null;
      this.scrollContainer = null;

      if (this.dragStarted) {
        document.documentElement.classList.remove('drag-in-progress');
      }
      document.removeEventListener('click', this.onMouseClick, true);
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('touchmove', this.onMouseMove);
      document.removeEventListener('easy-dnd-move', this.onEasyDnDMove);
      document.removeEventListener('mouseup', this.onMouseUp);
      document.removeEventListener('touchend', this.onMouseUp);
      document.removeEventListener('selectstart', this.onSelectStart);
      document.removeEventListener('keyup', this.onKeyUp);
      document.documentElement.style.userSelect = this.initialUserSelect;
    },
    dndDragStart (ev) {
      if (ev.source === this) {
        this.$emit('dragstart', ev);
      }
    },
    dndDragEnd (ev) {
      if (ev.source === this) {
        this.$emit('dragend', ev);
      }
    },
    createDragImage (selfTransform) {
      let image;
      if (this.$slots['drag-image']) {
        const el = this.$refs['drag-image'] || document.createElement('div');
        if (el.childElementCount !== 1) {
          image = createDragImage(el);
        }
        else {
          image = createDragImage(el.children.item(0));
        }
      }
      else {
        image = createDragImage(this.$el);
        image.style.transform = selfTransform;
      }

      if (this.dragClass) {
        image.classList.add(this.dragClass);
      }
      image.classList.add('dnd-ghost');
      image['__opacity'] = this.dragImageOpacity;
      return image;
    }
  },
  created () {
    dnd.on('dragstart', this.dndDragStart);
    dnd.on('dragend', this.dndDragEnd);
  },
  mounted () {
    this.$el.addEventListener('mousedown', this.onMouseDown);
    this.$el.addEventListener('touchstart', this.onMouseDown);
  },
  beforeUnmount () {
    dnd.off('dragstart', this.dndDragStart);
    dnd.off('dragend', this.dndDragEnd);

    this.$el.removeEventListener('mousedown', this.onMouseDown);
    this.$el.removeEventListener('touchstart', this.onMouseDown);
  }
};
