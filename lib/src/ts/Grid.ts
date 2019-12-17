export default class Grid {

    centers: { x, y }[] = [];

    constructor(collection: HTMLCollection) {
        for (let child of collection) {
            let rect = child.getBoundingClientRect();
            this.centers.push({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            });
        }
    }

    closestIndex(position: { x, y }) {
        let minDist = 999999;
        let index = -1;
        for (let i = 0; i < this.centers.length; i++) {
            let center = this.centers[i];
            let dist = Math.sqrt(Math.pow(center.x - position.x, 2) + Math.pow(center.y - position.y, 2));
            if (dist < minDist) {
                minDist = dist;
                index = i;
            }
        }
        return index;
    }

}