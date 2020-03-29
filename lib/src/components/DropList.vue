<template>
    <transition-group :tag="tag"
                      ref="tg" :duration="{enter: 0, leave: 0}" :css="false" :class="clazz" :style="style">
        <template v-if="dropIn && dropAllowed">
            <template v-if="reordering">
                <slot name="item" v-for="(item, index) in reorderedItems" :item="item"
                      :reorder="index === closestIndex"/>
            </template>
            <template v-else>
                <slot name="item" v-for="item in itemsBeforeFeedback" :item="item" :reorder="false"/>
                <slot name="feedback" :data="dragData" :type="dragType"/>
                <slot name="item" v-for="item in itemsAfterFeedback" :item="item" :reorder="false"/>
            </template>
        </template>
        <template v-else>
            <slot name="item" v-for="item in items" :item="item" :reorder="false"/>
        </template>
        <drag-feedback class="feedback" v-if="showDragFeedback" ref="feedback" key="drag-feedback">
            <slot name="feedback" :data="dragData" :type="dragType"/>
        </drag-feedback>
        <div class="__drag-image" v-if="showInsertingDragImage" ref="drag-image" key="inserting-drag-image">
            <slot name="drag-image" :type="dragType" :data="dragData"/>
        </div>
        <div class="__drag-image" v-if="showReorderingDragImage" ref="drag-image" key="reordering-drag-image">
            <slot name="reordering-drag-image" :item="items[fromIndex]"/>
        </div>
        <div key="drop-list-content">
            <slot/>
        </div>
    </transition-group>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import DropMixin from "../mixins/DropMixin";
    import DragFeedback from "./DragFeedback.vue";
    import Grid from "../ts/Grid";
    import {DnDEvent, InsertEvent, ReorderEvent} from "../ts/events";
    import {createDragImage} from "../ts/createDragImage"
    import {dnd} from "../ts/DnD";

    @Component({
        components: {DragFeedback}
    })
    export default class DropList extends DropMixin {

        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        @Prop()
        items: any[];

        grid: Grid = null;
        forbiddenKeys = [];
        feedbackKey = null;
        fromIndex: number = null;

        created() {
            dnd.on("dragstart", this.onDragStart);
            dnd.on("dragend", this.onDragEnd);
        }

        destroyed() {
            dnd.off("dragstart", this.onDragStart);
            dnd.off("dragend", this.onDragEnd);
        }

        onDragStart(event: DnDEvent) {
            if (this.reordering) {
                this.fromIndex = Array.prototype.indexOf.call(event.source.$el.parentElement.children, event.source.$el);
                this.grid = this.computeReorderingGrid();
            } else {
                this.$nextTick(() => {
                    // Presence of feedback node in the DOM and of keys in the virtual DOM required => delayed until what
                    // depends on drag data has been processed.
                    this.grid = this.computeInsertingGrid();
                    this.feedbackKey = this.computeFeedbackKey();
                    this.forbiddenKeys = this.computeForbiddenKeys();
                });
            }
        }

        onDragEnd() {
            this.fromIndex = null;
            this.feedbackKey = null;
            this.forbiddenKeys = null;
            this.grid = null;
        }

        get reordering() {
            if (dnd.inProgress) {
                return dnd.source.$el.parentElement === this.$el && this.$listeners.hasOwnProperty('reorder');
            } else {
                return null;
            }
        }

        get closestIndex() {
            if (this.grid) {
                return this.grid.closestIndex(dnd.position);
            } else {
                return null;
            }
        }

        get dropAllowed() {
            if (this.dragInProgress) {
                if (this.reordering) {
                    return true;
                } else {
                    let superDropAllowed = DropMixin['options'].computed.dropAllowed.get.call(this);
                    if (!superDropAllowed) {
                        return false;
                    } else {
                        if (this.forbiddenKeys !== null && this.feedbackKey !== null) {
                            return !this.forbiddenKeys.includes(this.feedbackKey)
                        } else {
                            return null;
                        }
                    }
                }
            } else {
                return null;
            }
        }

        get itemsBeforeFeedback() {
            if (this.closestIndex === 0) {
                return [];
            } else {
                return this.items.slice(0, this.closestIndex);
            }
        }

        get itemsAfterFeedback() {
            if (this.closestIndex === this.items.length) {
                return [];
            } else {
                return this.items.slice(this.closestIndex);
            }
        }

        get reorderedItems() {
            let toIndex = this.closestIndex;
            let reordered = [...this.items];
            let temp = reordered[this.fromIndex];
            reordered.splice(this.fromIndex, 1);
            reordered.splice(toIndex, 0, temp);
            return reordered;
        }

        get clazz() {
            return {
                'drop-list': true,
                'reordering': this.reordering === true,
                'inserting': this.reordering === false,
                ...(this.reordering === false ? this.cssClasses : {})
            };
        }

        get style() {
            return {
                ...(this.reordering === false ? this.cssStyle : {})
            };
        }

        get showDragFeedback() {
            return this.dragInProgress && this.typeAllowed && !this.reordering;
        }

        get showInsertingDragImage() {
            return this.dragInProgress && this.typeAllowed && !this.reordering && this.$scopedSlots.hasOwnProperty("inserting-drag-image");
        }

        get showReorderingDragImage() {
            return this.dragInProgress && this.reordering && this.$scopedSlots.hasOwnProperty("reordering-drag-image");
        }


        doDrop(event: DnDEvent) {
            if (this.reordering) {
                if (this.fromIndex !== this.closestIndex) {
                    this.$emit('reorder', new ReorderEvent(
                        this.fromIndex,
                        this.closestIndex
                    ));
                }
            } else {
                DropMixin['options'].methods.doDrop.call(this, event);
                this.$emit('insert', new InsertEvent(
                    event.type,
                    event.data,
                    this.closestIndex
                ));
            }
        }

        candidate(): boolean {
            let superCandidate = DropMixin['options'].methods.candidate.call(this);
            return (superCandidate && this.$listeners.hasOwnProperty("insert")) || this.reordering;
        }

        computeForbiddenKeys() {
            return this.$children[0].$vnode.context.$children[0].$slots.default
                .map(vn => vn.key)
                .filter(k => k !== undefined && k !== 'drag-image' && k !== 'drag-feedback');
        }

        computeFeedbackKey() {
            return this.$refs['feedback']['$slots']['default'][0]['key'];
        }

        computeInsertingGrid() {
            let feedbackParent = this.$refs['feedback']['$el'] as HTMLElement;
            let feedback = feedbackParent.children[0];
            let clone = feedback.cloneNode(true) as HTMLElement;
            let tg = this.$refs['tg']['$el'] as HTMLElement;
            tg.append(clone);
            let grid = new Grid(tg.children);
            clone.remove();
            return grid;
        }

        computeReorderingGrid() {
            let tg = this.$refs['tg']['$el'] as HTMLElement;
            return new Grid(tg.children);
        }

        createDragImage() {
            let image;
            if (this.$refs['drag-image']) {
                let el = this.$refs['drag-image'] as HTMLElement;
                let model;
                if (el.childElementCount !== 1) {
                    model = el;
                } else {
                    model = el.children.item(0);
                }
                let clone = model.cloneNode(true) as HTMLElement;
                let tg = this.$el as HTMLElement;
                tg.append(clone);
                image = createDragImage(clone);
                clone.remove();
            } else {
                image = 'source';
            }
            return image;
        }

    }
</script>

<style scoped lang="scss">
    .drag-in-progress {
        .drop-list {
            &::v-deep > * {
                transition: transform .2s;
            }
        }
    }

    .feedback {
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