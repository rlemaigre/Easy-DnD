import DragAwareMixin from "./DragAwareMixin";
export default class DragMixin extends DragAwareMixin {
    isDrag: boolean;
    type: string;
    data: any;
    mouseIn: boolean;
    created(): void;
    mounted(): void;
    readonly dragIn: boolean;
    readonly cssClasses: {
        'drag-in': boolean;
        'drag-out': boolean;
    };
    createDragImage(selfTransform: string): any;
}
