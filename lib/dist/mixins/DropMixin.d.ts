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
    mode: string;
    dragImageOpacity: any;
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
    get compatibleMode(): any;
    get dropIn(): boolean;
    get typeAllowed(): boolean;
    get dropAllowed(): boolean;
    get cssClasses(): any;
    get cssStyle(): {};
    /**
     * Returns true if the current drop area participates in the current drag operation.
     */
    candidate(type: any, data: any, source: Vue): boolean;
    createDragImage(): any;
}
