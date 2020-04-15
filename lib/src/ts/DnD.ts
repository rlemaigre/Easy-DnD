import {Vue} from "vue-property-decorator";

/**
 * This is the class of the global object that holds the state of the drag and drop during its progress. It emits events
 * reporting its state evolution during the progress of the drag and drop. Its data is reactive and listeners can be
 * attachted to it using the method on.
 */
export class DnD {

    public inProgress = false;
    public type: any = null;
    public data: any = null;
    public source: Vue = null;
    public top: Vue = null;
    public position: { x: number, y: number } = null;
    private eventBus = new Vue();

    constructor() {
    }

    public startDrag(source: Vue, event: MouseEvent, type, data) {
        this.type = type;
        this.data = data;
        this.source = source;
        this.position = {
            x: event.clientX,
            y: event.clientY
        };
        this.inProgress = true;
        this.emit("dragstart");
        this.emit('dragtopchanged', {previousTop: null});
        this.emit('dragpositionchanged');
    }

    public stopDrag() {
        if (this.top !== null) {
            this.emit("drop");
        }
        this.emit('dragtopchanged', {
            previousTop: this.top,
            to: null
        });
        this.emit("dragend");
        this.inProgress = false;
        this.data = null;
        this.source = null;
        this.position = null;
    }

    public mouseMove(event, comp: Vue) {
        if (this.inProgress) {
            let prevent = false;
            let previousTop = this.top;
            if (comp === null) {
                // The mouse move event reached the top of the document without hitting a drop component.
                this.top = null;
                prevent = true;
            } else if (comp['isDropMask']) {
                // The mouse move event bubbled until it reached a drop mask.
                this.top = null;
                prevent = true;
            } else if (comp['candidate'](this.type, this.data, this.source)) {
                // The mouse move event bubbled until it reached a drop component that participates in the current drag operation.
                this.top = comp;
                prevent = true;
            }
            if (prevent) {
                // We prevent the mouse move event from bubbling further up the tree because it reached the foremost drop component and that component is all that matters.
                event.stopPropagation();
            }
            if (this.top !== previousTop) {
                this.emit('dragtopchanged', {previousTop: previousTop});
            }
            this.position = {
                x: event.detail.x,
                y: event.detail.y
            };
            this.emit('dragpositionchanged');
        }
    }

    private emit(event, data?) {
        this.eventBus.$emit(event, {
            type: this.type,
            data: this.data,
            top: this.top,
            source: this.source,
            position: this.position,
            ...data
        });
    }

    public on(event, callback) {
        this.eventBus.$on(event, callback);
    }

    public off(event, callback) {
        this.eventBus.$off(event, callback);
    }

}

export let dnd = new DnD();
dnd = Vue.observable(dnd);