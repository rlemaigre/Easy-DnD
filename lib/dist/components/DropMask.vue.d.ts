import DragAwareMixin from "../mixins/DragAwareMixin";
export default class DropMask extends DragAwareMixin {
    isDropMask: boolean;
    tag: any;
    mounted(): void;
    createDragImage(): string;
}
