export default class Grid {
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
    closestIndex(position: {
        x: any;
        y: any;
    }): number;
}
