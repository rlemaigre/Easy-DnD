<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners" :class="cssClasses" :style="cssStyle">
        <slot name="items" :items="itemsWithFeedback" :feedback="dragData"></slot>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
        </template>
        <div class="drag-image" v-if="showDragImage" ref="drag-image">
            <slot name="drag-image" :type="dragType" :data="dragData"></slot>
        </div>
    </component>
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

        created() {
            this.$on('dragenter', this.onDragEnter);
            this.$on('dragleave', this.onDragLeave);
        }

        onDragEnter() {
            console.log("drag enter");
        }

        onDragLeave() {
            console.log("drag leave");
        }

        get itemsWithFeedback() {
            if (this.dragInProgress && this.dropIn && this.dropAllowed) {
                return [
                    ...this.items.slice(0, 2),
                    this.dragData,
                    ...this.items.slice(2)
                ];
            } else {
                return this.items;
            }
        }

        get showDragImage() {
            return this.dragInProgress && this.typeAllowed && this.$scopedSlots['drag-image'];
        }

    }
</script>

<style scoped lang="scss">
</style>