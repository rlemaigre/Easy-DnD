import DragAwareMixin from "./DragAwareMixin";
export default class DragMixin extends DragAwareMixin {
    isDrag: boolean;
    type: string;
    data: any;
    dragImageOpacity: any;
    disabled: boolean;
    goBack: boolean;
    handle: string | undefined;
    delta: number;
    mouseIn: boolean;
    created(): void;
    mounted(): void;
    get dragIn(): boolean;
    get cssClasses(): {
        'drag-source': boolean;
        'drag-in': boolean;
        'drag-out': boolean;
        'drag-mode-copy': boolean;
        'drag-mode-cut': boolean;
        'drag-mode-reordering': boolean;
    } | {
        'drag-source'?: undefined;
        'drag-in'?: undefined;
        'drag-out'?: undefined;
        'drag-mode-copy'?: undefined;
        'drag-mode-cut'?: undefined;
        'drag-mode-reordering'?: undefined;
    };
    get currentDropMode(): any;
    createDragImage(selfTransform: string): any;
}
