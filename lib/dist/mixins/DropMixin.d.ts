import DragAwareMixin from "./DragAwareMixin";
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
    _acceptsType(type: string): boolean;
    overridableAcceptsType(type: string): boolean;
    overridableAcceptsData(data: any, type: any): boolean;
    mounted(): void;
    compatibleModes(): true | Function | Function[];
    readonly dropIn: boolean;
    readonly typeAllowed: boolean;
    readonly dropAllowed: any;
    readonly cssClasses: {};
    readonly cssStyle: {
        cursor: string;
    };
    createDragImage(): any;
}
