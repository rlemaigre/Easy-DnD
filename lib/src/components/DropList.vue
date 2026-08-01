<script lang="ts">
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  TransitionGroup,
  watch,
  type Component,
  type PropType,
  type VNode
} from 'vue';
import { dropEmits, dropProps, useDrop } from '../composables/useDrop';
import type { DropProps } from '../composables/useDrop';
import DragFeedback from './DragFeedback.vue';
import Grid from '../js/Grid';
import { InsertEvent, ReorderEvent } from '../js/events';
import { createDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';
import type { DnDEventPayload, DragImage, DragType } from '../types';
import type { GridDirection } from '../js/Grid';

export default defineComponent({
  name: 'DropList',
  props: {
    ...dropProps,
    tag: {
      type: [String, Object, Function] as PropType<string | Component>,
      default: 'div'
    },
    items: {
      type: Array as PropType<unknown[]>,
      required: true
    },
    row: {
      type: Boolean,
      default: false
    },
    column: {
      type: Boolean,
      default: false
    },
    noAnimations: {
      type: Boolean,
      default: false
    },
    scrollingEdgeSize: {
      type: Number,
      default: undefined
    }
  },
  emits: [...dropEmits, 'reorder', 'insert'],
  setup (props, { emit, slots }) {
    const rootElement = ref<HTMLElement | null>(null);
    const feedbackElement = ref<HTMLElement | null>(null);
    const dragImageElement = ref<HTMLElement | null>(null);
    const grid = ref<Grid | null>(null);
    const forbiddenKeys = ref<PropertyKey[] | null>([]);
    const feedbackKey = ref<PropertyKey | null>(null);
    const fromIndex = ref<number | null>(null);
    const rootTag = computed(() => props.noAnimations ? props.tag : TransitionGroup);
    const rootProps = computed(() => props.noAnimations ? {} : { tag: props.tag, css: false });
    const direction = computed<GridDirection>(() => props.row ? 'row' : props.column ? 'column' : 'auto');
    const reordering = computed(() => dnd.inProgress
      ? dnd.sourceController?.getElement().parentElement === rootElement.value
      : null);
    const closestIndex = computed(() => grid.value && dnd.position
      ? grid.value.closestIndex(dnd.position)
      : null);

    const getDropAllowed = () => {
      if (!drop.dragInProgress.value) return null;
      if (reordering.value) return props.items.length > 1;
      if (!drop.baseDropAllowed.value) return false;
      if (forbiddenKeys.value !== null && feedbackKey.value !== null) {
        return !forbiddenKeys.value.includes(feedbackKey.value);
      }
      return true;
    };
    const handleDrop = (event: DnDEventPayload) => {
      if (reordering.value) {
        if (fromIndex.value !== null && closestIndex.value !== null && fromIndex.value !== closestIndex.value) {
          emit('reorder', new ReorderEvent(fromIndex.value, closestIndex.value));
        }
      }
      else {
        emit('drop', event);
        event.sourceController?.notifyDrop(props.mode, event);
        if (closestIndex.value !== null) {
          emit('insert', new InsertEvent(event.type, event.data, closestIndex.value));
        }
      }
    };
    const isCandidate = (type: DragType) => !!(drop.effectiveAcceptsType(type) || reordering.value);
    const makeDragImage = (): DragImage => {
      const element = dragImageElement.value;
      if (!element) return 'source';

      const model = element.childElementCount !== 1 ? element : element.children.item(0);
      if (!(model instanceof HTMLElement) || !rootElement.value) return 'source';
      const clone = model.cloneNode(true);
      rootElement.value.appendChild(clone);
      const image = createDragImage(clone as HTMLElement);
      rootElement.value.removeChild(clone);
      image.__opacity = props.dragImageOpacity;
      image.classList.add('dnd-ghost');
      return image;
    };
    const drop = useDrop(props as unknown as DropProps, emit, {
      rootElement,
      dragImageElement,
      getDropAllowed,
      doDrop: handleDrop,
      candidate: isCandidate,
      createDragImage: makeDragImage,
      getReordering: () => !!reordering.value,
      getScrollingEdgeSize: () => props.scrollingEdgeSize
    });

    const itemsBeforeFeedback = computed(() => closestIndex.value === 0
      ? []
      : props.items.slice(0, closestIndex.value ?? undefined));
    const itemsAfterFeedback = computed(() => closestIndex.value === props.items.length
      ? []
      : props.items.slice(closestIndex.value ?? undefined));
    const itemsBeforeReorderingFeedback = computed(() => (closestIndex.value ?? 0) <= (fromIndex.value ?? 0)
      ? props.items.slice(0, closestIndex.value ?? undefined)
      : props.items.slice(0, (closestIndex.value ?? -1) + 1));
    const itemsAfterReorderingFeedback = computed(() => (closestIndex.value ?? 0) <= (fromIndex.value ?? 0)
      ? props.items.slice(closestIndex.value ?? undefined)
      : props.items.slice((closestIndex.value ?? -1) + 1));
    const reorderedItems = computed(() => {
      const items = [...props.items];
      if (fromIndex.value === null || closestIndex.value === null) return items;
      const item = items[fromIndex.value];
      items.splice(fromIndex.value, 1);
      items.splice(closestIndex.value, 0, item);
      return items;
    });
    const clazz = computed(() => ({
      'drop-list': true,
      'reordering': reordering.value === true,
      'inserting': reordering.value === false,
      ...(reordering.value === false ? drop.cssClasses.value : { 'dnd-drop': true })
    }));
    const showDragFeedback = computed(() => drop.dragInProgress.value &&
      drop.typeAllowed.value && !reordering.value);
    const showInsertingDragImage = computed(() => drop.dragInProgress.value &&
      drop.typeAllowed.value && !reordering.value && !!slots['drag-image']);
    const showReorderingDragImage = computed(() => drop.dragInProgress.value &&
      reordering.value && !!slots['reordering-drag-image']);
    const computeForbiddenKeys = () => (props.noAnimations ? [] : props.items.flatMap((item, index) =>
      slots.item!({ item, index, reorder: false })))
      .map(vnode => vnode.key)
      .filter((key): key is PropertyKey => key !== null &&
        key !== 'drag-image' && key !== 'drag-feedback');
    const computeFeedbackKey = () => slots.feedback!({
      type: drop.dragType.value,
      data: drop.dragData.value
    })[0]?.key ?? null;
    const computeInsertingGrid = () => {
      if (!feedbackElement.value || feedbackElement.value.children.length < 1) return null;

      const feedback = feedbackElement.value.children[0];
      const clone = feedback.cloneNode(true);
      const element = rootElement.value;
      if (!element) return null;
      if (element.children.length > props.items.length) {
        element.insertBefore(clone, element.children[props.items.length]);
      }
      else {
        element.appendChild(clone);
      }
      try {
        return new Grid(element.children, props.items.length, direction.value, null);
      }
      finally {
        element.removeChild(clone);
      }
    };
    const computeReorderingGrid = () => rootElement.value && fromIndex.value !== null ? new Grid(
      rootElement.value.children,
      props.items.length - 1,
      direction.value,
      fromIndex.value
    ) : null;
    let refreshGeneration = 0;
    const refresh = async () => {
      const generation = ++refreshGeneration;
      await nextTick();
      if (generation !== refreshGeneration || !dnd.inProgress || reordering.value) return;
      grid.value = computeInsertingGrid();
      feedbackKey.value = computeFeedbackKey();
      forbiddenKeys.value = computeForbiddenKeys();
    };
    const onDragStart = (event: DnDEventPayload) => {
      if (!isCandidate(dnd.type)) return;
      if (reordering.value) {
        const sourceElement = event.sourceController?.getElement();
        if (!sourceElement?.parentElement) return;
        fromIndex.value = Array.prototype.indexOf.call(
          sourceElement.parentElement.children,
          sourceElement
        );
        grid.value = computeReorderingGrid();
      }
      else {
        refresh();
      }
    };
    const onDragEnd = () => {
      refreshGeneration++;
      fromIndex.value = null;
      feedbackKey.value = null;
      forbiddenKeys.value = null;
      grid.value = null;
    };
    const setRootElement = (vnode: VNode) => {
      rootElement.value = vnode.el as HTMLElement;
    };
    const setFeedbackElement = (vnode: VNode) => {
      feedbackElement.value = vnode.el as HTMLElement;
    };

    onMounted(() => {
      dnd.on('dragstart', onDragStart);
      dnd.on('dragend', onDragEnd);
    });
    onBeforeUnmount(() => {
      refreshGeneration++;
      dnd.off('dragstart', onDragStart);
      dnd.off('dragend', onDragEnd);
    });
    watch([() => props.items, () => props.items.length, direction], () => {
      if (!dnd.inProgress || !isCandidate(dnd.type)) return;
      if (reordering.value) {
        const generation = refreshGeneration;
        void nextTick(() => {
          if (generation !== refreshGeneration || !dnd.inProgress || !reordering.value) return;
          grid.value = computeReorderingGrid();
        });
      }
      else {
        void refresh();
      }
    });

    return {
      ...drop,
      rootElement,
      feedbackElement,
      dragImageElement,
      grid,
      forbiddenKeys,
      feedbackKey,
      fromIndex,
      rootTag,
      rootProps,
      direction,
      reordering,
      closestIndex,
      itemsBeforeFeedback,
      itemsAfterFeedback,
      itemsBeforeReorderingFeedback,
      itemsAfterReorderingFeedback,
      reorderedItems,
      clazz,
      showDragFeedback,
      showInsertingDragImage,
      showReorderingDragImage,
      refresh,
      onDragStart,
      onDragEnd,
      setRootElement,
      setFeedbackElement,
      computeForbiddenKeys,
      computeFeedbackKey,
      computeInsertingGrid,
      computeReorderingGrid
    };
  },
  render () {
    if (!this.$slots['item']) {
      throw 'The "Item" slot must be defined to use DropList';
    }

    if (!this.$slots['feedback']) {
      throw 'The "Feedback" slot must be defined to use DropList';
    }

    let defaultArr: VNode[] = [];
    if (this.dropIn && this.dropAllowed) {
      if (this.reordering) {
        if (this.$slots['reordering-feedback']) {
          const itemsReorderingBefore = this.itemsBeforeReorderingFeedback.map((item, index) => {
            return this.$slots['item']!({
              item: item,
              index: index,
              reorder: false
            })[0];
          });
          if (itemsReorderingBefore.length > 0) {
            defaultArr = defaultArr.concat(itemsReorderingBefore);
          }

          defaultArr.push(this.$slots['reordering-feedback']!({
            key: 'reordering-feedback',
            item: this.items[this.fromIndex!]
          })[0]);

          const itemsReorderingAfter = this.itemsAfterReorderingFeedback.map((item, index) => {
            return this.$slots['item']!({
              item: item,
              index: this.itemsBeforeReorderingFeedback.length + index,
              reorder: false
            })[0];
          });
          if (itemsReorderingAfter.length > 0) {
            defaultArr = defaultArr.concat(itemsReorderingAfter);
          }
        }
        else {
          const reorderedItems = this.reorderedItems.map((item, index) => {
            return this.$slots['item']!({
              item: item,
              index: index,
              reorder: index === this.closestIndex
            })[0];
          });
          if (reorderedItems.length > 0) {
            defaultArr = defaultArr.concat(reorderedItems);
          }
        }
      }
      else {
        const itemsBefore = this.itemsBeforeFeedback.map((item, index) => {
          return this.$slots['item']!({
            item: item,
            index: index,
            reorder: false
          })[0];
        });
        if (itemsBefore.length > 0) {
          defaultArr = defaultArr.concat(itemsBefore);
        }

        defaultArr.push(this.$slots['feedback']!({
          key: 'drag-feedback',
          data: this.dragData,
          type: this.dragType
        })[0]);

        const itemsAfter = this.itemsAfterFeedback.map((item, index) => {
          return this.$slots['item']!({
            item: item,
            index: this.itemsBeforeFeedback.length + index,
            reorder: false
          })[0];
        });
        if (itemsAfter.length > 0) {
          defaultArr = defaultArr.concat(itemsAfter);
        }
      }
    }
    else {
      const defaultItems = this.items.map((item, index) => {
        return this.$slots['item']!({
          item: item,
          index: index,
          reorder: false
        })[0];
      });

      if (defaultItems.length > 0) {
        defaultArr = defaultArr.concat(defaultItems);
      }
      else if (this.$slots['empty']) {
        defaultArr.push(this.$slots['empty']!()[0]);
      }
    }

    if (this.showDragFeedback) {
      defaultArr.push(h(
        DragFeedback,
        {
          class: '__feedback',
          key: 'drag-feedback',
          onVnodeMounted: this.setFeedbackElement,
          onVnodeUpdated: this.setFeedbackElement
        },
        {
          default: () => this.$slots['feedback']!({
            type: this.dragType,
            data: this.dragData
          })[0]
        }
      ));
    }

    if (this.showReorderingDragImage) {
      defaultArr.push(h(
        'div',
        {
          class: '__drag-image',
          ref: 'dragImageElement',
          key: 'reordering-drag-image'
        },
        this.$slots['reordering-drag-image']!({
          item: this.items[this.fromIndex!]
        })[0]
      ));
    }

    if (this.showInsertingDragImage) {
      defaultArr.push(h(
        'div',
        {
          class: '__drag-image',
          ref: 'dragImageElement',
          key: 'inserting-drag-image'
        },
        this.$slots['drag-image']!({
          type: this.dragType,
          data: this.dragData
        })[0]
      ));
    }

    return h(
      this.rootTag as string | Component,
      {
        class: this.clazz,
        onVnodeMounted: this.setRootElement,
        onVnodeUpdated: this.setRootElement,
        ...this.rootProps
      },
      {
        default: () => defaultArr
      }
    );
  }
});
</script>

<style scoped lang="scss">
.drop-list {
  &:deep(> *) {
    transition: transform .2s;
  }
}

.__feedback {
  display: none;
}

/* Places a drag image out of sight while keeping its computed styles accessibles. */
.__drag-image {
  position: fixed;
  top: -10000px;
  left: -10000px;
}
</style>

<style lang="scss">
.drop-allowed.drop-in * {
  cursor: inherit !important;
}

.drop-forbidden.drop-in {
  &, * {
    cursor: no-drop !important;
  }
}
</style>
