import {Component, Prop} from "vue-property-decorator";
import DragAwareMixin from "./DragAwareMixin";
import {createDragImage} from "../ts/createDragImage";
import {dnd} from "../ts/DnD";

@Component({})
export default class DragMixin extends DragAwareMixin {

    isDrag = true;

    @Prop({default: null, type: null})
    type: string;

    @Prop({default: null, type: null})
    data: any;

    @Prop({default: 0.7, type: Number})
    dragImageOpacity: any;

    mouseIn: boolean = null;

    created() {
        dnd.on("dragstart", (event) => this.$emit("dragstart", event));
        dnd.on("dragend", (event) => this.$emit("dragend", event));
    }

    mounted() {
        let comp = this;
        let el = this.$el;
        let dragStarted = false;
        let initialUserSelect;
        let mouseDownEvent = null;
        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);

        function onMouseEnter() {
            comp.mouseIn = true;
        }

        function onMouseLeave() {
            comp.mouseIn = false;
        }

        function noop(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        function onMouseDown(e) {
            initialUserSelect = document.body.style.userSelect;
            document.documentElement.style.userSelect = 'none'; // Permet au drag de se poursuivre normalement même
            // quand on quitte un élémént avec overflow: hidden.
            dragStarted = false;
            document.addEventListener('mousemove', doDrag);
            document.addEventListener('mouseup', stopDragging);
            document.addEventListener('selectstart', noop);
            mouseDownEvent = e;
        }

        function doDrag(e) {
            if (!dragStarted) {
                dragStarted = true;
                dnd.startDrag(comp, mouseDownEvent, comp.type, comp.data);
                document.documentElement.classList.add('drag-in-progress');
            }
            dnd.mouseMove(e);
        }

        function stopDragging(e) {
            if (dragStarted) {
                document.documentElement.classList.remove('drag-in-progress');
                dnd.stopDrag();
                e.stopPropagation();
                e.preventDefault();
            }
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDragging);
            document.removeEventListener('selectstart', noop);
            document.documentElement.style.userSelect = initialUserSelect;
        }
    }

    get dragIn() {
        return !this.dragInProgress && this.mouseIn;
    }

    get cssClasses() {
        return {
            'drag-source': this.dragInProgress && this.dragSource === this,
            'drag-in': this.dragIn,
            'drag-out': !this.dragIn,
            'drag-mode-copy': this.currentDropMode === 'copy',
            'drag-mode-cut': this.currentDropMode === 'cut',
            'drag-mode-reordering': this.currentDropMode === 'reordering',
        };
    }

    get currentDropMode() {
        if (this.dragInProgress && this.dragSource === this) {
            if (this.dragTop && this.dragTop['dropAllowed']) {
                if (this.dragTop['reordering'])
                    return 'reordering';
                else
                    return this.dragTop['mode'];
            } else {
                return null;
            }
        } else {
            return null;
        }

    }

    createDragImage(selfTransform: string) {
        let image;
        if (this.$refs['drag-image']) {
            let el = this.$refs['drag-image'] as HTMLElement;
            if (el.childElementCount !== 1) {
                image = createDragImage(el);
            } else {
                image = createDragImage(el.children.item(0) as HTMLElement);
            }
        } else {
            image = createDragImage(this.$el as HTMLElement);
            image.style.transform = selfTransform;
        }
        image['__opacity'] = this.dragImageOpacity;
        return image;
    }

}