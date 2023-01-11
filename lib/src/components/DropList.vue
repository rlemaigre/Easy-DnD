<script>
import { TransitionGroup, h } from 'vue';
import DropMixin, { dropAllowed, doDrop, candidate } from '../mixins/DropMixin';
import DragFeedback from './DragFeedback.vue';
import Grid from '../js/Grid';
import { InsertEvent, ReorderEvent } from '../js/events';
import { createDragImage } from '../js/createDragImage';
import { dnd } from '../js/DnD';

export default {
  name: 'DropList',
  mixins: [DropMixin],
  props: {
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
  emits: ['reorder', 'insert'],
  data () {
    return {
      grid: null,
      forbiddenKeys: [],
      feedbackKey: null,
      fromIndex: null
    };
  },
  computed: {
    rootTag () {
      if (this.noAnimations) {
        return this.tag;
      }
      return TransitionGroup;
    },
    rootProps () {
      if (this.noAnimations) {
        return this.$attrs;
      }

      return {
        tag: this.tag,
        css: false
      };
    },
    direction () {
      // todo - rewrite this logic
      if (this.row) return 'row';
      if (this.column) return 'column';
      return 'auto';
    },
    reordering () {
      if (dnd.inProgress) {
        return dnd.source.$el.parentElement === this.$el;
      }
      return null;
    },
    closestIndex () {
      if (this.grid) {
        return this.grid.closestIndex(dnd.position);
      }
      return null;
    },
    dropAllowed () {
      if (this.dragInProgress) {
        if (this.reordering) {
          return this.items.length > 1;
        }
        else {
          // todo - eventually refactor so that this isn't necessary
          if (!dropAllowed(this)) {
            return false;
          }

          if (this.forbiddenKeys !== null && this.feedbackKey !== null) {
            return !this.forbiddenKeys.includes(this.feedbackKey);
          }
        }
      }

      return null;
    },
    itemsBeforeFeedback () {
      if (this.closestIndex === 0) {
        return [];
      }
      return this.items.slice(0, this.closestIndex);
    },
    itemsAfterFeedback () {
      if (this.closestIndex === this.items.length) {
        return [];
      }
      return this.items.slice(this.closestIndex);
    },
    itemsBeforeReorderingFeedback () {
      if (this.closestIndex <= this.fromIndex) {
        return this.items.slice(0, this.closestIndex);
      }
      return this.items.slice(0, this.closestIndex + 1);
    },
    itemsAfterReorderingFeedback () {
      if (this.closestIndex <= this.fromIndex) {
        return this.items.slice(this.closestIndex);
      }
      return this.items.slice(this.closestIndex + 1);
    },
    reorderedItems () {
      const toIndex = this.closestIndex;
      const reordered = [...this.items];
      const temp = reordered[this.fromIndex];

      reordered.splice(this.fromIndex, 1);
      reordered.splice(toIndex, 0, temp);
      return reordered;
    },
    clazz () {
      return {
        'drop-list': true,
        'reordering': this.reordering === true,
        'inserting': this.reordering === false,
        ...(this.reordering === false ? this.cssClasses : { 'dnd-drop': true })
      };
    },
    style () {
      if (this.reordering === false) {
        return this.cssStyle;
      }
      return {};
    },
    showDragFeedback () {
      return this.dragInProgress && this.typeAllowed && !this.reordering;
    },
    showInsertingDragImage () {
      return this.dragInProgress && this.typeAllowed && !this.reordering && !!this.$slots['drag-image'];
    },
    showReorderingDragImage () {
      return this.dragInProgress && this.reordering && !!this.$slots['reordering-drag-image'];
    },
    hasReorderingFeedback () {
      return !!this.$slots['reordering-feedback'];
    },
    hasEmptySlot () {
      return !!this.$slots['empty'];
    }
  },
  created () {
    dnd.on('dragstart', this.onDragStart);
    dnd.on('dragend', this.onDragEnd);
  },
  beforeUnmount () {
    dnd.off('dragstart', this.onDragStart);
    dnd.off('dragend', this.onDragEnd);
  },
  methods: {
    // Presence of feedback node in the DOM and of keys in the virtual DOM required => delayed until what
    // depends on drag data has been processed.
    refresh () {
      this.$nextTick(() => {
        this.grid = this.computeInsertingGrid();
        this.feedbackKey = this.computeFeedbackKey();
        this.forbiddenKeys = this.computeForbiddenKeys();
      });
    },
    onDragStart (event) {
      if (this.candidate(dnd.type)) {
        if (this.reordering) {
          this.fromIndex = Array.prototype.indexOf.call(event.source.$el.parentElement.children, event.source.$el);
          this.grid = this.computeReorderingGrid();
        }
        else {
          this.refresh();
        }
      }
    },
    onDragEnd () {
      this.fromIndex = null;
      this.feedbackKey = null;
      this.forbiddenKeys = null;
      this.grid = null;
    },
    doDrop (event) {
      if (this.reordering) {
        if (this.fromIndex !== this.closestIndex) {
          this.$emit('reorder', new ReorderEvent(
            this.fromIndex,
            this.closestIndex
          ));
        }
      }
      else {
        // todo - eventually remove the need for this
        doDrop(this, event);
        this.$emit('insert', new InsertEvent(
          event.type,
          event.data,
          this.closestIndex
        ));
      }
    },
    candidate (type) {
      return candidate(this, type) || this.reordering;
    },
    computeForbiddenKeys () {
      return (this.noAnimations ? [] : this.$refs.component.$slots['default']())
        .map(vn => vn.key)
        .filter(k => !!k && k !== 'drag-image' && k !== 'drag-feedback');
    },
    computeFeedbackKey () {
      return this.$refs['feedback']['$slots']['default']()[0]['key'];
    },
    computeInsertingGrid () {
      if (this.$refs.feedback.$el.children.length < 1) {
        return null;
      }

      const feedback = this.$refs.feedback.$el.children[0];
      const clone = feedback.cloneNode(true);
      const tg = this.$el;
      if (tg.children.length > this.items.length) {
        tg.insertBefore(clone, tg.children[this.items.length]);
      }
      else {
        tg.appendChild(clone);
      }
      const grid = new Grid(tg.children, this.items.length, this.direction, null);
      tg.removeChild(clone);
      return grid;
    },
    computeReorderingGrid () {
      return new Grid(this.$el.children, this.items.length - 1, this.direction, this.fromIndex);
    },
    createDragImage () {
      let image;
      if (this.$refs['drag-image']) {
        const el = this.$refs['drag-image'];
        let model;
        if (el.childElementCount !== 1) {
          model = el;
        }
        else {
          model = el.children.item(0);
        }
        const clone = model.cloneNode(true);
        const tg = this.$el;
        tg.appendChild(clone);
        image = createDragImage(clone);
        tg.removeChild(clone);
        image['__opacity'] = this.dragImageOpacity;
        image.classList.add('dnd-ghost');
      }
      else {
        image = 'source';
      }
      return image;
    }
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
        style: this.style,
        ...this.rootProps
      },
      {
        default: () => defaultArr
      }
    );
  }
};
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
