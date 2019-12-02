<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners" :style="{cursor: 'grab'}" @mouseenter.native="onMouseEnter"
               @mouseleave.native="onMouseLeave" :class="clazz">
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

    @Component({})
    export default class Drag extends Vue {

        isDrag = true;

        /**
         * Tag to be used as root of this component. Defaults to div.
         */
        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        @Prop({default: null, type: null})
        type: string;

        @Prop({default: null, type: null})
        data: any;

        mouseIn: boolean = null;

        onMouseEnter() {
            this.mouseIn = true;
        }

        onMouseLeave() {
            this.mouseIn = false;
        }

        mounted() {
            let comp = this;
            let el = this.$el;
            let dragStarted = false;
            let initialUserSelect;
            el.addEventListener('mousedown', startDragging);

            function noop(e) {
                e.stopPropagation();
                e.preventDefault();
            }

            function startDragging(e) {
                initialUserSelect = document.body.style.userSelect;
                document.documentElement.style.userSelect = 'none'; // Permet au drag de se poursuivre normalement même
                // quand on quitte un élémént avec overflow: hidden.
                dragStarted = false;
                document.addEventListener('mousemove', doDrag);
                document.addEventListener('mouseup', stopDragging);
                document.addEventListener('selectstart', noop);
            }

            function doDrag(e) {
                if (!dragStarted) {
                    dragStarted = true;
                    dndimpl.type = comp.type;
                    dndimpl.data = comp.data;
                    comp.$emit('dragstart', new DnDEvent(dndimpl.type, dndimpl.data, e));
                    dndimpl.init(comp, e);
                    document.documentElement.classList.add('drag-in-progress');
                }
                comp.$emit('drag', e);
                dndimpl.move(e);
            }

            function stopDragging(e) {
                if (dragStarted) {
                    comp.$emit('dragend', new DnDEvent(dndimpl.type, dndimpl.data, e));
                    document.documentElement.classList.remove('drag-in-progress');
                    dndimpl.clear();
                    e.stopPropagation();
                    e.preventDefault();
                }
                document.removeEventListener('mousemove', doDrag);
                document.removeEventListener('mouseup', stopDragging);
                document.removeEventListener('selectstart', noop);
                document.documentElement.style.userSelect = initialUserSelect;
            }
        }

        get showDragImage() {
            return dndimpl.inProgress && this.$scopedSlots['drag-image'];
        }

        get dndtype() {
            return dndimpl.inProgress ? dndimpl.type : null;
        }

        get dnddata() {
            return dndimpl.inProgress ? dndimpl.data : null;
        }

        get dragIn() {
            return (dndimpl.inProgress && dndimpl.source === this) || this.mouseIn;
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