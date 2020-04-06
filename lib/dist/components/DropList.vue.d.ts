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
    get reordering(): boolean;
    get closestIndex(): number;
    get dropAllowed(): boolean;
    get itemsBeforeFeedback(): any[];
    get itemsAfterFeedback(): any[];
    get reorderedItems(): any[];
    get clazz(): {
        'drop-list': boolean;
        reordering: boolean;
        inserting: boolean;
    };
    get style(): {
        cursor?: string;
    };
    get showDragFeedback(): boolean;
    get showInsertingDragImage(): boolean;
    get showReorderingDragImage(): boolean;
    doDrop(event: DnDEvent): void;
    candidate(): boolean;
    computeForbiddenKeys(): (string | number)[];
    computeFeedbackKey(): any;
    computeInsertingGrid(): Grid;
    computeReorderingGrid(): Grid;
    createDragImage(): any;
}
