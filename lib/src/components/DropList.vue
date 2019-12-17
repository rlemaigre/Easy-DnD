<template>
    <transition-group :tag="tag" name="drop-list-transition"
                      ref="tg" :duration="{enter: 0, leave: 0}" :css="false" :class="clazz" :style="cssStyle">
        <template v-if="mode === 'normal'">
            <slot name="item" v-for="item in items" :item="item" :reorder="false"/>
        </template>
        <template v-if="mode === 'reordering'">
            <slot name="item" v-for="(item, index) in reorderedItems" :item="item" :reorder="index === closestIndex"/>
        </template>
        <template v-if="mode === 'inserting'">
            <slot name="item" v-for="item in itemsBeforeFeedback" :item="item" :reorder="false"/>
            <slot name="feedback" :data="dragData" :type="dragType"/>
            <slot name="item" v-for="item in itemsAfterFeedback" :item="item" :reorder="false"/>
        </template>
        <drag-feedback class="feedback" ref="feedback"
                       v-if="showFeedback"
                       key="drag-feedback">
            <slot name="feedback" :data="dragData" :type="dragType"/>
        </drag-feedback>
        <div class="__drag-image" v-if="showDragImage" ref="drag-image" key="drag-image">
            <slot name="drag-image" :type="dragType" :data="dragData" :reorder="reordering"/>
        </div>
    </transition-group>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import DropMixin from "../mixins/DropMixin";
    import DragFeedback from "./DragFeedback.vue";
    import Grid from "../ts/Grid";

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
        /*
                created() {
                    dnd.on("dragstart", this.onDragStart);
                    dnd.on("dragenter", this.onDragEnter);
                    dnd.on("dragleave", this.onDragLeave);
                    dnd.on("dragend", this.onDragEnd);
                }

                destroyed() {
                    dnd.off("dragstart", this.onDragStart);
                    dnd.off("dragenter", this.onDragEnter);
                    dnd.off("dragleave", this.onDragLeave);
                    dnd.off("dragend", this.onDragEnd);
                }

                onDragStart(event: DnDEvent) {
                    if (this.$listeners['reorder'] && event.source.$el.parentElement === this.$refs['tg']['$el']) {
                        this.mode = "reordering";
                        let tg = this.$refs['tg']['$el'] as HTMLElement;
                        this.grid = new Grid(tg.children);
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

                onDragEnter(event: DnDEvent) {
                    if (this.$listeners['reorder'] && event.source.$el.parentElement === this.$refs['tg']['$el']) {
                        this.mode = "reordering";
                        let tg = this.$refs['tg']['$el'] as HTMLElement;
                        this.grid = new Grid(tg.children);
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
                    if (!this.reordering) {
                        if (this.dragInProgress && this.dropIn && this.dropAllowed) {
                            if (this.closestIndex === 0) {
                                return [];
                            } else {
                                return this.items.slice(0, this.closestIndex);
                            }
                        } else {
                            return this.items;
                        }
                    } else {
                        return [];
                    }
                }

                get itemsAfterFeedback() {
                    if (!this.reordering) {
                        if (this.dragInProgress && this.dropIn && this.dropAllowed) {
                            if (this.closestIndex === this.items.length) {
                                return [];
                            } else {
                                return this.items.slice(this.closestIndex);
                            }
                        } else {
                            return [];
                        }
                    } else {
                        return [];
                    }
                }

                get reorderedItems() {
                    if (this.reordering) {
                        if (this.closestIndex !== null) {
                            let toIndex = this.closestIndex;
                            let reordered = [...this.items];
                            let temp = reordered[this.fromIndex];
                            reordered.splice(this.fromIndex, 1);
                            reordered.splice(toIndex, 0, temp);
                            return reordered;
                        } else {
                            return this.items;
                        }
                    } else {
                        return [];
                    }
                }

                get clazz() {
                    return {
                        ...this.cssClasses,
                        'drop-list': true,
                        'tg': true,
                        'reordering': this.reordering
                    };
                }

                get showDragImage() {
                    return this.dragInProgress && this.typeAllowed && this.$scopedSlots['drag-image'];
                }

                get showFeedback() {
                    return this.dragInProgress && this.typeAllowed && this.$scopedSlots['feedback'] && this.acceptsData(this.dragData, this.dragType) && !this.reordering;
                }

                get fromIndex() {
                    if (this.reordering) {
                        return Array.prototype.indexOf.call(dndimpl.source.$el.parentElement.children, dndimpl.source.$el);
                    } else {
                        return null;
                    }
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
                        let tg = this.$refs['tg']['$el'] as HTMLElement;
                        tg.append(clone);
                        image = createDragImage(clone);
                        clone.remove();
                    } else {
                        image = 'source';
                    }
                    return image;
                }*/

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