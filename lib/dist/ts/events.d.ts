import { Vue } from "vue-property-decorator";
export declare class DnDEvent {
    type: any;
    data: any;
    top: Vue;
    previousTop: Vue;
    source: Vue;
    position: {
        x: any;
        y: any;
    };
    success: Boolean;
    native: TouchEvent | MouseEvent;
}
export declare class ReorderEvent {
    from: number;
    to: number;
    constructor(from: number, to: number);
    apply(array: any[]): void;
}
export declare class InsertEvent {
    type: any;
    data: any;
    index: number;
    constructor(type: any, data: any, index: number);
}
