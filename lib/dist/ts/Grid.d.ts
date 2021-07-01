export default class Grid {
    reference: HTMLElement;
    referenceOriginalPosition: {
        x: any;
        y: any;
    };
    magnets: {
        x: any;
        y: any;
    }[];
    constructor(collection: HTMLCollection, upToIndex: number, row: string, fromIndex: number);
    /**
     * Returns the center of the rectangle.
     */
    center(rect: DOMRect): {
        x: number;
        y: number;
    };
    /**
     * When horizontal is true / false, returns middle of the left / top side of the rectangle.
     */
    before(rect: DOMRect, horizontal: boolean): {
        x: number;
        y: number;
    };
    /**
     * When horizontal is true / false, returns middle of the right / bottom side of the rectangle.
     */
    after(rect: DOMRect, horizontal: boolean): {
        x: number;
        y: number;
    };
    /**
     * In case the user scrolls during the drag, the position of the magnets are not what they used to be when the drag
     * started. A correction must be applied that takes into account the amount of scroll. This correction is the
     * difference between the current position of the parent element and its position when the drag started.
     */
    correction(): {
        x: any;
        y: any;
    };
    closestIndex(position: {
        x: any;
        y: any;
    }): number;
}
