import { Vue } from "vue-property-decorator";
/**
 * This is the class of the global object that holds the state of the drag and drop during its progress. It emits events
 * reporting its state evolution during the progress of the drag and drop. Its data is reactive and listeners can be
 * attachted to it using the method on.
 */
export declare class DnD {
    inProgress: boolean;
    type: any;
    data: any;
    source: Vue;
    top: Vue;
    position: {
        x: number;
        y: number;
    };
    private eventBus;
    sourceListeners: any;
    constructor();
    startDrag(source: Vue, event: MouseEvent | TouchEvent, x: any, y: any, type: any, data: any): void;
    stopDrag(event: MouseEvent | TouchEvent): void;
    mouseMove(event: any, comp: Vue): void;
    private emit;
    on(event: any, callback: any): void;
    off(event: any, callback: any): void;
}
export declare let dnd: DnD;
