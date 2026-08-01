import { computed, getCurrentInstance, markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { createDragImage as cloneDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';
import scrollparent from '../helpers/scrollparent';
import { cancelScrollAction, performEdgeScroll } from '../helpers/edgescroller';
import { useDragAware } from './useDragAware';
import type { PropType, Ref } from 'vue';
import type {
  DnDEmit,
  DnDEventPayload,
  DragController,
  DragData,
  DragImageElement,
  DragType,
  EasyDnDMoveEvent,
  Point
} from '../types';

export interface DragProps {
  type?: DragType;
  data?: DragData;
  dragImageOpacity: number;
  disabled: boolean;
  goBack: boolean;
  handle?: string | (() => Element | null) | null;
  delta: number;
  delay: number;
  dragClass?: string | null;
  vibration: number;
  scrollingEdgeSize: number;
  scrollingSpeed?: number;
  scrollingPropagation?: boolean;
}

export interface DragOptions {
  rootElement: Ref<HTMLElement | null>;
  dragImageElement: Ref<HTMLElement | null>;
  hasDragImage: () => boolean;
}

export const dragProps = {
  type: {
    type: [String, Number] as PropType<Exclude<DragType, null>>,
    default: null as DragType
  },
  data: {
    type: null as unknown as PropType<DragData>,
    default: null as DragData
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
    type: [String, Function] as PropType<string | (() => Element | null)>,
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
  },
  scrollingSpeed: {
    type: Number,
    default: 50
  },
  scrollingPropagation: {
    type: Boolean,
    default: true
  }
};

export const dragEmits = ['dragstart', 'dragend', 'cut', 'copy'];

const deepestElementFromPoint = (x: number, y: number): Element | null => {
  let target = document.elementFromPoint(x, y);
  while (target?.shadowRoot) {
    const nestedTarget = target.shadowRoot.elementFromPoint(x, y);
    if (!nestedTarget || nestedTarget === target) break;
    target = nestedTarget;
  }
  return target;
};

export function useDrag (props: DragProps, emit: DnDEmit, options: DragOptions) {
  const instance = getCurrentInstance()!;
  const component = instance.proxy;
  const getRootElement = (): HTMLElement => {
    const element = options.rootElement.value;
    if (!element) {
      throw new TypeError('Easy-DnD Drag requires its tag component to render a single HTML root element.');
    }
    return element;
  };
  const dragAware = useDragAware();
  const dragInitialised = ref(false);
  const dragStarted = ref(false);
  const ignoreNextClick = ref(false);
  const initialUserSelect = ref('');
  const downEvent = ref<MouseEvent | TouchEvent | null>(null);
  const startPosition = ref<Point | null>(null);
  const delayTimer = ref<ReturnType<typeof setTimeout> | undefined>();
  const finishTimer = ref<ReturnType<typeof setTimeout> | undefined>();
  const scrollContainer = ref<HTMLElement | null>(null);
  const controller: DragController = markRaw({
    get component () {
      return instance.exposeProxy ?? component;
    },
    getElement: getRootElement,
    getGoBack: () => props.goBack,
    createDragImage: (selfTransform: string | null) => createDragImage(selfTransform),
    notifyDrop: (mode: string, event: DnDEventPayload) => emit(mode, event),
    notifyDragStart: (event: DnDEventPayload) => emit('dragstart', event),
    notifyDragEnd: (event: DnDEventPayload) => emit('dragend', event)
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

  const onSelectStart = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
  };
  const performVibration = () => {
    if (props.vibration > 0 && window.navigator?.vibrate) {
      window.navigator.vibrate(props.vibration);
    }
  };
  const onMouseClick = (event: MouseEvent) => {
    if (ignoreNextClick.value) {
      event.preventDefault();
      event.stopPropagation?.();
      event.stopImmediatePropagation?.();
      ignoreNextClick.value = false;
      return false;
    }
  };
  const onEasyDnDMove = (event: Event) => dnd.mouseMove(event as EasyDnDMoveEvent, null);
  const onNativeDragStart = (event: DragEvent) => {
    if (!downEvent.value) return;
    event.preventDefault();
  };
  const cancelDragActions = () => {
    dragInitialised.value = false;
    if (delayTimer.value !== undefined) {
      clearTimeout(delayTimer.value);
      delayTimer.value = undefined;
    }
    cancelScrollAction();
  };
  const finishDrag = () => {
    if (finishTimer.value !== undefined) {
      clearTimeout(finishTimer.value);
      finishTimer.value = undefined;
    }
    downEvent.value = null;
    startPosition.value = null;
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
    document.removeEventListener('touchcancel', onCancel);
    document.removeEventListener('selectstart', onSelectStart);
    document.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onCancel);
    document.documentElement.style.userSelect = initialUserSelect.value;
    dragStarted.value = false;
  };
  const onMouseUp = (event: MouseEvent | TouchEvent) => {
    if (!downEvent.value || (downEvent.value.type === 'touchstart' && event.type === 'mouseup')) return;
    if (finishTimer.value !== undefined) return;

    finishTimer.value = setTimeout(() => {
      finishTimer.value = undefined;
      cancelDragActions();
      try {
        if (dragStarted.value) dnd.stopDrag(event);
      }
      finally {
        finishDrag();
      }
    }, 0);
  };
  const onCancel = (event: Event) => {
    if (!downEvent.value) return;

    cancelDragActions();
    try {
      if (dragStarted.value) dnd.cancelDrag(event);
    }
    finally {
      finishDrag();
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Escape') onCancel(event);
  };

  const onMouseMove = (event: MouseEvent | TouchEvent) => {
    if (downEvent.value === null) return;
    if (downEvent.value.type === 'touchstart' && event.type === 'mousemove') return;

    let target: Element | null;
    let x: number;
    let y: number;
    if (event.type === 'touchmove') {
      const touch = (event as TouchEvent).touches[0];
      if (!touch) return;
      x = touch.clientX;
      y = touch.clientY;
      target = deepestElementFromPoint(x, y);
      if (!target) return;
    }
    else {
      x = (event as MouseEvent).clientX;
      y = (event as MouseEvent).clientY;
      target = (event.composedPath()[0] ?? event.target) as Element | null;
    }

    if (!(target instanceof Element) || !startPosition.value) return;

    const deltaX = startPosition.value.x - x;
    const deltaY = startPosition.value.y - y;
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;
    if (!dragStarted.value && distanceSquared > props.delta * props.delta) {
      if (!dragInitialised.value) {
        if (delayTimer.value !== undefined) clearTimeout(delayTimer.value);
      }
      else {
        ignoreNextClick.value = true;
        dnd.startDrag(
          controller,
          downEvent.value,
          startPosition.value.x,
          startPosition.value.y,
          props.type ?? null,
          props.data
        );
        dragStarted.value = true;
        document.documentElement.classList.add('drag-in-progress');
      }
    }

    if (dragStarted.value) {
      const top = dnd.topController;
      const targetEdgeSize = top?.getScrollingEdgeSize();
      const edgeSize = targetEdgeSize ?? props.scrollingEdgeSize;
      const scrollingPropagation = top?.getScrollingPropagation?.() ?? props.scrollingPropagation ?? true;

      if (edgeSize) {
        let currentContainer = top ? scrollparent(top.getElement()) : scrollContainer.value;
        if (!currentContainer) return;
        const nodes = [currentContainer];
        if (scrollingPropagation) {
          do {
            if (currentContainer === document.body) break;
            currentContainer = scrollparent(currentContainer.parentNode);
            nodes.push(currentContainer);
          } while (currentContainer !== document.body);
        }

        cancelScrollAction();
        for (let index = nodes.length - 1; index >= 0; index--) {
          const node = nodes[index];
          if (performEdgeScroll(node, x, y, edgeSize, props.scrollingSpeed ?? 50)) break;
        }
      }
      else {
        cancelScrollAction();
      }

      target.dispatchEvent(new CustomEvent('easy-dnd-move', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { x, y, native: event }
      }));
    }

    if (dragInitialised.value && event.cancelable) event.preventDefault();
  };

  const onMouseDown = (event: MouseEvent | TouchEvent) => {
    const mouseEvent = event.type === 'mousedown';
    const touch = mouseEvent ? null : (event as TouchEvent).touches[0];
    const target = event.composedPath()[0] ?? (mouseEvent ? event.target : touch?.target);
    const goodButton = mouseEvent ? (event as MouseEvent).buttons === 1 : true;
    if (props.disabled || downEvent.value !== null || !goodButton) return;
    if (!(target instanceof Element)) return;

    const handle = typeof props.handle === 'function' ? props.handle() : null;
    const goodTarget = !target.matches('.dnd-no-drag, .dnd-no-drag *') && (
      !props.handle || (typeof props.handle === 'string'
        ? target.matches(`${props.handle}, ${props.handle} *`)
        : !!handle && (target === handle || handle.contains(target)))
    );
    if (!goodTarget) return;

    scrollContainer.value = scrollparent(typeof props.handle === 'function' ? getRootElement() : target);
    initialUserSelect.value = document.documentElement.style.userSelect;
    document.documentElement.style.userSelect = 'none';
    dragStarted.value = false;
    downEvent.value = event;
    const input = mouseEvent ? event as MouseEvent : touch!;
    startPosition.value = { x: input.clientX, y: input.clientY };

    if (props.delay) {
      dragInitialised.value = false;
      if (delayTimer.value !== undefined) clearTimeout(delayTimer.value);
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
    document.addEventListener('touchcancel', onCancel);
    document.addEventListener('selectstart', onSelectStart);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onCancel);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onMouseMove, { passive: false });
    document.addEventListener('easy-dnd-move', onEasyDnDMove);
    event.stopPropagation();
  };
  const createDragImage = (selfTransform: string | null): DragImageElement => {
    let image: DragImageElement;
    if (options.hasDragImage()) {
      const element = options.dragImageElement.value || document.createElement('div');
      const model = element.childElementCount !== 1 ? element : element.children.item(0);
      image = cloneDragImage(model instanceof HTMLElement ? model : element);
    }
    else {
      image = cloneDragImage(getRootElement());
      image.style.transform = selfTransform ?? '';
    }

    if (props.dragClass) image.classList.add(props.dragClass);
    image.classList.add('dnd-ghost');
    image.__opacity = props.dragImageOpacity;
    return image;
  };

  let mounted = false;
  const addRootListeners = (element: HTMLElement) => {
    if (typeof props.handle === 'function') {
      document.addEventListener('mousedown', onMouseDown as EventListener, { passive: true });
      document.addEventListener('touchstart', onMouseDown as EventListener, { passive: true });
      document.addEventListener('dragstart', onNativeDragStart as EventListener, { capture: true });
    }
    else {
      element.addEventListener('mousedown', onMouseDown, { passive: true });
      element.addEventListener('touchstart', onMouseDown, { passive: true });
      element.addEventListener('dragstart', onNativeDragStart, { capture: true });
    }
  };
  const removeRootListeners = (element: HTMLElement | null, handle = props.handle) => {
    if (typeof handle === 'function') {
      document.removeEventListener('mousedown', onMouseDown as EventListener);
      document.removeEventListener('touchstart', onMouseDown as EventListener);
      document.removeEventListener('dragstart', onNativeDragStart as EventListener, true);
    }
    else {
      element?.removeEventListener('mousedown', onMouseDown);
      element?.removeEventListener('touchstart', onMouseDown);
      element?.removeEventListener('dragstart', onNativeDragStart, true);
    }
  };

  watch([options.rootElement, () => props.handle], ([element, handle], [previousElement, previousHandle]) => {
    if (!mounted || (element === previousElement && handle === previousHandle)) return;
    removeRootListeners(previousElement, previousHandle);
    if (element) addRootListeners(element);
  }, { flush: 'sync' });

  onMounted(() => {
    mounted = true;
    addRootListeners(getRootElement());
  });

  onBeforeUnmount(() => {
    mounted = false;
    removeRootListeners(options.rootElement.value);
    cancelDragActions();
    try {
      if (dnd.inProgress && dnd.sourceController === controller) {
        dnd.cancelDrag(downEvent.value);
      }
    }
    finally {
      if (downEvent.value) finishDrag();
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
    finishTimer,
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
    onCancel,
    onKeyUp,
    cancelDragActions,
    finishDrag,
    createDragImage
  };
}
