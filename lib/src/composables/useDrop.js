import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import { createDragImage as cloneDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';
import { useDragAware } from './useDragAware';

export const dropProps = {
  acceptsType: {
    type: [String, Array, Function],
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

export function useDrop (props, emit, options = {}) {
  const instance = getCurrentInstance();
  const component = () => instance.proxy;
  const dragAware = useDragAware();
  const isDrop = ref(true);

  const effectiveAcceptsType = (type) => {
    if (props.acceptsType === null) {
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

  const effectiveAcceptsData = (data, type) => props.acceptsData(data, type);
  const compatibleMode = computed(() => dragAware.dragInProgress.value ? true : null);
  const dropIn = computed(() => dragAware.dragInProgress.value ? dragAware.dragTop.value === component() : null);
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
    const classes = { 'dnd-drop': true };
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

  const defaultDoDrop = (event) => {
    emit('drop', event);
    event.source.$emit(props.mode, event);
  };
  const doDrop = (event) => options.doDrop ? options.doDrop(event) : defaultDoDrop(event);
  const candidate = (type) => options.candidate
    ? options.candidate(type)
    : effectiveAcceptsType(type);
  const createDragImage = () => {
    if (options.createDragImage) {
      return options.createDragImage();
    }

    let image = 'source';
    const element = component().$refs['drag-image'];
    if (element) {
      image = cloneDragImage(element.childElementCount !== 1 ? element : element.children.item(0));
      image.__opacity = props.dragImageOpacity;
      image.classList.add('dnd-ghost');
    }
    return image;
  };

  const onDragPositionChanged = (event) => {
    if (component() === event.top) emit('dragover', event);
  };
  const onDragTopChanged = (event) => {
    if (component() === event.top) emit('dragenter', event);
    if (component() === event.previousTop) emit('dragleave', event);
  };
  const onDragEnd = (event) => {
    if (component() === event.top) emit('dragend', event);
  };
  const onDrop = (event) => {
    if (dropIn.value && compatibleMode.value && dropAllowed.value) doDrop(event);
  };
  const onDnDMove = (event) => dnd.mouseMove(event, component());

  onMounted(() => {
    dnd.on('dragpositionchanged', onDragPositionChanged);
    dnd.on('dragtopchanged', onDragTopChanged);
    dnd.on('drop', onDrop);
    dnd.on('dragend', onDragEnd);
    component().$el.addEventListener('easy-dnd-move', onDnDMove);
  });

  onBeforeUnmount(() => {
    component().$el.removeEventListener('easy-dnd-move', onDnDMove);
    dnd.off('dragpositionchanged', onDragPositionChanged);
    dnd.off('dragtopchanged', onDragTopChanged);
    dnd.off('drop', onDrop);
    dnd.off('dragend', onDragEnd);
  });

  return {
    ...dragAware,
    isDrop,
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
