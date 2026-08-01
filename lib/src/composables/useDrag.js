import { computed, getCurrentInstance, markRaw, onBeforeUnmount, onMounted, ref } from 'vue';
import { createDragImage as cloneDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';
import scrollparent from '../helpers/scrollparent';
import { cancelScrollAction, isContainerReadyToEdgeScroll, performEdgeScroll } from '../helpers/edgescroller';
import { useDragAware } from './useDragAware';

export const dragProps = {
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
};

export const dragEmits = ['dragstart', 'dragend', 'cut', 'copy'];

export function useDrag (props, emit, options) {
  const instance = getCurrentInstance();
  const component = instance.proxy;
  const dragAware = useDragAware();
  const dragInitialised = ref(false);
  const dragStarted = ref(false);
  const ignoreNextClick = ref(false);
  const initialUserSelect = ref(null);
  const downEvent = ref(null);
  const startPosition = ref(null);
  const delayTimer = ref(null);
  const scrollContainer = ref(null);
  const controller = markRaw({
    component,
    getElement: () => options.rootElement.value,
    getGoBack: () => props.goBack,
    createDragImage: (selfTransform) => createDragImage(selfTransform),
    notifyDrop: (mode, event) => emit(mode, event)
  });

  const currentDropMode = computed(() => {
    if (dragAware.dragInProgress.value && dnd.sourceController === controller) {
      const top = dnd.topController;
      if (top?.getDropAllowed()) {
        return top.getReordering() ? 'reordering' : top.getMode();
      }
    }
    return null;
  });
  const cssClasses = computed(() => {
    const classes = { 'dnd-drag': true };
    if (props.disabled) return classes;

    return {
      ...classes,
      'drag-source': dragAware.dragInProgress.value && dnd.sourceController === controller,
      'drag-mode-copy': currentDropMode.value === 'copy',
      'drag-mode-cut': currentDropMode.value === 'cut',
      'drag-mode-reordering': currentDropMode.value === 'reordering',
      'drag-no-handle': !props.handle
    };
  });

  const onSelectStart = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };
  const performVibration = () => {
    if (props.vibration > 0 && window.navigator?.vibrate) {
      window.navigator.vibrate(props.vibration);
    }
  };
  const onMouseClick = (event) => {
    if (ignoreNextClick.value) {
      event.preventDefault();
      event.stopPropagation?.();
      event.stopImmediatePropagation?.();
      ignoreNextClick.value = false;
      return false;
    }
  };
  const onEasyDnDMove = (event) => dnd.mouseMove(event, null);
  const cancelDragActions = () => {
    dragInitialised.value = false;
    clearTimeout(delayTimer.value);
    cancelScrollAction();
  };
  const finishDrag = () => {
    downEvent.value = null;
    scrollContainer.value = null;

    if (dragStarted.value) {
      document.documentElement.classList.remove('drag-in-progress');
    }
    document.removeEventListener('click', onMouseClick, true);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onMouseMove);
    document.removeEventListener('easy-dnd-move', onEasyDnDMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchend', onMouseUp);
    document.removeEventListener('selectstart', onSelectStart);
    document.removeEventListener('keyup', onKeyUp);
    document.documentElement.style.userSelect = initialUserSelect.value;
  };
  const onMouseUp = (event) => {
    if (!downEvent.value || (downEvent.value.type === 'touchstart' && event.type === 'mouseup')) return;

    setTimeout(() => {
      cancelDragActions();
      if (dragStarted.value) dnd.stopDrag(event);
      finishDrag();
    }, 0);
  };
  const onKeyUp = (event) => {
    if (event.key === 'Escape') {
      cancelDragActions();
      setTimeout(() => {
        dnd.cancelDrag(event);
        finishDrag();
      }, 0);
    }
  };

  const onMouseMove = (event) => {
    if (downEvent.value === null) return;
    if (downEvent.value.type === 'touchstart' && event.type === 'mousemove') return;

    let target;
    let x;
    let y;
    if (event.type === 'touchmove') {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
      target = document.elementFromPoint(x, y);
      if (!target) return;
    }
    else {
      x = event.clientX;
      y = event.clientY;
      target = event.target;
    }

    const distance = Math.sqrt(
      Math.pow(startPosition.value.x - x, 2) + Math.pow(startPosition.value.y - y, 2)
    );
    if (!dragStarted.value && distance > props.delta) {
      if (!dragInitialised.value) {
        clearTimeout(delayTimer.value);
      }
      else {
        ignoreNextClick.value = true;
        dragStarted.value = true;
        dnd.startDrag(
          controller,
          downEvent.value,
          startPosition.value.x,
          startPosition.value.y,
          props.type,
          props.data
        );
        document.documentElement.classList.add('drag-in-progress');
      }
    }

    if (dragStarted.value) {
      const top = dnd.topController;
      const edgeSize = top?.getScrollingEdgeSize() !== undefined
        ? top.getScrollingEdgeSize()
        : props.scrollingEdgeSize;

      if (edgeSize) {
        let currentContainer = top ? scrollparent(top.getElement()) : scrollContainer.value;
        const nodes = [currentContainer];
        do {
          if (currentContainer === document.body) break;
          currentContainer = scrollparent(currentContainer.parentNode);
          if (!currentContainer || currentContainer === document.body) break;
          nodes.push(currentContainer);
        } while (currentContainer && currentContainer !== document.body);

        for (let index = nodes.length - 1; index >= 0; index--) {
          cancelScrollAction();
          const node = nodes[index];
          if (isContainerReadyToEdgeScroll(node, x, y, edgeSize)) {
            performEdgeScroll(node, x, y, edgeSize);
            break;
          }
        }
      }
      else {
        cancelScrollAction();
      }

      target.dispatchEvent(new CustomEvent('easy-dnd-move', {
        bubbles: true,
        cancelable: true,
        detail: { x, y, native: event }
      }));
    }

    if (dragInitialised.value && event.cancelable) event.preventDefault();
  };

  const onMouseDown = (event) => {
    const mouseEvent = event.type === 'mousedown';
    const target = mouseEvent ? event.target : event.touches[0].target;
    const goodButton = mouseEvent ? event.buttons === 1 : true;
    if (props.disabled || downEvent.value !== null || !goodButton) return;

    const goodTarget = !target.matches('.dnd-no-drag, .dnd-no-drag *') &&
      (!props.handle || target.matches(`${props.handle}, ${props.handle} *`));
    if (!goodTarget) return;

    scrollContainer.value = scrollparent(target);
    initialUserSelect.value = document.body.style.userSelect;
    document.documentElement.style.userSelect = 'none';
    dragStarted.value = false;
    downEvent.value = event;
    const input = mouseEvent ? event : event.touches[0];
    startPosition.value = { x: input.clientX, y: input.clientY };

    if (props.delay) {
      dragInitialised.value = false;
      clearTimeout(delayTimer.value);
      delayTimer.value = setTimeout(() => {
        dragInitialised.value = true;
        performVibration();
      }, props.delay);
    }
    else {
      dragInitialised.value = true;
      performVibration();
    }

    document.addEventListener('click', onMouseClick, true);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onMouseUp);
    document.addEventListener('selectstart', onSelectStart);
    document.addEventListener('keyup', onKeyUp);
    setTimeout(() => {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('touchmove', onMouseMove, { passive: false });
      document.addEventListener('easy-dnd-move', onEasyDnDMove);
    }, 0);
    event.stopPropagation();
  };

  const dndDragStart = (event) => {
    if (event.sourceController === controller) emit('dragstart', event);
  };
  const dndDragEnd = (event) => {
    if (event.sourceController === controller) emit('dragend', event);
  };
  const createDragImage = (selfTransform) => {
    let image;
    if (options.hasDragImage()) {
      const element = options.dragImageElement.value || document.createElement('div');
      image = cloneDragImage(element.childElementCount !== 1 ? element : element.children.item(0));
    }
    else {
      image = cloneDragImage(options.rootElement.value);
      image.style.transform = selfTransform;
    }

    if (props.dragClass) image.classList.add(props.dragClass);
    image.classList.add('dnd-ghost');
    image.__opacity = props.dragImageOpacity;
    return image;
  };

  onMounted(() => {
    dnd.on('dragstart', dndDragStart);
    dnd.on('dragend', dndDragEnd);
    options.rootElement.value.addEventListener('mousedown', onMouseDown, { passive: true });
    options.rootElement.value.addEventListener('touchstart', onMouseDown, { passive: true });
  });

  onBeforeUnmount(() => {
    if (dnd.inProgress && dnd.sourceController === controller) {
      dnd.cancelDrag(downEvent.value);
    }
    dnd.off('dragstart', dndDragStart);
    dnd.off('dragend', dndDragEnd);
    options.rootElement.value.removeEventListener('mousedown', onMouseDown);
    options.rootElement.value.removeEventListener('touchstart', onMouseDown);
    if (downEvent.value) {
      cancelDragActions();
      finishDrag();
    }
  });

  return {
    ...dragAware,
    dragInitialised,
    dragStarted,
    ignoreNextClick,
    initialUserSelect,
    downEvent,
    startPosition,
    delayTimer,
    scrollContainer,
    controller,
    currentDropMode,
    cssClasses,
    onSelectStart,
    performVibration,
    onMouseDown,
    onMouseClick,
    onMouseMove,
    onEasyDnDMove,
    onMouseUp,
    onKeyUp,
    cancelDragActions,
    finishDrag,
    createDragImage
  };
}
