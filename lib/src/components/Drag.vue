<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners" :style="{cursor: 'grab'}" :class="clazz">
        <slot></slot>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
        </template>
        <div class="drag-image" v-if="showDragImage" ref="drag-image">
            <slot name="drag-image" :type="dndtype" :data="dnddata"></slot>
        </div>
    </component>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {DnDEvent, dndimpl} from "../ts/utils";
    import {mixins} from "vue-class-component";
    import DragMixin from "../mixins/DragMixin";

    @Component({})
    export default class Drag extends DragMixin {

        /**
         * Tag to be used as root of this component. Defaults to div.
         */
        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        get showDragImage() {
            return dndimpl.inProgress && this.$scopedSlots['drag-image'];
        }

        get dndtype() {
            return dndimpl.inProgress ? dndimpl.type : null;
        }

        get dnddata() {
            return dndimpl.inProgress ? dndimpl.data : null;
        }

        get clazz() {
            return {
                'drag-in': this.dragIn,
                'drag-out': !this.dragIn
            };
        }

    }
</script>

<style scoped lang="scss">
</style>

<style lang="scss">
    html.drag-in-progress * {
        cursor: grabbing !important;
    }

    /* Places a drag image out of sight while keeping its computed styles accessibles. */
    .drag-image {
        position: fixed;
        top: -10000px;
        left: -10000px;
        will-change: left, top;
    }
</style>