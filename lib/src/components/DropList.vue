<template>
    <component :is="rootTag" v-bind="rootProps" :class="clazz" :style="style">
      {{ reordering }}
        <template v-if="dropIn && dropAllowed">
            <template v-if="reordering">
                <template v-if="hasReorderingFeedback">
                    <slot name="item" v-for="(item, index) in itemsBeforeReorderingFeedback" :item="item"
                        :index="index" />
                    <slot name="reordering-feedback" :item="items[fromIndex]"/>
                    <slot name="item" v-for="(item, index) in itemsAfterReorderingFeedback" :item="item"
                        :index="itemsBeforeReorderingFeedback.length + index" />
                </template>
                <template v-else>
                    <slot name="item" v-for="(item, index) in reorderedItems" :item="item"
                        :index="index"
                        :reorder="index === closestIndex"/>
                </template>
            </template>
            <template v-else>
                <slot name="item" v-for="(item, index) in itemsBeforeFeedback" :item="item" :reorder="false"
                     :index="index"/>
                <slot name="feedback" :data="dragData" :type="dragType"/>
                <slot name="item" v-for="(item, index) in itemsAfterFeedback" :item="item" :reorder="false"
                     :index="itemsBeforeFeedback.length + index"/>
            </template>
        </template>
        <template v-else>
            <slot name="item" v-for="(item, index) in items" :item="item" :reorder="false" :index="index"/>
            <slot name="empty" v-if="items.length < 1" />
        </template>
        <drag-feedback class="__feedback" v-if="showDragFeedback" ref="feedback" key="drag-feedback">
            <slot name="feedback" :data="dragData" :type="dragType"/>
        </drag-feedback>
        <div class="__drag-image" v-if="showInsertingDragImage" ref="drag-image" key="inserting-drag-image">
            <slot name="drag-image" :type="dragType" :data="dragData"/>
        </div>
        <div class="__drag-image" v-if="showReorderingDragImage" ref="drag-image" key="reordering-drag-image">
            <slot name="reordering-drag-image" :item="items[fromIndex]"/>
        </div>
        <slot />
    </component>
</template>

<script>
import DropMixin, { dropAllowed, doDrop, candidate } from "../mixins/DropMixin";
import DragFeedback from "./DragFeedback";
import Grid from "../js/Grid";
import {InsertEvent, ReorderEvent} from "../js/events";
import {createDragImage} from "../js/createDragImage"
import {dnd} from "../js/DnD";

