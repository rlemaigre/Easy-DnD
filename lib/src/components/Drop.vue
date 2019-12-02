<template>
    <component :is="tag" v-bind="$attrs" v-on="$listeners" :class="clazz" :style="style">
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
    export default class Drop extends Vue {

        isDrop = true;

        @Prop({default: 'div', type: [String, Object]})
        tag: string | object;

        @Prop({default: () => () => true, type: [String, Array, Function]})
        acceptsType: string | string[] | { (type: any): boolean };

        @Prop({default: () => () => true, type: Function})
        acceptsData: { (data: any, type: string): boolean };

        @Prop({default: 'pointer'})
        cursor: string;

        @Prop({default: 'copy'})
        mode: string;

        _acceptsType(type: string) {
            if (this.acceptsType === null)
                return true;
            else if (typeof (this.acceptsType) === 'string')
                return this.acceptsType === type;
            else if (typeof (this.acceptsType) === 'object' && Array.isArray(this.acceptsType)) {
                return this.acceptsType.includes(type);
            } else {
                return this.acceptsType(type);
            }
        }

        mounted() {
            let el = this.$el;
            let comp = this;
            el.addEventListener('mouseenter', onDragEnter);
            el.addEventListener('mouseleave', onDragLeave);
            el.addEventListener('mousemove', onDragOver);
            el.addEventListener('mouseup', onDrop);

            function onDragEnter(e) {
                if (dndimpl.inProgress && comp._acceptsType(dndimpl.type)) {
                    dndimpl.mouseEnter(comp, e);
                }
            }

            function onDragLeave(e) {
                if (dndimpl.inProgress && comp._acceptsType(dndimpl.type)) {
                    dndimpl.mouseLeave(e);
                }
            }

            function onDragOver(e) {
                if (dndimpl.inProgress && comp._acceptsType(dndimpl.type)) {
                    comp.$emit('dragover', new DnDEvent(dndimpl.type, dndimpl.data, e));
                }
            }

            function onDrop(e) {
                if (dndimpl.inProgress && comp._acceptsType(dndimpl.type)) {
                    if (comp === dndimpl.top() && comp.compatibleModes() && comp.acceptsData(dndimpl.data, dndimpl.type)) {
                        comp.$emit('drop', new DnDEvent(dndimpl.type, dndimpl.data, e));
                        dndimpl.source.$emit(comp.mode, new DnDEvent(dndimpl.type, dndimpl.data, e));
                    }
                }
            }

        }

        compatibleModes() {
            return (this.mode === 'copy' || dndimpl.source.$listeners[this.mode]);
        }

        get clazz() {
            let clazz = {};
            if (dndimpl.inProgress) {
                // Est-ce que la zone est actuellement survolée par le curseur ?
                let top = dndimpl.top() === this;
                clazz = {
                    ...clazz,
                    "drop-in": top,
                    "drop-out": !top
                };

                // Est-ce que la drop zone accepte le type de drag courant ?
                let acceptType = this._acceptsType(dndimpl.type);
                clazz = {
                    ...clazz,
                    "type-allowed": acceptType,
                    "type-forbidden": !acceptType
                };

                // Est-ce que la drop zone accepte les données courantes ?
                if (acceptType) {
                    let acceptData = this.compatibleModes() && this.acceptsData(dndimpl.data, dndimpl.type);
                    clazz = {
                        ...clazz,
                        "drop-allowed": acceptData,
                        "drop-forbidden": !acceptData
                    };
                }
            }

            return clazz;
        }

        get style() {
            if (dndimpl.inProgress && this._acceptsType(dndimpl.type) && this.compatibleModes() && this.acceptsData(dndimpl.data, dndimpl.type) && dndimpl.top() === this) {
                return {cursor: this.cursor + ' !important'};
            } else {
                return {cursor: 'inherit'};
            }
        }

        get showDragImage() {
            return dndimpl.inProgress && this._acceptsType(dndimpl.type) && this.$scopedSlots['drag-image'];
        }

        get dndtype() {
            return dndimpl.inProgress ? dndimpl.type : null;
        }

        get dnddata() {
            return dndimpl.inProgress ? dndimpl.data : null;
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