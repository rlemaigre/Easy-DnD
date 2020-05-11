import { Vue } from "vue-property-decorator";
/**
 * This class reacts to drag events emitted by the dnd object to manage a sequence of drag images and fade from one to the
 * other as the drag progresses.
 */
export declare class DragImagesManager extends Vue {
    selfTransform: string;
    clones: Map<Vue, HTMLElement>;
    source: Vue;
    sourceClone: HTMLElement;
    constructor();
    onDragStart(event: any): void;
    onDragEnd(event: any): void;
    onDragTopChanged(event: any): void;
    getSourceClone(): HTMLElement;
    onDragPositionChanged(event: any): void;
}
