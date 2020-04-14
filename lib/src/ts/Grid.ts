export default class Grid {

    magnets: { x, y }[] = [];

    constructor(collection: HTMLCollection, upToIndex: number, row: string, fromIndex: number) {
        let index = 0;
        for (let child of collection) {
            if (index > upToIndex) break;
            let rect = child.getBoundingClientRect();
            let hasNestedDrop = child.classList.contains("dnd-drop") || child.getElementsByClassName("dnd-drop").length > 0;
            let horizontal = null;
            if (hasNestedDrop) {
                if (row === 'auto') {
                    // Auto mode not supported for now. Row or column must be defined explicitly if there are nested drop lists.
                    throw new Error("Easy-DnD error : a drop list is missing one of these attributes : 'row' or 'column'.");
                } else {
                    horizontal = row === 'row';
                }
            }
            if (fromIndex === null) {
                // Inserting mode.
                this.magnets.push(hasNestedDrop ? this.before(rect, horizontal) : this.center(rect));
            } else {
                // Reordering mode.
                this.magnets.push(hasNestedDrop ? (
                    fromIndex < index ? this.after : this.before
                )(rect, horizontal) : this.center(rect));
            }
            // Debug : show magnets :
            //document.body.insertAdjacentHTML("beforeend", "<div style='background-color: red; position: fixed; width: 1px; height: 1px; top:" + this.magnets[index].y + "px; left:" + this.magnets[index].x + "px;' ></div>")
            index++;
        }
    }

    /**
     * Returns the center of the rectangle.
     */
    center(rect: DOMRect) {
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    /**
     * When horizontal is true / false, returns middle of the left / top side of the rectangle.
     */
    before(rect: DOMRect, horizontal: boolean) {
        return horizontal ? {
            x: rect.left,
            y: rect.top + rect.height / 2
        } : {
            x: rect.left + rect.width / 2,
            y: rect.top
        };
    }

    /**
     * When horizontal is true / false, returns middle of the right / bottom side of the rectangle.
     */
    after(rect: DOMRect, horizontal: boolean) {
        return horizontal ? {
            x: rect.left + rect.width,
            y: rect.top + rect.height / 2
        } : {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height
        };
    }

    closestIndex(position: { x, y }) {
        let minDist = 999999;
        let index = -1;
        for (let i = 0; i < this.magnets.length; i++) {
            let magnet = this.magnets[i];
            let dist = Math.sqrt(Math.pow(magnet.x - position.x, 2) + Math.pow(magnet.y - position.y, 2));
            if (dist < minDist) {
                minDist = dist;
                index = i;
            }
        }
        return index;
    }

}