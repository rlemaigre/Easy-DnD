<template>
    <div :class="clazz" :style="cssStyle">
        <transition-group :name="transitionName" :duration="transitionDuration" :tag="tag" v-bind="$attrs"
                          v-on="$listeners" class="tg" ref="tg">
            <slot :name="itemSlot(item)" :item="item" v-for="item in itemsWithFeedback"></slot>
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope"/>
            </template>
        </transition-group>
        <div class="feedback" v-if="feedback !== null" ref="feedback">
            <slot name="feedback" :item="feedback">
                <slot name="item" :item="feedback"></slot>
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import DropMixin from "../mixins/DropMixin";

    @Component({})
    export default class DropList extends DropMixin {

        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        @Prop()
        items: any[];

        @Prop({default: 'drop-list-transition'})
        transitionName: string;

        @Prop({
            default: () => {
                return {enter: 0, leave: 0}
            }
        })
        transitionDuration: object;

        @Prop({default: (data) => data, type: Function})
        dataToItem: { (data: any, type: any): any };

        grid = null;

        itemSlot(item: any) {
            if (item !== this.dragData) {
                return 'item';
            } else {
                return this.$scopedSlots['feedback'] ? 'feedback' : 'item';
            }
        }

        created() {
            this.$on('dragenter', this.onDragEnter);
            this.$on('dragleave', this.onDragLeave);
        }

        onDragEnter() {
            if (this.dropAllowed) {
                // Temporary add a clone of the feedback to the list :
                let feedbackParent = this.$refs['feedback'] as HTMLElement;
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

        get feedback() {
            if (this.dragInProgress && this.dropAllowed) {
                return this.dataToItem(this.dragData, this.dragType);
            } else {
                return null;
            }
        }

        get itemsWithFeedback() {
            if (this.dragInProgress && this.dropIn && this.dropAllowed) {
                let items = [];
                for (let i = 0; i <= this.items.length; i++) {
                    if (i === this.feedbackIndex) {
                        items.push(this.feedback);
                    }
                    if (i < this.items.length) {
                        items.push(this.items[i])
                    }
                }
                return items;
            } else {
                return this.items;
            }
        }

        get clazz() {
            return {
                ...this.cssClasses,
                'drop-list': true
            };
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
</style>