import {Component, Prop, Vue} from "vue-property-decorator";
import DragAwareMixin from "./DragAwareMixin";
import {createDragImage} from "../ts/createDragImage";
import {DnDEvent} from "../ts/events";
import {dnd} from "../ts/DnD";

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

    constructor() {
        super();
    }

    effectiveAcceptsType(type: string) {
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

    effectiveAcceptsData(data: any, type: any) {
        return this.acceptsData(data, type);
    }

    created() {
        dnd.on("dragpositionchanged", this.onDragPositionChanged);
        dnd.on("dragtopchanged", this.onDragTopChanged);
        dnd.on("drop", this.onDrop);
    }

    destroyed() {
        dnd.off("dragpositionchanged", this.onDragPositionChanged);
        dnd.off("dragtopchanged", this.onDragTopChanged);
        dnd.off("drop", this.onDrop);
    }

    onDragPositionChanged(event: DnDEvent) {
        if (this === event.top) {
            this.$emit("dragover", event);
        }
    }

    onDragTopChanged(event: DnDEvent) {
        if (this === event.top) {
            this.$emit("dragenter", event);
        }
        if (this === event.previousTop) {
            this.$emit("dragleave", event);
        }
    }

    onDrop(event: DnDEvent) {
        if (event.top === this && this.compatibleModes(event.source) && this.effectiveAcceptsData(event.data, event.type)) {
            this.doDrop(event);
        }
    }

    doDrop(event: DnDEvent) {
        this.$emit('drop', event);
    }

    mounted() {
        let el = this.$el;
        let comp = this;
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);

        function onMouseEnter(e) {
            dnd.mouseEnter(comp, e);
        }

        function onMouseLeave(e) {
            dnd.mouseLeave(comp, e);
        }

    }

    compatibleModes(source: Vue) {
        return this.mode === 'copy' || source.$listeners[this.mode];
    }

    get compatibleMode() {
        if (this.dragInProgress) {
            return this.compatibleModes(this.dragSource);
        } else {
            return null;
        }
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
            return this.effectiveAcceptsType(this.dragType);
        } else {
            return null;
        }
    }

    get dropAllowed() {
        if (this.dragInProgress) {
            if (this.typeAllowed) {
                return this.compatibleMode && this.effectiveAcceptsData(this.dragData, this.dragType);
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