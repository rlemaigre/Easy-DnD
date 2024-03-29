export default class Grid {
    reference;
    referenceOriginalPosition;
    magnets = [];

    constructor (collection, upToIndex, direction, fromIndex) {
      this.reference = collection.item(0).parentNode;
      this.referenceOriginalPosition = {
        x: this.reference.getBoundingClientRect().left - this.reference.scrollLeft,
        y: this.reference.getBoundingClientRect().top - this.reference.scrollTop,
      };
      let index = 0;
      for (const child of collection) {
        if (index > upToIndex) break;
        const rect = child.getBoundingClientRect();
        const hasNestedDrop = child.classList.contains('dnd-drop') || child.getElementsByClassName('dnd-drop').length > 0;
        let horizontal = false;
        if (hasNestedDrop) {
          if (direction === 'auto') {
            // Auto mode not supported for now. Row or column must be defined explicitly if there are nested drop lists.
            throw 'Easy-DnD error : a drop list is missing one of these attributes : \'row\' or \'column\'.';
          }
          else {
            horizontal = direction === 'row';
          }
        }
        if (fromIndex === null) {
          // Inserting mode.
          this.magnets.push(hasNestedDrop ? this.before(rect, horizontal) : this.center(rect));
        }
        else {
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
    center (rect) {
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    /**
     * When horizontal is true / false, returns middle of the left / top side of the rectangle.
     */
    before (rect, horizontal) {
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
    after (rect, horizontal) {
      return horizontal ? {
        x: rect.left + rect.width,
        y: rect.top + rect.height / 2
      } : {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height
      };
    }

    /**
     * In case the user scrolls during the drag, the position of the magnets are not what they used to be when the drag
     * started. A correction must be applied that takes into account the amount of scroll. This correction is the
     * difference between the current position of the parent element and its position when the drag started.
     */
    correction () {
      return {
        x: this.reference.getBoundingClientRect().left  - this.reference.scrollLeft - this.referenceOriginalPosition.x,
        y: this.reference.getBoundingClientRect().top - this.reference.scrollTop - this.referenceOriginalPosition.y,
      };
    }

    closestIndex (position) {
      const x = position.x - this.correction().x;
      const y = position.y - this.correction().y;
      let minDist = 999999;
      let index = -1;
      for (let i = 0; i < this.magnets.length; i++) {
        const magnet = this.magnets[i];
        const dist = Math.sqrt(Math.pow(magnet.x - x, 2) + Math.pow(magnet.y - y, 2));
        if (dist < minDist) {
          minDist = dist;
          index = i;
        }
      }
      return index;
    }
}