export default {
  name: 'DropList',
  mixins: [DropMixin],
  components: {
    DragFeedback
  },
  props: {
    tag: {
      type: [String, Object, Function],
      default: 'div'
    },
    items: {
      type: Array
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
  data () {
    return {
      grid: null,
      forbiddenKeys: [],
      feedbackKey: null,
      fromIndex: null
    }
  },
  computed: {
    rootTag() {
      if (this.noAnimations) {
        return this.tag || 'div';
      } else {
        return "transition-group";
      }
    },
    rootProps() {
      if (this.noAnimations) {
        return this.$attrs;
      } else {
        return {
          tag: this.tag,
          duration: {enter: 0, leave: 0},
          css: false
        }
      }
    },
    direction() {
      // todo - rewrite this logic
      if (this.row) return 'row';
      if (this.column) return 'column';
      return 'auto';
    },
    reordering() {
      if (dnd.inProgress) {
        // todo - was $listeners instead of $attrs
        return dnd.source.$el.parentElement === this.$el && this.$attrs.hasOwnProperty('onReorder');
      } else {
        return null;
      }
    },
    closestIndex() {
      if (this.grid) {
        return this.grid.closestIndex(dnd.position);
      } else {
        return null;
      }
    },
    dropAllowed() {
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
            return !this.forbiddenKeys.includes(this.feedbackKey)
          }
        }
      }

      return null;
    },
    itemsBeforeFeedback() {
      if (this.closestIndex === 0) {
        return [];
      } else {
        return this.items.slice(0, this.closestIndex);
      }
    },
    itemsAfterFeedback() {
      if (this.closestIndex === this.items.length) {
        return [];
      } else {
        return this.items.slice(this.closestIndex);
      }
    },
    itemsBeforeReorderingFeedback() {
      if (this.closestIndex <= this.fromIndex) {
        return this.items.slice(0, this.closestIndex);
      } else {
        return this.items.slice(0, this.closestIndex + 1);
      }
    },
    itemsAfterReorderingFeedback() {
      if (this.closestIndex <= this.fromIndex) {
        return this.items.slice(this.closestIndex);
      } else {
        return this.items.slice(this.closestIndex + 1);
      }
    },
    reorderedItems() {
      let toIndex = this.closestIndex;
      let reordered = [...this.items];
      let temp = reordered[this.fromIndex];
      reordered.splice(this.fromIndex, 1);
      reordered.splice(toIndex, 0, temp);
      return reordered;
    },
    clazz() {
      return {
        'drop-list': true,
        'reordering': this.reordering === true,
        'inserting': this.reordering === false,
        ...(this.reordering === false ? this.cssClasses : {'dnd-drop': true})
      };
    },
    style() {
      return {
        ...(this.reordering === false ? this.cssStyle : {})
      };
    },
    showDragFeedback() {
      return this.dragInProgress && this.typeAllowed && !this.reordering;
    },
    showInsertingDragImage() {
      return this.dragInProgress && this.typeAllowed && !this.reordering && this.$slots.hasOwnProperty("drag-image");
    },
    showReorderingDragImage() {
      return this.dragInProgress && this.reordering && this.$slots.hasOwnProperty("reordering-drag-image");
    },
    hasReorderingFeedback() {
      return this.$slots.hasOwnProperty("reordering-feedback");
    }
  },
  methods: {
    // Presence of feedback node in the DOM and of keys in the virtual DOM required => delayed until what
    // depends on drag data has been processed.
    async refresh () {
      await this.$nextTick()
      this.grid = this.computeInsertingGrid();
      this.feedbackKey = this.computeFeedbackKey();
      this.forbiddenKeys = this.computeForbiddenKeys();
    },
    onDragStart(event) {
      if (this.candidate(dnd.type)) {
        if (this.reordering) {
          this.fromIndex = Array.prototype.indexOf.call(event.source.$el.parentElement.children, event.source.$el);
          this.grid = this.computeReorderingGrid();
        } else {
          this.refresh()
        }
      }
    },
    onDragEnd() {
      this.fromIndex = null;
      this.feedbackKey = null;
      this.forbiddenKeys = null;
      this.grid = null;
    },
    doDrop(event) {
      if (this.reordering) {
        if (this.fromIndex !== this.closestIndex) {
          this.$emit('reorder', new ReorderEvent(
              this.fromIndex,
              this.closestIndex
          ));
        }
      } else {
        // todo - eventually remove the need for this
        doDrop(this, event)
        this.$emit('insert', new InsertEvent(
            event.type,
            event.data,
            this.closestIndex
        ));
      }
    },
    candidate(type) {
      // todo - was $listeners instead of $attrs
      return (candidate(this, type) && (this.$attrs.hasOwnProperty("onInsert") || this.$attrs.hasOwnProperty("onDrop"))) || this.reordering;
    },
    computeForbiddenKeys() {
      // todo - go over all usages of $children
      let vnodes = this.noAnimations ? [] : this.$children[0].$vnode.context.$children[0].$slots.default;
      return vnodes
          .map(vn => vn.key)
          .filter(k => k !== undefined && k !== 'drag-image' && k !== 'drag-feedback');
    },
    computeFeedbackKey() {
      console.log(this.$refs.feedback)
      return this.$refs['feedback']['$slots']['default'][0]['key'];
    },
    computeInsertingGrid() {
      let feedbackParent = this.$refs['feedback']['$el']; // todo -  as HTMLElement
      let feedback = feedbackParent.children[0];
      let clone = feedback.cloneNode(true); // todo -  as HTMLElement
      let tg = this.$el; // todo -  as HTMLElement
      if (tg.children.length > this.items.length) {
        tg.insertBefore(clone, tg.children[this.items.length]);
      } else {
        tg.appendChild(clone);
      }
      let grid = new Grid(tg.children, this.items.length, this.direction, null);
      tg.removeChild(clone);
      return grid;
    },
    computeReorderingGrid() {
      return new Grid(this.$el.children, this.items.length - 1, this.direction, this.fromIndex); // todo - $el as HTMLElement
    },
    createDragImage() {
      let image;
      if (this.$refs['drag-image']) {
        let el = this.$refs['drag-image']; // todo -  as HTMLElement
        let model;
        if (el.childElementCount !== 1) {
          model = el;
        } else {
          model = el.children.item(0);
        }
        let clone = model.cloneNode(true); // todo -  as HTMLElement
        let tg = this.$el; // todo -  as HTMLElement
        tg.appendChild(clone);
        image = createDragImage(clone);
        tg.removeChild(clone);
        image['__opacity'] = this.dragImageOpacity;
        image.classList.add('dnd-ghost')
      } else {
        image = 'source';
      }
      return image;
    }
  },
  created() {
    dnd.on("dragstart", this.onDragStart);
    dnd.on("dragend", this.onDragEnd);
  },
  beforeUnmount() {
    dnd.off("dragstart", this.onDragStart);
    dnd.off("dragend", this.onDragEnd);
  }
}
</script>

<style scoped lang="scss">
.drop-list {
  &::v-deep > * {
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

.drop-list:not(.drop-in) {
  &::v-deep .drag-source {
    // transition: none !important;
  }
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
