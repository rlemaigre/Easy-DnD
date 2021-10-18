import DragAwareMixin from "./DragAwareMixin";
export default class DragMixin extends DragAwareMixin {
    type: string;
    data: any;
    dragImageOpacity: any;
    disabled: boolean;
    goBack: boolean;
    handle: string | undefined;
    delta: number;
    delay: number;
    dragClass: String;
    vibration: number;
    scrollingEdgeSize: number;
    dragInitialised: boolean;
    created(): void;
    reEmit(eventName: string): void;
    mounted(): void;
    get cssClasses(): any;
    get currentDropMode(): any;
    createDragImage(selfTransform: string): any;
}
