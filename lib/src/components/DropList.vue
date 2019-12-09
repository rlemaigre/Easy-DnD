<template>
    <transition-group :tag="tag" name="drop-list-transition"
                      ref="tg" :duration="{enter: 0, leave: 0}" :css="false" :class="clazz" :style="cssStyle">
        <slot name="item" :item="item" v-for="item in itemsBeforeFeedback"/>
        <slot name="feedback" :data="dragData" :type="dragType" v-if="feedbackIndex !== null"/>
        <slot name="item" :item="item" v-for="item in itemsAfterFeedback"/>
        <drag-feedback class="feedback" ref="feedback" v-if="acceptsType(dragType) && acceptsData(dragData)"
                       key="drag-feedback">
            <slot name="feedback" :data="dragData" :type="dragType"/>
        </drag-feedback>
        <div class="__drag-image" v-if="showDragImage" ref="drag-image" key="drag-image">
            <slot name="drag-image" :type="dragType" :data="dragData"/>
        </div>
    </transition-group>
</template>

<script lang="ts">
    import {Component, Prop, Vue, Watch} from "vue-property-decorator";
    import DropMixin from "../mixins/DropMixin";
    import {DnDEvent} from "..";
    import {createDragImage, dndimpl, InsertEvent} from "../ts/utils";
    import DragFeedback from "./DragFeedback.vue";

    @Component({
        components: {DragFeedback}
    })
    export default class DropList extends DropMixin {

        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        @Prop()
        items: any[];

        @Prop({default: false})
        reorder: boolean;

        grid = null;

        forbiddenKeys = [];

        feedbackKey = null;

        created() {
            this.$on('dragenter', this.onDragEnter);
            this.$on('dragleave', this.onDragLeave);
            this.$on('drop', this.onDrop)
        }

        onDrop(event: DnDEvent) {
            this.$emit('insert', new InsertEvent(
                event.type,
                event.data,
                this.feedbackIndex,
                event.mouse
            ))
        }

        @Watch('items', {immediate: true, deep: true})
        onItemsChange() {
            Vue.nextTick(
                () => {
                    this.forbiddenKeys = this.$children[0].$vnode.context.$children[0].$slots.default
                        .map(vn => vn.key)
                        .filter(k => k !== undefined && k !== 'drag-image' && k !== 'drag-feedback');
                }
            );
        }

        @Watch('dragInProgress')
        onDragInProgressChange(val) {
            if (val) {
                Vue.nextTick(() => {
                    this.feedbackKey = this.$refs['feedback']['$slots']['default'][0]['key'];
                });
            } else {
                this.feedbackKey = null;
            }
        }

        overridableAcceptsData(data: any, type: any): boolean {
            if (this.feedbackKey == null)
                return true;
            else {
                return this.acceptsData(data, type) && !this.forbiddenKeys.includes(this.feedbackKey);
            }
        }

        onDragEnter() {
            if (this.dropAllowed) {
                // Temporary add a clone of the feedback to the list :
                let feedbackParent = this.$refs['feedback']['$el'] as HTMLElement;
                let feedback = feedbackParent.children[0];
                let clone = feedback.cloneNode(true) as HTMLElement;
                let tg = this.$refs['tg']['$el'] as HTMLElement;
                tg.append(clone);

                // Compute grid :
                this.grid = [];
                for (let child of tg.children) {
                    let rect = child.getBoundingClientRect();
                    this.grid.push({
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    });
                }

                // Remove clone :
                clone.remove();
            }
        }

        onDragLeave() {
            this.grid = null;
        }

        get feedbackIndex() {
            if (this.grid) {
                let minDist = 999999;
                let index = -1;
                for (let i = 0; i < this.grid.length; i++) {
                    let center = this.grid[i];
                    let dist = Math.sqrt(Math.pow(center.x - this.dragPosition.x, 2) + Math.pow(center.y - this.dragPosition.y, 2));
                    if (dist < minDist) {
                        minDist = dist;
                        index = i;
                    }
                }
                return index;
            } else {
                return null;
            }
        }

        get itemsBeforeFeedback() {
            if (this.dragInProgress && this.dropIn && this.dropAllowed) {
                if (this.feedbackIndex === 0) {
                    return [];
                } else {
                    return this.items.slice(0, this.feedbackIndex);
                }
            } else {
                return this.items;
            }
        }

        get itemsAfterFeedback() {
            if (this.dragInProgress && this.dropIn && this.dropAllowed) {
                if (this.feedbackIndex === this.items.length) {
                    return [];
                } else {
                    return this.items.slice(this.feedbackIndex);
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

        get reordering() {
            return this.dragInProgress && this.reorder && dndimpl.source.$el.parentElement === this.$refs['tg']['$el'];
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