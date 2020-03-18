import DragAwareMixin from "./DragAwareMixin";
export default class DragMixin extends DragAwareMixin {
    isDrag: boolean;
    type: string;
    data: any;
    dragImageOpacity: any;
    mouseIn: boolean;
    created(): void;
    mounted(): void;
    readonly dragIn: boolean;
    readonly cssClasses: {
        'drag-source': boolean;
        'drag-in': boolean;
        'drag-out': boolean;
        'drag-mode-copy': boolean;
        'drag-mode-cut': boolean;
        'drag-mode-reordering': boolean;
    };
    readonly currentDropMode: any;
    createDragImage(selfTransform: string): any;
}
