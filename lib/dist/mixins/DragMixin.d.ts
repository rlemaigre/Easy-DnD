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
    reEmit(eventName: string): void;
    mounted(): void;
    get dragIn(): boolean;
    get cssClasses(): any;
    get currentDropMode(): any;
    createDragImage(selfTransform: string): any;
}
