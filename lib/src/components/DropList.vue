<template>
    <transition-group :tag="tag" name="drop-list-transition"
                      ref="tg" :duration="{enter: 0, leave: 0}" :css="false" :class="clazz" :style="cssStyle">
        <template v-if="operation === 'reordering' && operationInProgress">
            <slot name="item" v-for="(item, index) in reorderedItems" :item="item" :reorder="index === closestIndex"/>
        </template>
        <template v-else-if="operation === 'inserting' && operationInProgress">
            <slot name="item" v-for="item in itemsBeforeFeedback" :item="item" :reorder="false"/>
            <slot name="feedback" :data="dragData" :type="dragType"/>
            <slot name="item" v-for="item in itemsAfterFeedback" :item="item" :reorder="false"/>
        </template>
        <template v-else>
            <slot name="item" v-for="item in items" :item="item" :reorder="false"/>
        </template>
        <drag-feedback class="feedback" v-if="showDragFeedback" ref="feedback" key="drag-feedback">
            <slot name="feedback" :data="dragData" :type="dragType"/>
        </drag-feedback>
        <div class="__drag-image" v-if="showInsertingDragImage" ref="drag-image" key="inserting-drag-image">
            <slot name="inserting-drag-image" :type="dragType" :data="dragData"/>
        </div>
        <div class="__drag-image" v-if="showReorderingDragImage" ref="drag-image" key="reordering-drag-image">
            <slot name="reordering-drag-image" :item="items[fromIndex]"/>
        </div>
    </transition-group>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
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

        operation: 'reordering' | 'inserting' = null;
        operationInProgress: boolean = false;
        grid: Grid = null;
        forbiddenKeys = [];
        feedbackKey = null;
        fromIndex: number = null;
        closestIndex: number = null;

        created() {
            dnd.on("dragstart", this.onDragStart);
            this.$on("dragenter", this.onDragEnter);
            this.$on("dragleave", this.onDragLeave);
            this.$on("dragover", this.onDragOver);
            dnd.on("dragend", this.onDragEnd);
        }

        destroyed() {
            dnd.off("dragstart", this.onDragStart);
            this.$off("dragenter", this.onDragEnter);
            this.$off("dragleave", this.onDragLeave);
            this.$off("dragover", this.onDragOver);
            dnd.off("dragend", this.onDragEnd);
        }

        onDragStart(event: DnDEvent) {
            if (event.source.$el.parentElement === this.$refs['tg']['$el'] && this.$listeners['reorder']) {
                this.operation = "reordering";
                this.fromIndex = Array.prototype.indexOf.call(event.source.$el.parentElement.children, event.source.$el);
                this.grid = this.computeReorderingGrid();
            } else {
                this.operation = "inserting";
                this.$nextTick(() => {
                    // Presence of feedback node in the DOM required => delayed until what depends on drag data has been
                    // processed.
                    this.grid = this.computeInsertingGrid();
                    this.feedbackKey = this.$refs['feedback']['$slots']['default'][0]['key'];
                    this.forbiddenKeys = this.computeForbiddenKeys();
                });
            }
        }

        onDragEnd() {
            this.fromIndex = null;
            this.feedbackKey = null;
            this.forbiddenKeys = null;
            this.operation = null;
        }

        onDragEnter(event: DnDEvent) {
            if (this.operation === "reordering") {
                this.operationInProgress = true;
            } else if (this.effectiveAcceptsType(event.type) && this.effectiveAcceptsData(event.data, event.type) && this.$listeners['insert']) {
                this.operationInProgress = true;
            }
            if (this.operationInProgress) {
                this.closestIndex = this.grid.closestIndex(event.position);
            }
        }

        onDragLeave() {
            this.operationInProgress = false;
            this.closestIndex = null;
        }

        onDragOver(event: DnDEvent) {
            if (this.operationInProgress) {
                this.closestIndex = this.grid.closestIndex(event.position);
            }
        }

        computeForbiddenKeys() {
            return this.$children[0].$vnode.context.$children[0].$slots.default
                .map(vn => vn.key)
                .filter(k => k !== undefined && k !== 'drag-image' && k !== 'drag-feedback');
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

        doDrop(event: DnDEvent) {
            DropMixin['options'].methods.doDrop.call(this, event);
            if (this.operation === "reordering") {
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

        effectiveAcceptsType(type: any): boolean {
            if (this.operation === 'reordering') {
                return true;
            } else {
                return DropMixin['options'].methods.effectiveAcceptsType.call(this, type);
            }
        }

        effectiveAcceptsData(data: any, type: any): boolean {
            let superResult = DropMixin['options'].methods.effectiveAcceptsData.call(this, data, type);
            if (!superResult) {
                return false;
            } else {
                if (this.feedbackKey !== null && this.forbiddenKeys !== null) {
                    return !this.forbiddenKeys.includes(this.feedbackKey)
                } else {
                    return null;
                }
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
                'reordering': this.operation === "reordering",
                ...(this.operation === 'inserting' ? this.cssClasses : {})
            };
        }

        get showInsertingDragImage() {
            return this.operation === 'inserting' && this.effectiveAcceptsType(this.dragType) && this.$scopedSlots['inserting-drag-image'];
        }

        get showReorderingDragImage() {
            return this.operation === 'reordering' && this.$scopedSlots['reordering-drag-image'];
        }

        get showDragFeedback() {
            return this.operation === 'inserting' && this.effectiveAcceptsType(this.dragType);
        }

        candidate(type: any, data: any, source: Vue): boolean {
            return super.candidate(type, data, source);
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