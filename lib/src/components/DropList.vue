<template>
    <div :class="clazz" :style="cssStyle">
        <transition-group :name="transition" :duration="{ enter: 0, leave: 0 }" :tag="tag" v-bind="$attrs"
                          v-on="$listeners" class="tg" ref="tg">
            <slot :name="itemSlot(item)" :item="item" v-for="item in itemsWithFeedback"></slot>
            <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
                <slot :name="slot" v-bind="scope"/>
            </template>
        </transition-group>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import DropMixin from "../mixins/DropMixin";
    import {Position} from "../ts/utils";

    @Component({})
    export default class DropList extends DropMixin {

        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        @Prop()
        items: any[];

        @Prop({default: 'list'})
        transition: string;

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
            this.grid = this.generateGrid();
        }

        onDragLeave() {
            this.grid = null;
        }

        generateGrid() {
            let grid = [];
            let tg = this.$refs['tg']['$el'] as HTMLElement;
            for (let child of tg.children) {
                let rect = child.getBoundingClientRect();
                grid.push({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                });
            }
            return grid;
        }

        computeIndex(grid, position: Position) {
            let minDist = 999999;
            let index = -1;
            for (let i = 0; i < grid.length; i++) {
                let center = grid[i];
                let dist = Math.sqrt(Math.pow(center.x - position.x, 2) + Math.pow(center.y - position.y, 2));
                if (dist < minDist) {
                    minDist = dist;
                    index = i;
                }
            }
            return index;
        }

        get feedbackIndex() {
            return this.computeIndex(this.grid, this.dragPosition);
        }

        get dragItem() {
            return this.dataToItem(this.dragData, this.dragType);
        }

        get itemsWithFeedback() {
            if (this.dragInProgress && this.dropIn && this.dropAllowed) {
                if (this.feedbackIndex === 0) {
                    return [
                        this.dragItem,
                        ...this.items
                    ]
                } else if (this.feedbackIndex >= this.items.length - 1) {
                    return [
                        ...this.items,
                        this.dragItem
                    ]
                } else {
                    return [
                        ...this.items.slice(0, this.feedbackIndex),
                        this.dragItem,
                        ...this.items.slice(this.feedbackIndex)
                    ];
                }
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

    .list-enter, .list-leave-to {
        visibility: hidden;
    }

    .list-leave-active {
        position: absolute;
        visibility: hidden;
    }
</style>