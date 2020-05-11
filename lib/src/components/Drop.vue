<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners" :class="cssClasses" :style="cssStyle">
        <slot></slot>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
        </template>
        <div class="__drag-image" v-if="showDragImage" ref="drag-image">
            <slot name="drag-image" :type="dragType" :data="dragData"></slot>
        </div>
    </component>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import DropMixin from "../mixins/DropMixin";

    @Component({})
    export default class Drop extends DropMixin {

        @Prop({default: 'div', type: [String, Object,Function]})
        tag: any;

        get showDragImage() {
            return this.dragInProgress && this.typeAllowed && this.$scopedSlots['drag-image'];
        }

    }
</script>

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

<style lang="scss" scoped>
    /* Places a drag image out of sight while keeping its computed styles accessibles. */
    .__drag-image {
        position: fixed;
        top: -10000px;
        left: -10000px;
        will-change: left, top;
    }
</style>