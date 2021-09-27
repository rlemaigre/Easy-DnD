import {Component, Prop} from "vue-property-decorator";
import DragAwareMixin from "./DragAwareMixin";
import {createDragImage} from "../ts/createDragImage";
import {dnd} from "../ts/DnD";
import scrollparent from './../js/scrollparent'
import {cancelScrollAction, performEdgeScroll} from './../js/edgescroller'

@Component({})
export default class DragMixin extends DragAwareMixin {

    isDrag = true;

    @Prop({default: null, type: null})
    type: string;

    @Prop({default: null, type: null})
    data: any;

    @Prop({default: 0.7, type: Number})
    dragImageOpacity: any;

    @Prop({default: false, type: Boolean})
    disabled: boolean;

    @Prop({default: false, type: Boolean})
    goBack: boolean;

    @Prop({required: false, type: String})
    handle: string | undefined;

    @Prop({type: Number, default: 3})
    delta: number;

    @Prop({type: Number, default: 0})
    delay: number;

    @Prop({type: String, default: null})
    dragClass: String;

    @Prop({type: Number, default: 0})
    vibration: number;

    @Prop ({type: Number, default: 100})
    scrollingEdgeSize: number;

    mouseIn: boolean = null;


    created() {
        this.reEmit("dragstart");
        this.reEmit("dragend");
    }

    reEmit(eventName: string) {
        dnd.on(eventName, (ev) => {
            if (ev.source === this) {
                this.$emit(eventName, ev);
            }
        });
    }

