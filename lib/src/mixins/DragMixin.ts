import {Component, Prop} from "vue-property-decorator";
import {createDragImage, DnDEvent, dndimpl} from "../ts/utils";
import DragAwareMixin from "./DragAwareMixin";

@Component({})
export default class DragMixin extends DragAwareMixin {

    isDrag = true;

    @Prop({default: null, type: null})
    type: string;

    @Prop({default: null, type: null})
    data: any;

    mouseIn: boolean = null;

    mounted() {
        let comp = this;
        let el = this.$el;
        let dragStarted = false;
        let initialUserSelect;
        el.addEventListener('mousedown', startDragging);
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
                comp.$emit('dragstart', new DnDEvent(comp.type, comp.data, e));
                dndimpl.init(comp, e, comp.type, comp.data);
                document.documentElement.classList.add('drag-in-progress');
            }
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

    get dragIn() {
        return !dndimpl.inProgress && this.mouseIn;
    }

    get cssClasses() {
        return {
            'drag-in': this.dragIn,
            'drag-out': !this.dragIn
        };
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
        return image;
    }

}