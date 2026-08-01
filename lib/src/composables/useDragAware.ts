import { computed, ref } from 'vue';
import { dnd } from '../js/DnD';

const dragAware = {
  isDropMask: ref(false),
  dragInProgress: computed(() => dnd.inProgress),
  dragData: computed(() => dnd.data),
  dragType: computed(() => dnd.type),
  dragPosition: computed(() => dnd.position),
  dragSource: computed(() => dnd.source),
  dragTop: computed(() => dnd.top)
};

export function useDragAware () {
  return dragAware;
}
