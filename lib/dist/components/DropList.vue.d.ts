import DropMixin from "../mixins/DropMixin";
import Grid from "../ts/Grid";
import { DnDEvent } from "../ts/events";
export default class DropList extends DropMixin {
    tag: string | object;
    items: any[];
    grid: Grid;
    forbiddenKeys: any[];
    feedbackKey: any;
    fromIndex: number;
    created(): void;
    destroyed(): void;
    onDragStart(event: DnDEvent): void;
    onDragEnd(): void;
    readonly reordering: boolean;
    readonly closestIndex: number;
    readonly dropAllowed: boolean;
    readonly itemsBeforeFeedback: any[];
    readonly itemsAfterFeedback: any[];
    readonly reorderedItems: any[];
    readonly clazz: {
        'drop-list': boolean;
        'reordering': boolean;
        'inserting': boolean;
    };
    readonly style: {};
    readonly showDragFeedback: boolean;
    readonly showInsertingDragImage: boolean;
    readonly showReorderingDragImage: boolean;
    doDrop(event: DnDEvent): void;
    candidate(): boolean;
    computeForbiddenKeys(): (string | number)[];
    computeFeedbackKey(): any;
    computeInsertingGrid(): Grid;
    computeReorderingGrid(): Grid;
    createDragImage(): any;
}
