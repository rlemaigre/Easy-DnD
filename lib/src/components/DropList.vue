<script>
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  TransitionGroup
} from 'vue';
import { dropEmits, dropProps, useDrop } from '../composables/useDrop';
import DragFeedback from './DragFeedback.vue';
import Grid from '../js/Grid';
import { InsertEvent, ReorderEvent } from '../js/events';
import { createDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';

export default defineComponent({
  name: 'DropList',
  props: {
    ...dropProps,
    tag: {
      type: [String, Object, Function],
      default: 'div'
    },
    items: {
      type: Array,
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
    const instance = getCurrentInstance();
    const component = () => instance.proxy;
    const grid = ref(null);
    const forbiddenKeys = ref([]);
    const feedbackKey = ref(null);
    const fromIndex = ref(null);
    const rootTag = computed(() => props.noAnimations ? props.tag : TransitionGroup);
    const rootProps = computed(() => props.noAnimations ? {} : { tag: props.tag, css: false });
    const direction = computed(() => props.row ? 'row' : props.column ? 'column' : 'auto');
    const reordering = computed(() => dnd.inProgress
      ? dnd.source.$el.parentElement === component().$el
      : null);
    const closestIndex = computed(() => grid.value ? grid.value.closestIndex(dnd.position) : null);

    const getDropAllowed = () => {
      if (!drop.dragInProgress.value) return null;
      if (reordering.value) return props.items.length > 1;
      if (!drop.baseDropAllowed.value) return false;
      if (forbiddenKeys.value !== null && feedbackKey.value !== null) {
        return !forbiddenKeys.value.includes(feedbackKey.value);
      }
      return true;
    };
    const handleDrop = (event) => {
      if (reordering.value) {
        if (fromIndex.value !== closestIndex.value) {
          emit('reorder', new ReorderEvent(fromIndex.value, closestIndex.value));
        }
      }
      else {
        emit('drop', event);
        event.source.$emit(props.mode, event);
        emit('insert', new InsertEvent(event.type, event.data, closestIndex.value));
      }
    };
    const isCandidate = (type) => drop.effectiveAcceptsType(type) || reordering.value;
    const makeDragImage = () => {
      const proxy = component();
      const element = proxy.$refs['drag-image'];
      if (!element) return 'source';

      const model = element.childElementCount !== 1 ? element : element.children.item(0);
      const clone = model.cloneNode(true);
      proxy.$el.appendChild(clone);
      const image = createDragImage(clone);
      proxy.$el.removeChild(clone);
      image.__opacity = props.dragImageOpacity;
      image.classList.add('dnd-ghost');
      return image;
    };
    const drop = useDrop(props, emit, {
      getDropAllowed,
      doDrop: handleDrop,
      candidate: isCandidate,
      createDragImage: makeDragImage
    });

    const itemsBeforeFeedback = computed(() => closestIndex.value === 0
      ? []
      : props.items.slice(0, closestIndex.value));
    const itemsAfterFeedback = computed(() => closestIndex.value === props.items.length
      ? []
      : props.items.slice(closestIndex.value));
    const itemsBeforeReorderingFeedback = computed(() => closestIndex.value <= fromIndex.value
      ? props.items.slice(0, closestIndex.value)
      : props.items.slice(0, closestIndex.value + 1));
    const itemsAfterReorderingFeedback = computed(() => closestIndex.value <= fromIndex.value
      ? props.items.slice(closestIndex.value)
      : props.items.slice(closestIndex.value + 1));
    const reorderedItems = computed(() => {
      const items = [...props.items];
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
    const hasReorderingFeedback = computed(() => !!slots['reordering-feedback']);
    const hasEmptySlot = computed(() => !!slots['empty']);

    const computeForbiddenKeys = () => (props.noAnimations
      ? []
      : component().$refs.component.$slots.default())
      .map(vnode => vnode.key)
      .filter(key => !!key && key !== 'drag-image' && key !== 'drag-feedback');
    const computeFeedbackKey = () => component().$refs.feedback.$slots.default()[0].key;
    const computeInsertingGrid = () => {
      const proxy = component();
      if (proxy.$refs.feedback.$el.children.length < 1) return null;

      const feedback = proxy.$refs.feedback.$el.children[0];
      const clone = feedback.cloneNode(true);
      const element = proxy.$el;
      if (element.children.length > props.items.length) {
        element.insertBefore(clone, element.children[props.items.length]);
      }
      else {
        element.appendChild(clone);
      }
      const result = new Grid(element.children, props.items.length, direction.value, null);
      element.removeChild(clone);
      return result;
    };
    const computeReorderingGrid = () => new Grid(
      component().$el.children,
      props.items.length - 1,
      direction.value,
      fromIndex.value
    );
    const refresh = async () => {
      await nextTick();
      grid.value = computeInsertingGrid();
      feedbackKey.value = computeFeedbackKey();
      forbiddenKeys.value = computeForbiddenKeys();
    };
    const onDragStart = (event) => {
      if (!isCandidate(dnd.type)) return;
      if (reordering.value) {
        fromIndex.value = Array.prototype.indexOf.call(
          event.source.$el.parentElement.children,
          event.source.$el
        );
        grid.value = computeReorderingGrid();
      }
      else {
        refresh();
      }
    };
    const onDragEnd = () => {
      fromIndex.value = null;
      feedbackKey.value = null;
      forbiddenKeys.value = null;
      grid.value = null;
    };

    onMounted(() => {
      dnd.on('dragstart', onDragStart);
      dnd.on('dragend', onDragEnd);
    });
    onBeforeUnmount(() => {
      dnd.off('dragstart', onDragStart);
      dnd.off('dragend', onDragEnd);
    });

    return {
      ...drop,
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
      hasReorderingFeedback,
      hasEmptySlot,
      refresh,
      onDragStart,
      onDragEnd,
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

    let defaultArr = [];
    if (this.dropIn && this.dropAllowed) {
      if (this.reordering) {
        if (this.hasReorderingFeedback) {
          const itemsReorderingBefore = this.itemsBeforeReorderingFeedback.map((item, index) => {
            return this.$slots['item']({
              item: item,
              index: index,
              reorder: false
            })[0];
          });
          if (itemsReorderingBefore.length > 0) {
            defaultArr = defaultArr.concat(itemsReorderingBefore);
          }

          defaultArr.push(this.$slots['reordering-feedback']({
            key: 'reordering-feedback',
            item: this.items[this.fromIndex]
          })[0]);

          const itemsReorderingAfter = this.itemsAfterReorderingFeedback.map((item, index) => {
            return this.$slots['item']({
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
            return this.$slots['item']({
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
          return this.$slots['item']({
            item: item,
            index: index,
            reorder: false
          })[0];
        });
        if (itemsBefore.length > 0) {
          defaultArr = defaultArr.concat(itemsBefore);
        }

        defaultArr.push(this.$slots['feedback']({
          key: 'drag-feedback',
          data: this.dragData,
          type: this.dragType
        })[0]);

        const itemsAfter = this.itemsAfterFeedback.map((item, index) => {
          return this.$slots['item']({
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
        return this.$slots['item']({
          item: item,
          index: index,
          reorder: false
        })[0];
      });

      if (defaultItems.length > 0) {
        defaultArr = defaultArr.concat(defaultItems);
      }
      else if (this.hasEmptySlot) {
        defaultArr.push(this.$slots['empty']()[0]);
      }
    }

    if (this.showDragFeedback) {
      defaultArr.push(h(
        DragFeedback,
        {
          class: '__feedback',
          ref: 'feedback',
          key: 'drag-feedback'
        },
        {
          default: () => this.$slots['feedback']({
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
          ref: 'drag-image',
          key: 'reordering-drag-image'
        },
        {
          default: () => this.$slots['reordering-drag-image']({
            item: this.items[this.fromIndex]
          })[0]
        }
      ));
    }

    if (this.showInsertingDragImage) {
      defaultArr.push(h(
        'div',
        {
          class: '__drag-image',
          ref: 'drag-image',
          key: 'inserting-drag-image'
        },
        {
          default: () => this.$slots['drag-image']({
            type: this.dragType,
            data: this.dragData
          })[0]
        }
      ));
    }

    return h(
      this.rootTag,
      {
        ref: 'component',
        class: this.clazz,
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
  will-change: left, top;
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
