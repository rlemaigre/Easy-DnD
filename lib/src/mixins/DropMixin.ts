import {Component, Prop} from "vue-property-decorator";
import DragAwareMixin from "./DragAwareMixin";
import {dnd} from "../ts/globals";
import {createDragImage} from "src/ts/createDragImage";

@Component({})
export default class DropMixin extends DragAwareMixin {

    isDrop = true;

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

    overridableAcceptsType(type: string) {
        return this._acceptsType(type);
    }

    overridableAcceptsData(data: any, type: any) {
        return this.acceptsData(data, type);
    }

    created() {
        dnd.$on("dragmove", this.onDragMove);
        dnd.$on("dragend", this.onDragEnd);
    }

    destroyed() {
        dnd.$off("dragmove", this.onDragMove);
        dnd.$off("dragend", this.onDragEnd);
    }

    onDragMove() {
        if (this === this.dragTop) {
            this.$emit("dragover");
        }
    }

    onDragEnd() {
        if (this === this.dragTop) {
            this.$emit("drop");
        }
    }

    mounted() {
        let el = this.$el;
        let comp = this;
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);

        /**
         * The condition e.relatedTarget !== null is a fix for firefox triggering the mouseenter event several times. The
         * wrong events have a null relatedTarget in FF.
         */
        function onMouseEnter(e) {
            if (dnd.inProgress && comp.overridableAcceptsType(dnd.type) && e.relatedTarget !== null) {
                dnd.mouseEnter(comp);
            }
        }

        /**
         * The condition e.relatedTarget !== null is a fix for firefox triggering the mouseenter event several times. The
         * wrong events have a null relatedTarget in FF.
         */
        function onMouseLeave(e) {
            if (dnd.inProgress && comp.overridableAcceptsType(dnd.type) && e.relatedTarget !== null) {
                dnd.mouseLeave(comp);
            }
        }

        /* function onDrop(e) {
             if (dndimpl.inProgress && comp.overridableAcceptsType(dndimpl.type)) {
                 if (comp === dndimpl.top() && comp.compatibleModes() && comp.overridableAcceptsData(dndimpl.data, dndimpl.type)) {
                     comp.$emit('drop', new DnDEvent(dndimpl.type, dndimpl.data, e));
                     comp.$emit('dragleave', new DnDEvent(dndimpl.type, dndimpl.data, e));
                     if (!comp['reordering']) {
                         dndimpl.source.$emit(comp.mode, new DnDEvent(dndimpl.type, dndimpl.data, e));
                     }
                 }
             }
         }*/

    }

    compatibleModes() {
        return (this.mode === 'copy' || dnd.source.$listeners[this.mode]);
    }

    get dropIn() {
        if (this.dragInProgress) {
            return this.dragTop === this;
        } else {
            return null;
        }
    }

    get typeAllowed() {
        if (this.dragInProgress) {
            return this._acceptsType(dnd.type);
        } else {
            return null;
        }
    }

    get dropAllowed() {
        if (this.dragInProgress) {
            if (this.typeAllowed) {
                return this['reordering'] || (this.compatibleModes() && this.overridableAcceptsData(dnd.data, dnd.type));
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    get cssClasses() {
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

    get cssStyle() {
        if (this.dropAllowed && this.dropIn) {
            return {cursor: this.cursor + ' !important'};
        } else {
            return {cursor: 'inherit'};
        }
    }

    createDragImage() {
        let image;
        if (this.$refs['drag-image']) {
            let el = this.$refs['drag-image'] as HTMLElement;
            if (el.childElementCount !== 1) {
                image = createDragImage(el);
            } else {
                image = createDragImage(el.children.item(0) as HTMLElement);
            }
        } else {
            image = 'source';
        }
        return image;
    }

}