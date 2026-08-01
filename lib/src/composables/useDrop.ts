import { computed, getCurrentInstance, markRaw, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { createDragImage as cloneDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';
import { useDragAware } from './useDragAware';
import type {
  DnDEmit,
  DnDEventPayload,
  DragData,
  DragImage,
  DragType,
  DropController
} from '../types';

export interface DropProps {
  acceptsType?: DragType | unknown[] | ((type: DragType) => boolean) | null;
  acceptsData: (data: DragData, type: DragType) => boolean;
  mode: string;
  dragImageOpacity: number;
}

export interface DropOptions {
  rootElement: Ref<HTMLElement | null>;
  dragImageElement?: Ref<HTMLElement | null>;
  getScrollingEdgeSize?: () => number | undefined;
  getScrollingPropagation?: () => boolean | undefined;
  getReordering?: () => boolean;
  getDropAllowed?: () => boolean | null;
  doDrop?: (event: DnDEventPayload) => void;
  candidate?: (type: DragType, data: DragData, sourceController: DnDEventPayload['sourceController']) => boolean;
  createDragImage?: () => DragImage;
}

export const dropProps = {
  acceptsType: {
    type: [String, Number, Array, Function],
    default: null
  },
  acceptsData: {
    type: Function,
    default: () => true
  },
  mode: {
    type: String,
    default: 'copy'
  },
  dragImageOpacity: {
    type: Number,
    default: 0.7
  }
};

export const dropEmits = ['dragover', 'dragenter', 'dragleave', 'dragend', 'drop'];
const isDrop = ref(true);
const compatibleMode = computed(() => dnd.inProgress ? true : null);

export function useDrop (props: DropProps, emit: DnDEmit, options: DropOptions) {
  const instance = getCurrentInstance()!;
  const component = instance.proxy;
  const getRootElement = (): HTMLElement => {
    const element = options.rootElement.value;
    if (!element) {
      throw new TypeError('Easy-DnD Drop requires its tag component to render a single HTML root element.');
    }
    return element;
  };
  const dragAware = useDragAware();
  const controller: DropController = markRaw({
    get component () {
      return instance.exposeProxy ?? component;
    },
    isDropMask: false as const,
    getElement: getRootElement,
    getMode: () => props.mode,
    getScrollingEdgeSize: () => options.getScrollingEdgeSize?.(),
    getScrollingPropagation: () => options.getScrollingPropagation?.(),
    getCompatibleMode: () => compatibleMode.value,
    getDropAllowed: () => dropAllowed.value,
    getReordering: () => options.getReordering?.() ?? false,
    candidate: (type, data, sourceController) => candidate(type, data, sourceController),
    createDragImage: () => createDragImage(),
    notifyDragPosition: (event) => onDragPositionChanged(event),
    notifyDragTopChanged: (event) => onDragTopChanged(event),
    notifyDrop: (event) => onDrop(event),
    notifyDragEnd: (event) => onDragEnd(event)
  });

  const effectiveAcceptsType = (type: DragType): boolean => {
    if (props.acceptsType == null) {
      return true;
    }
    else if (typeof props.acceptsType === 'string' || typeof props.acceptsType === 'number') {
      return props.acceptsType === type;
    }
    else if (Array.isArray(props.acceptsType)) {
      return props.acceptsType.includes(type);
    }
    return props.acceptsType(type);
  };

  const effectiveAcceptsData = (data: DragData, type: DragType): boolean =>
    props.acceptsData(data, type);
  const dropIn = computed(() => dragAware.dragInProgress.value ? dnd.topController === controller : null);
  const typeAllowed = computed(() => dragAware.dragInProgress.value
    ? effectiveAcceptsType(dragAware.dragType.value)
    : null);
  const baseDropAllowed = computed(() => {
    if (dragAware.dragInProgress.value && typeAllowed.value) {
      return compatibleMode.value && effectiveAcceptsData(dragAware.dragData.value, dragAware.dragType.value);
    }
    return null;
  });
  const dropAllowed = computed(() => options.getDropAllowed
    ? options.getDropAllowed()
    : baseDropAllowed.value);
  const cssClasses = computed(() => {
    const classes: Record<string, boolean> = { 'dnd-drop': true };
    if (dropIn.value !== null) {
      classes['drop-in'] = dropIn.value;
      classes['drop-out'] = !dropIn.value;
    }
    if (typeAllowed.value !== null) {
      classes['type-allowed'] = typeAllowed.value;
      classes['type-forbidden'] = !typeAllowed.value;
    }
    if (dropAllowed.value !== null) {
      classes['drop-allowed'] = dropAllowed.value;
      classes['drop-forbidden'] = !dropAllowed.value;
    }
    return classes;
  });

  const defaultDoDrop = (event: DnDEventPayload) => {
    emit('drop', event);
    event.sourceController?.notifyDrop(props.mode, event);
  };
  const doDrop = (event: DnDEventPayload) => options.doDrop ? options.doDrop(event) : defaultDoDrop(event);
  const candidate = (
    type: DragType,
    data: DragData,
    sourceController: DnDEventPayload['sourceController']
  ) => options.candidate
    ? options.candidate(type, data, sourceController)
    : effectiveAcceptsType(type);
  const createDragImage = (): DragImage => {
    if (options.createDragImage) {
      return options.createDragImage();
    }

    let image: DragImage = 'source';
    const element = options.dragImageElement?.value;
    if (element) {
      const model = element.childElementCount !== 1 ? element : element.children.item(0);
      if (!(model instanceof HTMLElement)) return 'source';
      image = cloneDragImage(model);
      image.__opacity = props.dragImageOpacity;
      image.classList.add('dnd-ghost');
    }
    return image;
  };

  const onDragPositionChanged = (event: DnDEventPayload) => {
    if (controller === event.topController) emit('dragover', event);
  };
  const onDragTopChanged = (event: DnDEventPayload) => {
    if (controller === event.topController) emit('dragenter', event);
    if (controller === event.previousTopController) emit('dragleave', event);
  };
  const onDragEnd = (event: DnDEventPayload) => {
    if (controller === event.topController) emit('dragend', event);
  };
  const onDrop = (event: DnDEventPayload) => {
    if (dropIn.value && compatibleMode.value && dropAllowed.value) doDrop(event);
  };
  const onDnDMove = (event: Event) => dnd.mouseMove(event as CustomEvent, controller);

  let mounted = false;
  watch(options.rootElement, (element, previousElement) => {
    if (!mounted || element === previousElement) return;
    previousElement?.removeEventListener('easy-dnd-move', onDnDMove);
    element?.addEventListener('easy-dnd-move', onDnDMove);
  }, { flush: 'sync' });

  onMounted(() => {
    mounted = true;
    getRootElement().addEventListener('easy-dnd-move', onDnDMove);
  });

  onBeforeUnmount(() => {
    mounted = false;
    if (dnd.topController === controller) dnd.clearTop();
    options.rootElement.value?.removeEventListener('easy-dnd-move', onDnDMove);
  });

  return {
    ...dragAware,
    isDrop,
    controller,
    compatibleMode,
    dropIn,
    typeAllowed,
    baseDropAllowed,
    dropAllowed,
    cssClasses,
    effectiveAcceptsType,
    effectiveAcceptsData,
    doDrop,
    candidate,
    createDragImage,
    onDnDMove
  };
}
