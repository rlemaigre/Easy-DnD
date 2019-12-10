import DropMixin from "../mixins/DropMixin";
import { DnDEvent } from "..";
export default class DropList extends DropMixin {
    tag: string | object;
    items: any[];
    grid: any;
    forbiddenKeys: any[];
    feedbackKey: any;
    created(): void;
    onDrop(event: DnDEvent): void;
    onItemsChange(): void;
    onDragInProgressChange(val: any): void;
    overridableAcceptsData(data: any, type: any): boolean;
    onDragEnter(): void;
    computeGrid(collection: HTMLCollection): any[];
    onDragLeave(): void;
    readonly closestIndex: number;
    readonly itemsBeforeFeedback: any[];
    readonly itemsAfterFeedback: any[];
    readonly reorderedItems: any[];
    readonly clazz: {
        'drop-list': boolean;
        'tg': boolean;
        'reordering': boolean;
    };
    readonly showDragImage: import("vue/types/vnode").NormalizedScopedSlot;
    readonly showFeedback: boolean;
    readonly reordering: boolean;
    readonly fromIndex: any;
    createDragImage(): any;
}