    mounted() {
        let comp = this;
        let el = this.$el as HTMLElement;
        let dragStarted = false;
        let ignoreNextClick = false;
        let initialUserSelect;
        let downEvent: TouchEvent | MouseEvent = null;
        let startPosition = null;
        let delayTimer = null;
        let scrollContainer = null;
        let hasPassedDelay = true;

        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('touchstart', onMouseDown);
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

        function performVibration () {
            // If browser can perform vibration and user has defined a vibration, perform it
            if (comp.vibration > 0 && window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(comp.vibration);
            }
        }

        function onMouseDown(e: MouseEvent | TouchEvent) {
            let target: HTMLElement;
            let goodButton: boolean;
            if (e.type === 'mousedown') {
                const mouse = e as MouseEvent;
                target = e.target as HTMLElement;
                goodButton = mouse.buttons === 1;
            } else {
                const touch = e as TouchEvent;
                target = touch.touches[0].target as HTMLElement;
                goodButton = true;
            }
            let goodTarget = !comp.handle || target.matches(comp.handle + ', ' + comp.handle + ' *');
            if (!comp.disabled && downEvent === null && goodButton && goodTarget) {
                scrollContainer = scrollparent(target);
                initialUserSelect = document.body.style.userSelect;
                document.documentElement.style.userSelect = 'none'; // Permet au drag de se poursuivre normalement même
                // quand on quitte un élémént avec overflow: hidden.
                dragStarted = false;
                downEvent = e;
                if (downEvent.type === 'mousedown') {
                    const mouse = event as MouseEvent;
                    startPosition = {
                        x: mouse.clientX,
                        y: mouse.clientY
                    };
                } else {
                    const touch = event as TouchEvent;
                    startPosition = {
                        x: touch.touches[0].clientX,
                        y: touch.touches[0].clientY
                    };
                }

                if (!!comp.delay) {
                    hasPassedDelay = false;
                    clearTimeout(delayTimer);
                    delayTimer = setTimeout(() => {
                        hasPassedDelay = true;
                        performVibration();
                    }, comp.delay);
                }
                else {
                    performVibration();
                }

                document.addEventListener('click', onMouseClick, true);
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('touchmove', onMouseMove, {passive: false});
                document.addEventListener('easy-dnd-move', onEasyDnDMove);
                document.addEventListener('mouseup', onMouseUp);
                document.addEventListener('touchend', onMouseUp);
                document.addEventListener('selectstart', noop);
                document.addEventListener('keyup', onKeyUp)

                // Prevents event from bubbling to ancestor drag components and initiate several drags at the same time
                e.stopPropagation();
                // Prevents touchstart event to be converted to mousedown
                //e.preventDefault();
            }
        }

        // Prevent the user from accidentally causing a click event
        // if they have just attempted a drag event
        function onMouseClick (e) {
            if (ignoreNextClick) {
                e.preventDefault();
                e.stopPropagation && e.stopPropagation();
                e.stopImmediatePropagation && e.stopImmediatePropagation();
                ignoreNextClick = false;
                return false;
            }
        }

        function onMouseMove(e: TouchEvent | MouseEvent) {
            // We ignore the mousemove event that follows touchend :
            if (downEvent === null) return;

            // On touch devices, we ignore fake mouse events and deal with touch events only.
            if (downEvent.type === 'touchstart' && e.type === 'mousemove') return;

            // Find out event target and pointer position :
            let target: Element;
            let x: number;
            let y: number;
            if (e.type === 'touchmove') {
                let touch = e as TouchEvent;
                x = touch.touches[0].clientX;
                y = touch.touches[0].clientY;
                target = document.elementFromPoint(x, y);
                if (!target) {
                    // Mouse going off screen. Ignore event.
                    return;
                }
            } else {
                let mouse = e as MouseEvent;
                x = mouse.clientX;
                y = mouse.clientY;
                target = mouse.target as Element;
            }

            // Distance between current event and start position :
            let dist = Math.sqrt(Math.pow(startPosition.x - x, 2) + Math.pow(startPosition.y - y, 2));

            // If the drag has not begun yet and distance from initial point is greater than delta, we start the drag :
            if (!dragStarted && dist > comp.delta) {
                // If they have dragged greater than the delta before the delay period has ended,
                // It means that they attempted to perform another action (such as scrolling) on the page
                if (!hasPassedDelay) {
                    clearTimeout(delayTimer);
                }
                else {
                    ignoreNextClick = true;
                    dragStarted = true;
                    dnd.startDrag(comp, downEvent, startPosition.x, startPosition.y, comp.type, comp.data);
                    document.documentElement.classList.add('drag-in-progress');
                }
            }

            // Dispatch custom easy-dnd-move event :
            if (dragStarted) {
                // If cursor/touch is at edge of container, perform scroll if available
                // If comp.dragTop is defined, it means they are dragging on top of another DropList/EasyDnd component
                // if dropTop is a DropList, use the scrollingEdgeSize of that container if it exists, otherwise use the scrollingEdgeSize of the Drag component
                const currEdgeSize = comp.dragTop && comp.dragTop.$props.scrollingEdgeSize !== undefined ?
                    comp.dragTop.$props.scrollingEdgeSize :
                    comp.scrollingEdgeSize;

                if (!!currEdgeSize) {
                    const currScrollContainer = comp.dragTop ? scrollparent(comp.dragTop.$el) : scrollContainer;
                    performEdgeScroll(e, currScrollContainer, x, y, currEdgeSize);
                }
                else {
                    cancelScrollAction();
                }

                let custom = new CustomEvent("easy-dnd-move", {
                    bubbles: true,
                    cancelable: true,
                    detail: {
                        x,
                        y,
                        native: e
                    }
                });
                target.dispatchEvent(custom);
            }

            // Prevent scroll on touch devices if they were performing a drag
            if (hasPassedDelay && e.cancelable) {
                e.preventDefault();
            }
        }

        function onEasyDnDMove(e) {
            dnd.mouseMove(e, null);
        }

        function onMouseUp(e: MouseEvent | TouchEvent) {
            // On touch devices, we ignore fake mouse events and deal with touch events only.
            if (downEvent.type === 'touchstart' && e.type === 'mouseup') return;

            // This delay makes sure that when the click event that results from the mouseup is produced, the drag is
            // still in progress. So by checking the flag dnd.inProgress, one can tell apart true clicks from drag and
            // drop artefacts.
            setTimeout(() => {
                cancelDragActions();

                if (dragStarted) {
                    dnd.stopDrag(e);
                }
                finishDrag();
            }, 0);
        }

        function onKeyUp (e: KeyboardEvent) {
            // If ESC is pressed, cancel the drag
            if (e.key === 'Escape') {
                cancelDragActions();

                setTimeout(() => {
                    dnd.cancelDrag(e);
                    finishDrag();
                }, 0);
            }
        }

        function cancelDragActions () {
            hasPassedDelay = true;
            clearTimeout(delayTimer);
            cancelScrollAction();
        }

        function finishDrag () {
            downEvent = null;
            scrollContainer = null;

            if (dragStarted) {
                document.documentElement.classList.remove('drag-in-progress');
            }
            document.removeEventListener('click', onMouseClick, true);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('easy-dnd-move', onEasyDnDMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchend', onMouseUp);
            document.removeEventListener('selectstart', noop);
            document.removeEventListener('keyup', onKeyUp);
            document.documentElement.style.userSelect = initialUserSelect;
        }
    }

    get dragIn() {
        return !this.dragInProgress && this.mouseIn;
    }

    get cssClasses() {
        let clazz = {
            'dnd-drag': true
        } as any;
        if (!this.disabled) {
            return {
                ...clazz,
                'drag-source': this.dragInProgress && this.dragSource === this,
                'drag-in': this.dragIn,
                'drag-out': !this.dragIn,
                'drag-mode-copy': this.currentDropMode === 'copy',
                'drag-mode-cut': this.currentDropMode === 'cut',
                'drag-mode-reordering': this.currentDropMode === 'reordering',
                'drag-no-handle': !this.handle
            };
        } else {
            return clazz;
        }
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
        if (this.$scopedSlots['drag-image']) {
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
        if (this.dragClass) {
            image.classList.add(this.dragClass)
        }
        image.classList.add('dnd-ghost')
        image['__opacity'] = this.dragImageOpacity;
        return image;
    }

}
