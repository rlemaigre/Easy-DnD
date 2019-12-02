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
    mounted(): void;
    compatibleModes(): true | Function | Function[];
    readonly dropIn: boolean;
    readonly typeAllowed: boolean;
    readonly dropAllowed: boolean;
}
