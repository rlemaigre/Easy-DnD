<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners" :class="clazz" :style="style">
        <slot></slot>
        <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
            <slot :name="slot" v-bind="scope"/>
        </template>
        <div class="drag-image" v-if="showDragImage" ref="drag-image">
            <slot name="drag-image" :type="dragType" :data="dragData"></slot>
        </div>
    </component>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-property-decorator";
    import {DnDEvent, dndimpl} from "../ts/utils";
    import DropMixin from "../mixins/DropMixin";

    @Component({})
    export default class Drop extends DropMixin {

        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        get clazz() {
            let clazz = {};
            if (this.dropIn !== null) {
                clazz = {
                    ...clazz,
                    "drop-in": this.dropIn,
                    "drop-out": !this.dropIn
                };
            }
            if (this.typeAllowed !== null) {
                clazz = {
                    ...clazz,
                    "type-allowed": this.typeAllowed,
                    "type-forbidden": !this.typeAllowed
                };
            }
            if (this.dropAllowed !== null) {
                    clazz = {
                        ...clazz,
                        "drop-allowed": this.dropAllowed,
                        "drop-forbidden": !this.dropAllowed
                    };
            }
            return clazz;
        }

        get style() {
            if (this.dropReady) {
                return {cursor: this.cursor + ' !important'};
            } else {
                return {cursor: 'inherit'};
            }
        }

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