import type {
  DnDComponent,
  DnDNativeEvent,
  DragData,
  DragType,
  Point
} from '../types';

export class DnDEvent {
    type: DragType = null;
    data: DragData = null;
    top: DnDComponent = null;
    previousTop: DnDComponent = null;
    source: DnDComponent = null;
    position: Point | null = null;
    success: boolean | null = null;
    native: DnDNativeEvent = null;
}

export class ReorderEvent {
    from: number;
    to: number;
    locked: number[];

    constructor (from: number, to: number, locked: number[] = []) {
      this.from = from;
      this.to = to;
      this.locked = locked;
    }

    apply<T> (array: T[]) {
      if (this.locked.length > 0) {
        const locked = new Set(this.locked);
        if (locked.has(this.from)) return;
        const movable = array.filter((_, index) => !locked.has(index));
        const lockedBefore = (index: number) => this.locked.filter(lockedIndex => lockedIndex < index).length;
        const from = this.from - lockedBefore(this.from);
        let to = this.to - lockedBefore(this.to);
        if (locked.has(this.to) && this.from > this.to) to--;
        to = Math.max(0, Math.min(movable.length - 1, to));
        const item = movable[from];
        movable.splice(from, 1);
        movable.splice(to, 0, item);
        let movableIndex = 0;
        for (let index = 0; index < array.length; index++) {
          if (!locked.has(index)) array[index] = movable[movableIndex++];
        }
        return;
      }

      const temp = array[this.from];
      array.splice(this.from, 1);
      array.splice(this.to, 0, temp);
    }

}

export class InsertEvent {
    type: DragType;
    data: DragData;
    index: number;

    constructor (type: DragType, data: DragData, index: number) {
      this.type = type;
      this.data = data;
      this.index = index;
    }
}
