export default class Grid {
    centers: {
        x: any;
        y: any;
    }[];
    constructor(collection: HTMLCollection, upToIndex: number);
    closestIndex(position: {
        x: any;
        y: any;
    }): number;
}
