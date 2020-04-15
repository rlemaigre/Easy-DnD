<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners">
        <slot></slot>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
        </template>
    </component>
</template>

<script lang="ts">
    import {Component, Prop} from "vue-property-decorator";
    import DragAwareMixin from "../mixins/DragAwareMixin";
    import {dnd} from "../ts/DnD";

    @Component({})
    export default class DropMask extends DragAwareMixin {

        isDropMask = true;

        @Prop({default: 'div', type: [String, Object]})
        tag: any;

        mounted() {
            let el = this.$el;
            let comp = this;
            el.addEventListener('easy-dnd-move', onMouseMove);

            function onMouseMove(e) {
                dnd.mouseMove(e, comp);
            }
        }

        createDragImage() {
            return 'source';
        }

    }
</script>