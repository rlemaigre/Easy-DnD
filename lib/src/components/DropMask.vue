<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners">
        <slot></slot>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
        </template>
    </component>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {dndimpl} from "../ts/utils";

    @Component({})
    export default class DropMask extends Vue {

        isDropMask = true;

        @Prop({default: 'div', type: [String, Object]})
        tag: any;

        mounted() {
            let el = this.$el;
            let comp = this;
            el.addEventListener('mouseenter', onDragEnter);
            el.addEventListener('mouseleave', onDragLeave);

            function onDragEnter(e) {
                if (dndimpl.inProgress) {
                    dndimpl.mouseEnter(comp, e);
                }
            }

            function onDragLeave(e) {
                if (dndimpl.inProgress) {
                    dndimpl.mouseLeave(e);
                }
            }

        }

        createDragImage() {
            return 'source';
        }

    }
</script>