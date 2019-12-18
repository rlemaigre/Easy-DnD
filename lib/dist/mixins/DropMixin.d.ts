import { Vue } from "vue-property-decorator";
import DragAwareMixin from "./DragAwareMixin";
import { DnDEvent } from "../ts/events";
export default class DropMixin extends DragAwareMixin {
    isDrop: boolean;
    acceptsType: string | string[] | {
        (type: any): boolean;
    };
    acceptsData: {
        (data: any, type: string): boolean;
    };
    cursor: string;
    mode: string;
    constructor();
    effectiveAcceptsType(type: string): boolean;
    effectiveAcceptsData(data: any, type: any): boolean;
    created(): void;
    destroyed(): void;
    onDragPositionChanged(event: DnDEvent): void;
    onDragTopChanged(event: DnDEvent): void;
    onDrop(event: DnDEvent): void;
    doDrop(event: DnDEvent): void;
    mounted(): void;
    readonly compatibleMode: boolean;
    readonly dropIn: boolean;
    readonly typeAllowed: boolean;
    readonly dropAllowed: boolean;
    readonly cssClasses: {};
    readonly cssStyle: {
        cursor: string;
    };
    /**
     * Returns true if the current drop area participates in the current drag operation.
     */
    candidate(type: any, data: any, source: Vue): boolean;
    createDragImage(): any;
}
