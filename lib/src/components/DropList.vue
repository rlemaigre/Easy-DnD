<template>
    <transition-group :tag="tag" name="drop-list-transition"
                      ref="tg" :duration="{enter: 0, leave: 0}" :css="false" :class="clazz" :style="cssStyle">
        <template v-if="mode === 'normal'">
            <slot name="item" v-for="item in items" :item="item" :reorder="false"/>
        </template>
        <template v-if="mode === 'reordering'">
            <slot name="item" v-for="(item, index) in reorderedItems" :item="item" :reorder="index === closestIndex"/>
            <div class="__drag-image" v-if="showReorderingDragImage" ref="drag-image" key="drag-image">
                <slot name="reordering-drag-image" :item="items[fromIndex]"/>
            </div>
        </template>
        <template v-if="mode === 'inserting'">
            <slot name="item" v-for="item in itemsBeforeFeedback" :item="item" :reorder="false"/>
            <slot name="feedback" :data="dragData" :type="dragType"/>
            <slot name="item" v-for="item in itemsAfterFeedback" :item="item" :reorder="false"/>
            <drag-feedback class="feedback" ref="feedback"
                           key="drag-feedback">
                <slot name="feedback" :data="dragData" :type="dragType"/>
            </drag-feedback>
            <div class="__drag-image" v-if="showInsertingDragImage" ref="drag-image" key="drag-image">
                <slot name="inserting-drag-image" :type="dragType" :data="dragData"/>
            </div>
        </template>
    </transition-group>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import DropMixin from "../mixins/DropMixin";
    import DragFeedback from "./DragFeedback.vue";
    import Grid from "../ts/Grid";
    import {DnDEvent, InsertEvent, ReorderEvent} from "../ts/events";
    import {createDragImage} from "../ts/createDragImage"

    @Component({
        components: {DragFeedback}
    })
    export default class DropList extends DropMixin {

        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        @Prop()
        items: any[];

        mode: 'normal' | 'reordering' | 'inserting' = 'normal';
        grid: Grid = null;
        forbiddenKeys = [];
        feedbackKey = null;
        fromIndex: number;

        created() {
            this.$on("dragenter", this.onDragEnter);
            this.$on("dragleave", this.onDragLeave);
        }

        destroyed() {
            this.$off("dragenter", this.onDragEnter);
            this.$off("dragleave", this.onDragLeave);
        }

        onDragEnter(event: DnDEvent) {
            if (this.$listeners['reorder'] && event.source.$el.parentElement === this.$refs['tg']['$el']) {
                this.mode = "reordering";
                let tg = this.$refs['tg']['$el'] as HTMLElement;
                this.grid = new Grid(tg.children);
                this.fromIndex = Array.prototype.indexOf.call(event.source.$el.parentElement.children, event.source.$el);
            } else if (this.effectiveAcceptsData(event.data, event.type) && this.compatibleModes(event.source)) {
                this.mode = "inserting";
                this.feedbackKey = this.$refs['feedback']['$slots']['default'][0]['key'];
                this.forbiddenKeys = this.$children[0].$vnode.context.$children[0].$slots.default
                    .map(vn => vn.key)
                    .filter(k => k !== undefined && k !== 'drag-image' && k !== 'drag-feedback');
                let feedbackParent = this.$refs['feedback']['$el'] as HTMLElement;
                let feedback = feedbackParent.children[0];
                let clone = feedback.cloneNode(true) as HTMLElement;
                let tg = this.$refs['tg']['$el'] as HTMLElement;
                tg.append(clone);
                this.grid = new Grid(tg.children);
                clone.remove();
            } else {
                this.mode = "normal";
            }
        }


        onDragLeave(event: DnDEvent) {
            this.mode = 'normal';
            this.grid = null;
            this.forbiddenKeys = [];
            this.feedbackKey = null;
        }

        doDrop(event: DnDEvent) {
            super.doDrop(event);
            if (this.mode === "reordering") {
                if (this.fromIndex !== this.closestIndex) {
                    this.$emit('reorder', {
                        from: this.fromIndex,
                        to: this.closestIndex
                    } as ReorderEvent)
                }
            } else {
                this.$emit('insert', {
                    type: event.type,
                    data: event.data,
                    index: this.closestIndex
                } as InsertEvent);
            }
        }

        effectiveAcceptsData(data: any, type: any): boolean {
            if (this.mode === "reordering")
                return true;
            else {
                return super.effectiveAcceptsData(data, type) && !this.forbiddenKeys.includes(this.feedbackKey)
            }
        }

        get closestIndex() {
            return this.grid.closestIndex(this.dragPosition);
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
                ...this.cssClasses,
                'drop-list': true,
                'reordering': this.mode === "reordering",
                'inserting': this.mode === "inserting"
            };
        }

        get showInsertingDragImage() {
            return this.$scopedSlots['inserting-drag-image'];
        }

        get showReorderingDragImage() {
            return this.$scopedSlots['reordering-drag-image'];
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
    .tg {
        &::v-deep > * {
            transition: transform .2s;
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