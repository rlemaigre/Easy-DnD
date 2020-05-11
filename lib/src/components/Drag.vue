<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners" :style="{cursor: disabled || handle ? null : 'grab'}"
               :class="cssClasses">
        <slot></slot>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
        </template>
        <div class="__drag-image" ref="drag-image">
            <slot name="drag-image"></slot>
        </div>
    </component>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import DragMixin from "../mixins/DragMixin";

    @Component({})
    export default class Drag extends DragMixin {

        /**
         * Tag to be used as root of this component. Defaults to div.
         */
        @Prop({default: 'div', type: [String, Object,Function]})
        tag: any;

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

<style lang="scss">
    html.drag-in-progress * {
        cursor: grabbing !important;
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