import {Vue} from "vue-property-decorator";

/**
 * This is the class of the global object that holds the state of the drag and drop during its progress. It emits events
 * reporting its state evolution during the progress of the drag and drop. Its data is reactive and listeners can be
 * attachted to it using the method on.
 */
// todo - this class ios completely broken
export class DnD {

    public inProgress = false;
    public type: any = null;
    public data: any = null;
    public source: Vue = null;
    public top: Vue = null;
    public position: { x: number, y: number } = null;
    private eventBus = new Vue();
    public sourceListeners = null;
    public success: Boolean = null;

    constructor() {
    }

    public startDrag(source: Vue, event: MouseEvent | TouchEvent, x, y, type, data) {
        this.type = type;
        this.data = data;
        this.source = source;
        this.position = { x, y };
        this.top = null;
        this.sourceListeners = source.$listeners;
        this.inProgress = true;
        this.emit(event, "dragstart");
        this.emit(event, "dragtopchanged", {previousTop: null});
    }

    private resetVariables () {
        this.inProgress = false;
        this.data = null;
        this.source = null;
        this.position = null;
        this.success = null;
    }

    public stopDrag(event: MouseEvent | TouchEvent) {
        this.success = this.top !== null && this.top['compatibleMode'] && this.top['dropAllowed'];
        if (this.top !== null) {
            this.emit(event, "drop");
        }
        this.emit(event, "dragend");
        this.resetVariables();
    }

    public cancelDrag (event: KeyboardEvent) {
        this.success = false;
        this.emit(event, "dragend");
        this.resetVariables();
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
                this.emit(event.detail.native, 'dragtopchanged', {previousTop: previousTop});
            }
            this.position = {
                x: event.detail.x,
                y: event.detail.y
            };
            this.emit(event.detail.native, 'dragpositionchanged');
        }
    }

    private emit(native, event, data?) {
        this.eventBus.$emit(event, {
            type: this.type,
            data: this.data,
            top: this.top,
            source: this.source,
            position: this.position,
            success: this.success,
            native,
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
