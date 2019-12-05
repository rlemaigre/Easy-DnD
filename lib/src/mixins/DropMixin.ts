import {Component, Prop} from "vue-property-decorator";
import {createDragImage, DnDEvent, dndimpl} from "../ts/utils";
import DragAwareMixin from "./DragAwareMixin";

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

    mounted() {
        let el = this.$el;
        let comp = this;
        el.addEventListener('mouseenter', onDragEnter);
        el.addEventListener('mouseleave', onDragLeave);
        el.addEventListener('mousemove', onDragOver);
        el.addEventListener('mouseup', onDrop);

        /**
         * The condition e.relatedTarget !== null is a fix for firefox triggering the mouseenter event several times. The
         * wrong events have a null relatedTarget in FF.
         */
        function onDragEnter(e) {
            if (dndimpl.inProgress && comp._acceptsType(dndimpl.type) && e.relatedTarget !== null) {
                dndimpl.mouseEnter(comp, e);
            }
        }

        /**
         * The condition e.relatedTarget !== null is a fix for firefox triggering the mouseenter event several times. The
         * wrong events have a null relatedTarget in FF.
         */
        function onDragLeave(e) {
            if (dndimpl.inProgress && comp._acceptsType(dndimpl.type) && e.relatedTarget !== null) {
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
                    comp.$emit('dragleave', new DnDEvent(dndimpl.type, dndimpl.data, e));
                    dndimpl.source.$emit(comp.mode, new DnDEvent(dndimpl.type, dndimpl.data, e));
                }
            }
        }

    }

    compatibleModes() {
        return (this.mode === 'copy' || dndimpl.source.$listeners[this.mode]);
    }

    get dropIn() {
        if (dndimpl.inProgress) {
            return dndimpl.top() === this;
        } else {
            return null;
        }
    }

    get typeAllowed() {
        if (dndimpl.inProgress) {
            return this._acceptsType(dndimpl.type);
        } else {
            return null;
        }
    }

    get dropAllowed() {
        if (dndimpl.inProgress) {
            if (this.typeAllowed) {
                return this.compatibleModes() && this.acceptsData(dndimpl.data, dndimpl.type);
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