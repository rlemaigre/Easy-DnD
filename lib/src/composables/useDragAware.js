import { computed, ref } from 'vue';
import { dnd } from '../js/DnD';

export function useDragAware () {
  return {
    isDropMask: ref(false),
    dragInProgress: computed(() => dnd.inProgress),
    dragData: computed(() => dnd.data),
    dragType: computed(() => dnd.type),
    dragPosition: computed(() => dnd.position),
    dragSource: computed(() => dnd.source),
    dragTop: computed(() => dnd.top)
  };
}
